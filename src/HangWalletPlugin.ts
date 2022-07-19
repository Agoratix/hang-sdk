import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { ICoreOptions, IProviderOptions } from 'web3modal';

import { networkMap } from './utils';
import { HangCore, IHangCoreProps } from './HangCore';
import { INFURA_ID } from './utils';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const SKIPPED = 'skipped';
const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
  walletlink: {
    package: CoinbaseWalletSDK,
    options: {
      infuraId: INFURA_ID,
    },
  },
};

export interface IHangWalletPluginOptions extends IHangCoreProps {
  web3ModalOptions?: Partial<ICoreOptions>;
}

export class HangWalletPlugin extends HangCore {
  accounts?: string[];
  provider?: any;
  web3Modal: Web3Modal;

  constructor({ slug, web3ModalOptions, ...args }: IHangWalletPluginOptions) {
    super({ slug, ...args });
    this.fetchProjectMetadata();
    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      ...web3ModalOptions,
    });
  }

  autoconnect = async () => {
    if (this.web3Modal.cachedProvider) {
      this.provider = this.provider || (await this.web3Modal.connect());
      this.web3(new Web3(this.provider));
      await this.onConnectComplete();
      return Promise.resolve();
    } else {
      return Promise.reject(SKIPPED);
    }
  };

  connect = async (): Promise<void> => {
    try {
      this.provider = await this.web3Modal.connect();
      this.web3(new Web3(this.provider));
      await this.onConnectComplete();
    } catch (e) {
      Promise.reject(e);
    }
  };

  onConnectComplete = async () => {
    if (!this.web3Instance.eth) return;

    await this.requestChainSwitchIfNeeded();
    await this.syncAccountAndContract();
    this.events.emit('WALLET_CONNECTED', { address: this.getCurrentWallet() });
    this.addProviderEvents();
  };

  syncAccountAndContract = async () => {
    await this.fetchAccountData();
  };

  fetchAccountData = async () => {
    // Get list of accounts of the connected wallet
    const accounts = await this.web3Instance.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    this.accounts = accounts;
  };

  addProviderEvents = () => {
    this.provider!.on('accountsChanged', async () => {
      await this.syncAccountAndContract();
      this.events.emit('WALLET_CHANGED', null);
    });
  };

  getCurrentWallet = () => {
    return this.accounts?.[0] || '';
  };

  requestChainSwitchIfNeeded = async () => {
    if (!this.projectData) return;

    const currentChain = await this.web3Instance.eth.getChainId();

    if (this.projectData.contract.chain_id != currentChain) {
      try {
        // @ts-ignore
        await this.web3Instance?.currentProvider?.request({
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
        await this.web3Instance.currentProvider.request({
          method: 'wallet_addEthereumChain',
          params: [networkMap[this.projectData.contract.chain_id]],
        });

        // @ts-ignore: check later
        await this.web3Instance.currentProvider.request({
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
    await this.mintTo(quantity, this.getCurrentWallet());
  }

  async balanceOfCurrentWallet() {
    return this.balanceOfAddress(this.getCurrentWallet());
  }
}
