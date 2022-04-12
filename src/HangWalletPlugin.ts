import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { ICoreOptions, IProviderOptions } from 'web3modal';

import { networkMap } from './utils';
import { HangCore } from './HangCore';

const SKIPPED = 'skipped';
const INFURA_ID = 'd09bd1bc72e6427d80fa37e01481cd34';
const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
};

export interface IHangWalletPluginOptions {
  slug: string;
  web3ModalOptions?: Partial<ICoreOptions>;
}

export class HangWalletPlugin extends HangCore {
  accounts?: string[];
  provider?: any;
  web3Modal: Web3Modal;

  constructor(slug: string) {
    super(new Web3(), { slug: 'tya' });
    this.fetchProjectMetadata(slug);
    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    });
  }

  web3 = () => {
    this.web3Instance = this.web3Instance || new Web3(this.provider!);
    return this.web3Instance;
  };

  autoconnect = async () => {
    if (this.web3Modal.cachedProvider) {
      this.provider = this.provider || (await this.web3Modal.connect());
      await this.onConnectComplete();
      return Promise.resolve();
    } else {
      return Promise.reject(SKIPPED);
    }
  };

  connect = async (): Promise<void> => {
    try {
      this.provider = await this.web3Modal.connect();
      await this.onConnectComplete();
    } catch (e) {
      Promise.reject(e);
    }
  };

  onConnectComplete = async () => {
    if (!this.web3().eth) return;

    await this.requestChainSwitchIfNeeded();
    await this.syncAccountAndContract();
    // TODO: trigger a wallet connected event
    this.addProviderEvents();
  };

  syncAccountAndContract = async () => {
    await this.fetchAccountData();
  };

  fetchAccountData = async () => {
    // Get list of accounts of the connected wallet
    const accounts = await this.web3().eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    this.accounts = accounts;
  };

  addProviderEvents = () => {
    this.provider!.on('accountsChanged', async () => {
      await this.syncAccountAndContract();
      // TODO: trigger a wallet connected event
    });
  };

  requestChainSwitchIfNeeded = async () => {
    if (!this.projectData) return;

    const currentChain = await this.web3().eth.getChainId();

    if (this.projectData.contract.chain_id != currentChain) {
      try {
        // @ts-ignore: check later
        await this.web3().currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            { chainId: Web3.utils.toHex(this.projectData.contract.chain_id) },
          ],
        });
      } catch (e) {
        console.log('Error thrown while switching ', e);
        const networkParams = networkMap[this.projectData.contract.chain_id];
        if (!networkParams) return;

        // @ts-ignore: check later
        await this.web3().currentProvider.request({
          method: 'wallet_addEthereumChain',
          params: [networkMap[this.projectData.contract.chain_id]],
        });

        // @ts-ignore: check later
        await this.web3().currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            { chainId: Web3.utils.toHex(this.projectData.contract.chain_id) },
          ],
        });
      }
    }
  };

  async mint(quantity: number = 1) {
    if (!this.projectData) return;

    await this.connect();
    await this.mintTo(quantity, this.accounts?.[0] || '');
  }
}
