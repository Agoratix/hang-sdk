export interface ICrossMintOptions {
  presale: string;
  onsale: string;
}

export interface IProjectMetadata {
  contract: {
    abi: string;
    address: string;
    chain: string;
    chain_id: number;
    id: number;
    platform: string;
    whitelist: string[];
    crossmint?: ICrossMintOptions;
  };
  pad_no_minted: number;
  enable_crossmint_checkout: boolean;
  collection_label: string;
  info: {
    title: string;
    image: string;
  };
  presale_price: string;
  price: string;
}
