# Hang SDK

Hang SDK is on a mission to help developers create DAPPs with ease and interact with Hang deployed smart contracts.

## Requirements

- `node >= 10.0`

## Getting Started

Install the SDK
```
npm i hang-sdk
```
## Usage

Import the `HangWallet` plugin and the `Types` for the state change events that are available.

```
import {
  HangWalletPlugin,
  IStateChangeEventParams,
  ITransactionCompletedEventParams,
  IWalletConnectedEventParams,
  IErrorEventParams,
  ITransactionSubmittedEventParams,
} from 'hang-sdk';
```

Here we initialize the `SDK` with the unique project `slug` in `React`.
```
const sdk = useMemo(
    () =>
      new HangWalletPlugin({
        slug: 'prefill-info-test-live-from-home-2021-12-08-f88d',
      }),
    []
  );
```

The `SDK` now exposes set of methods that allow you to interact with the `Hang` smart contract, access account & transaction information, and listen for relevant state changes and errors. 

For instance you can:
```
// retrieve the current wallet's balance
const balance = await sdk.balanceOfCurrentWallet();

// retrieve the total available NFTs to mint
const totalMintable = await sdk.fetchTotalMintable();

// retrieve the total number of NFTs currently minted
const totalMinted = await sdk.fetchTotalMintedPadded();

// retrieve the current price of the NFT
const currentPrice = await sdk.fetchCurrentPriceFormatted();
```

Here we are using the above `SDK` methods to fetch contract related data and handling methods to update the state of the react app.
```
const handleStateChange = useCallback(
    const [metadata, setMetadata] = useState<IMetadata>({
      totalMintable: -1,
      totalMinted: -1,
      currentPrice: '',
    });
    // ...

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
      setMetadata((prevState) => ({
        ...prevState,
        totalMintable,
        currentPrice,
        totalMinted,
      }));
    },
    [sdk]
  );
  // ...

   useEffect(() => {
    sdk.events.on('STATE_CHANGE', handleStateChange);
    
    return () => {
      sdk.events.removeAllListeners();
    };
  }, []);
```

You can listen for transaction related events via the `SDK`. Below is an example where each class of event is routed throught to a handling function in React for use in the app. The output of the dispatched events are typed. You can see an example of how to import the corresponding event output types above.
```
useEffect(() => {
    sdk.events.on('ERROR', handleError);
    sdk.events.on('TRANSACTION_SUBMITTED', handleTransactionSubmitted);
    sdk.events.on('TRANSACTION_COMPLETED', handleTransactionCompleted);
    sdk.events.on('WALLET_CONNECTED', handleWalletConnected);
    sdk.events.on('WALLET_CHANGED', handleWalletChanged);

    return () => {
      sdk.events.removeAllListeners();
    };
  }, []);
```

The `SDK` defines other useful methods. Here is an example where `mint()` is called and passed a quantity of NFTs to create.
```
sdk.mint(quantity);
```

### See a working example

If you want to see how all of this comes together to form a working UI you can see a React App example [examples/react-app](examples/react-app).

To run the app, navigate to the react app directory & run:
```
npm start
```

In your browser navigate to: `http://localhost:3000/`

## SDK API

### Methods

#### HangWalletPlugin({ slug, web3ModalOptions, ...args }): HangWalletPlugin
Create an instance of the `SDK` by passing the unique project `slug` and an options object for the `web3Modal` UI. See the [available options](https://github.com/Web3Modal/web3modal) for the modal.

The project `slug` specifies which contract and network to use.

##### Example
```
const sdk = useMemo(
    () =>
      new HangWalletPlugin({
        slug: 'prefill-info-test-live-from-home-2021-12-08-f88d',
      }),
    []
  );
```

#### sdk.mint(quantity: number)
Call mint to create an NFT(s) on chain and pay for it with the funds from the connected wallet. This will trigger a transaction approval flow in the connected wallet.

##### Example
```
const quantity = 2
sdk.mint(quantity)
```

#### sdk.fetchTotalMintable() Promise`<number>`
Call `fetchTotalMintable()` to get the total number of NFTs remaining to be minted.

##### Example
```
const totalMintable = await sdk.fetchTotalMintable();
```

#### sdk.fetchCurrentPriceFormatted() Promise`<string>` 
Call `fetchCurrentPriceFormatted()` to get the price of the NFT as a formatted string.

##### Example
```
const currentPrice = await sdk.fetchCurrentPriceFormatted();
```

#### sdk.fetchCurrentPrice() Promise`<BigNumber>` 
Call `fetchCurrentPrice()` to get the price of the NFT as a number.

##### Example
```
const currentPrice = await sdk.fetchCurrentPrice();
```

#### sdk.fetchBalanceOfCurrentWallet() Promise`<number>` 
Call `fetchBalanceOfCurrentWallet()` to get the amount of `Eth` as a number.

##### Example
```
const balance = await sdk.balanceOfCurrentWallet();
```

### Events
The `SDK` dispatches 5 kinds of events.
- errors 
- transaction submissions
- transaction completions
- wallet connections
- wallet changes

#### ERROR 
This events publishes an error object with a `message` and a `type`.

Here is the list of error types which the `SDK` will dispatch.
```
PROJECT_INFO_FETCH_ERROR
CANNOT_MINT
PURCHASE_DISABLED
INSUFFICIENT_ETH_AMOUNT
EXCEEDS_MAX_SUPPLY
GAS_FEE_NOT_ALLOWED
EXCEEDS_INDIVIDUAL_SUPPLY
PRESALE_INACTIVE
CANNOT_MINT_PRESALE
```

##### Type Interface
`IErrorEventParams`

#### STATE_CHANGE 
This event publishes a single property `isReady` which you would use to determine if the `SDK` has initialized properly.

##### Type Interface
`IStateChangeEventParams`

#### TRANSACTION_SUBMITTED 
This event publishes the hash of the submitted `transactionHash` prior to the completion of transaction.

##### Type Interface
`ITransactionSubmittedEventParams`

#### TRANSACTION_COMPLETED 
This event is published upon the completion of a transaction and provides a `reciept` object which contains properies the detail the state of the completed transaction on chain.

##### Type Interface
`ITransactionCompletedEventParams`

#### TRANSACTION_COMPLETED 
This event is published upon the completion of a transaction and provides a `reciept` object which contains properies the detail the state of the completed transaction on chain.

##### Type Interface
`ITransactionCompletedEventParams`

#### WALLET_CONNECTED 
This event is published upon the completion of a transaction and provides a `reciept` object which contains properies that detail the state of the completed transaction on chain.

##### Type Interface
`IWalletConnectedEventParams`

#### WALLET_CHANGED 
This event is published when the user changes which account they have connected to the `SDK`. It will not capture if the user changes the network that the Account is to use. However the `SDK` will switch the network to the correct network when the `mint` function is called and an actual transaction is triggered. Switching networks will then require an in wallet approval from the user.

##### Type Interface
_There is no type interace for this event as no other information is passed along with the event._




## Troubleshooting

### Using Create React App & Missing Node Polyfills

To solve for missing Node Polyfills if you are using React-Scripts/Webpack v5 and above (which would be the case with a fresh install of Create React App) follow the steps below to fix this by installing [react-app-rewired](https://github.com/timarney/react-app-rewired) and adding a config which overrides the Create React App Webpack config without ejecting it.

Install `react-app-rewired`
```
npm install --save-dev react-app-rewired
````

Install the missing dependencies
```
npm install --save-dev crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process
```

In the root of the project add a config that will override the CRA Webpack config file.
```
const webpack = require('webpack'); 
module.exports = function override(config) { 
		const fallback = config.resolve.fallback || {}; 
		Object.assign(fallback, { 
    	"crypto": require.resolve("crypto-browserify"), 
      "stream": require.resolve("stream-browserify"), 
      "assert": require.resolve("assert"), 
      "http": require.resolve("stream-http"), 
      "https": require.resolve("https-browserify"), 
      "os": require.resolve("os-browserify"), 
      "url": require.resolve("url") 
      }) 
   config.resolve.fallback = fallback; 
   config.plugins = (config.plugins || []).concat([ 
   	new webpack.ProvidePlugin({ 
    	process: 'process/browser', 
      Buffer: ['buffer', 'Buffer'] 
    }) 
   ]) 
   return config; }
```

Override package.json to include the webpack configuration. Replace react-scripts with react-app-rewired scripts for start, build, & test
```
"scripts": { 
	"start": "react-app-rewired start", 
    "build": "react-app-rewired build", 
    "test": "react-app-rewired test", 
    "eject": "react-scripts eject" 
 },
 ```

