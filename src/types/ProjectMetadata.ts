export interface IProjectMetadata {
  contract: {
    abi: string;
    address: string;
    chain: string;
    chain_id: number;
    id: number;
    platform: string;
    whitelist: string[];
  };
  pad_no_minted: number;
}
