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
  1: {
    chainId: Web3.utils.toHex(1),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://api.mycryptoapi.com/eth'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  3: {
    chainId: Web3.utils.toHex(3),
    chainName: 'Ropsten',
    nativeCurrency: {
      name: 'Ropsten Ether',
      symbol: 'ROP',
      decimals: 18,
    },
    rpcUrls: ['https://ropsten.infura.io/v3/'],
    blockExplorerUrls: ['https://ropsten.etherscan.io'],
  },
  4: {
    chainId: Web3.utils.toHex(4),
    chainName: 'Rinkeby Test Network',
    nativeCurrency: {
      name: 'Rinkeby Ether',
      symbol: 'RIN',
      decimals: 18,
    },
    rpcUrls: ['https://rinkeby.infura.io/v3/'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  5: {
    chainId: Web3.utils.toHex(5),
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'GOR',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
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

export const FORMATTED_ERRORS = {
  'BASE_COLLECTION/CANNOT_MINT': "General onsale hasn't started yet",
  'BASE_COLLECTION/PURCHASE_DISABLED': 'Minting is currently disabled',
  'BASE_COLLECTION/INSUFFICIENT_ETH_AMOUNT':
    'Please ensure you paid enough ETH',
  'BASE_COLLECTION/EXCEEDS_MAX_SUPPLY': 'Project sold out',
  'BASE_COLLECTION/GAS_FEE_NOT_ALLOWED':
    'Please try again without additional gas',
  'BASE_COLLECTION/EXCEEDS_INDIVIDUAL_SUPPLY':
    "You've reached the purchase limit for your wallet",
  'BASE_COLLECTION/PRESALE_INACTIVE': "Presale hasn't started yet",
  'BASE_COLLECTION/CANNOT_MINT_PRESALE':
    "Please verify you're on the presale whitelist",
};
