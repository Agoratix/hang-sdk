import Web3 from 'web3';

export const MINT_STATUSES = {
  NOT_INITIATED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
};

export const CHAIN_CURRENCIES = {
  ethereum: 'ETH',
  solana: 'SOL',
  matic: 'MATIC',
};

export interface IChain {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const networkMap: Record<number, IChain> = {
  137: {
    chainId: Web3.utils.toHex(137),
    chainName: 'Polygon Mainnet (Matic)',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://www.polygonscan.com/'],
  },
  80001: {
    chainId: Web3.utils.toHex(80001),
    chainName: 'Polygon Testnet (Matic)',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};

export const CONTRACT_PLATFORMS = {
  ETHEREUM: 'ethereum',
  SOLANA: 'solana',
};
