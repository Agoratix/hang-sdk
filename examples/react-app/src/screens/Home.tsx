import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Flex,
  List,
  ListIcon,
  ListItem,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
} from '@chakra-ui/react';
import {
  ArrowForwardIcon,
  CheckCircleIcon,
  InfoIcon,
  LockIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import {
  HangWalletPlugin,
  IStateChangeEventParams,
  ITransactionCompletedEventParams,
  IWalletConnectedEventParams,
  IErrorEventParams,
  ITransactionSubmittedEventParams,
} from 'hang-sdk';

interface IMetadata {
  totalMintable: number;
  totalMinted: number;
  currentPrice: string;
  balance?: number;
}

export const Home = () => {
  const [loadingText, setLoadingText] = useState<string>(
    'Getting things ready'
  );
  const [metadata, setMetadata] = useState<IMetadata>({
    totalMintable: -1,
    totalMinted: -1,
    currentPrice: ''
  });
  const [events, setEvents] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [crossMintEnabled, setCrossMintEnabled] = useState<boolean>(false);
  const params = new URLSearchParams(window.location.search);
  const sdkSlug = params.get('slug') || 'hang-brand-example-2023-07-05-d5b9'
  const sdkMode = params.get('test') ? 'TEST' : 'PROD'
  const sdk = useMemo(
    () =>
      new HangWalletPlugin({
        slug: sdkSlug,
        mode: sdkMode
      }),
    []
  );

  const handleUpdateBalance = useCallback(async () => {
    const balance = await sdk.balanceOfCurrentWallet();
    setMetadata((prevState) => ({ ...prevState, balance }));

    // Polling every minute to update the balance
    setTimeout(handleUpdateBalance, 15 * 1000);
  }, [sdk]);

  const handleStateChange = useCallback(
    async ({ isReady }: IStateChangeEventParams) => {
      setLoadingText(isReady ? '' : 'Unable to initialize sdk');
      setEvents((prevState) =>
        prevState.concat({
          name: 'STATE_CHANGE',
          params: { isReady },
          as: InfoIcon,
          color: 'green.500',
        })
      );
      const totalMintable = await sdk.fetchTotalMintable();
      const currentPrice = await sdk.fetchCurrentPriceFormatted();
      const totalMinted = await sdk.fetchTotalMintedPadded();
      const crossMintEnabled = await sdk.crossMintEnabled();

      setMetadata((prevState) => ({
        ...prevState,
        totalMintable,
        currentPrice,
        totalMinted
      }));
      setCrossMintEnabled(crossMintEnabled);
    },
    [sdk]
  );

  const handleError = useCallback((params: IErrorEventParams) => {
    setEvents((prevState) =>
      prevState.concat({
        name: 'ERROR',
        params,
        as: WarningIcon,
        color: 'red.500',
      })
    );
    setLoadingText('');
  }, []);

  const handleTransactionSubmitted = useCallback(
    (params: ITransactionSubmittedEventParams) => {
      setEvents((prevState) =>
        prevState.concat({
          name: 'TRANSACTION_SUBMITTED',
          params,
          as: ArrowForwardIcon,
          color: 'green.500',
        })
      );
      setLoadingText('Awaiting Transaction');
    },
    []
  );

  const handleTransactionCompleted = useCallback(
    async (params: ITransactionCompletedEventParams) => {
      setEvents((prevState) =>
        prevState.concat({
          name: 'TRANSACTION_COMPLETED',
          params,
          as: CheckCircleIcon,
          color: 'green.500',
        })
      );
      setLoadingText('');
    },
    []
  );

  const handleWalletConnected = useCallback(
    async (params: IWalletConnectedEventParams) => {
      setEvents((prevState) =>
        prevState.concat({
          name: 'WALLET_CONNECTED',
          params,
          as: LockIcon,
          color: 'green.500',
        })
      );
      setLoadingText('Wallet Connected');
      handleUpdateBalance();
    },
    [sdk, handleUpdateBalance]
  );

  const handleWalletChanged = useCallback(async () => {
    setEvents((prevState) =>
      prevState.concat({
        name: 'WALLET_CHANGED',
        params: {},
        as: LockIcon,
        color: 'yellow.500',
      })
    );
  }, []);

  useEffect(() => {
    sdk.events.on('STATE_CHANGE', handleStateChange);
    sdk.events.on('ERROR', handleError);
    sdk.events.on('TRANSACTION_SUBMITTED', handleTransactionSubmitted);
    sdk.events.on('TRANSACTION_COMPLETED', handleTransactionCompleted);
    sdk.events.on('WALLET_CONNECTED', handleWalletConnected);
    sdk.events.on('WALLET_CHANGED', handleWalletChanged);

    return () => {
      sdk.events.removeAllListeners();
    };
  }, []);

  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      gap={4}
      height="100vh"
      justifyContent="center"
    >
      <Flex gap={4}>
        {Object.entries(metadata).map(([key, value]) => (
          <Stat key={key}>
            <StatLabel>{key}</StatLabel>
            {value === -1 || (typeof value === 'string' && !value) ? (
              <Skeleton height={12} />
            ) : (
              <StatNumber textAlign="center">{value}</StatNumber>
            )}
          </Stat>
        ))}
      </Flex>
      <Flex
        borderColor="black"
        borderWidth={1}
        flexDirection="column"
        minHeight="xs"
        maxHeight="xs"
        maxWidth="xs"
        minWidth="xs"
        overflow="scroll"
        p={3}
      >
        <List>
          {events.map(({ name, params, ...icon }) => (
            <Tooltip label={JSON.stringify(params)} key={name}>
              <ListItem>
                <ListIcon {...icon} />
                {name}
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Flex>
      <Flex gap={4}>
        <NumberInput
          min={1}
          onChange={(valueString) => setQuantity(parseInt(valueString))}
          value={quantity}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          isLoading={!!loadingText}
          loadingText={loadingText}
          onClick={() => {
            setLoadingText('Minting');
            sdk.mint(quantity);
          }}
        >
          Mint a token
        </Button>
      </Flex>
      { crossMintEnabled && (
        <Button
          isLoading={!!loadingText}
          loadingText={loadingText}
          onClick={() => {
            sdk.crossMint(quantity);
          }}
        >
          Crossmint
        </Button>
      )}
    </Flex>
  );
};
