import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import {
  FORMATTED_ERRORS,
  networkMap,
  STG_HOST,
  PROD_HOST,
} from './utils/constants';
import { CustomEvents } from './utils/CustomEvents';
import { IProjectMetadata } from './types';

export interface IHangCoreProps {
  debug?: boolean;
  slug: string;
  mode?: 'TEST' | 'PROD';
}

export class HangCore {
  merkleRoot?: MerkleTree;
  contractInstance?: Contract;
  web3Instance: Web3;
  options: IHangCoreProps;
  events: CustomEvents;
  projectData?: IProjectMetadata;

  constructor(options: IHangCoreProps) {
    this.options = options;
    this.events = new CustomEvents();
    this.web3Instance = new Web3();
  }

  async fetchProjectMetadata() {
    try {
      const HOST =
        typeof this.options.mode === 'undefined' || this.options.mode === 'TEST'
          ? STG_HOST
          : PROD_HOST;
      const URL = `${HOST}/api/nft/${this.options.slug}`;
      const response = await fetch(URL);

      if (!response.ok) throw new Error();

      const data = await response.json();
      this.projectData = data.nft_project;

      if (!this.projectData) throw new Error();

      this.web3(
        new Web3(networkMap[this.projectData.contract.chain_id].rpcUrls[0])
      );

      this.merkleRoot = new MerkleTree(
        this.projectData.contract.whitelist,
        keccak256,
        {
          hashLeaves: true,
          sortPairs: true,
        }
      );
      this.events.emit('STATE_CHANGE', { isReady: true });
    } catch (ex) {
      this.events.emit('STATE_CHANGE', { isReady: false });
      this.events.emit('ERROR', {
        type: 'PROJECT_INFO_FETCCH_ERROR',
        message: FORMATTED_ERRORS['PROJECT_INFO_FETCCH_ERROR'],
      });
    }
  }

  web3(web3: Web3) {
    if (!this.projectData) throw 'sdk not ready';

    this.web3Instance = web3;
    this.contractInstance = new this.web3Instance.eth.Contract(
      JSON.parse(this.projectData.contract.abi),
      this.projectData.contract.address
    );
  }

  isPublicSaleActive = async () => {
    if (this.contractInstance!.methods.isPublicSaleActive) {
      return this.contractInstance!.methods.isPublicSaleActive().call();
    } else {
      return Promise.resolve(true);
    }
  };

  isPresaleActive = () => {
    return this.contractInstance!.methods.isPreSaleActive().call();
  };

  getProofForAddress = (address: string) => {
    const leaf = keccak256(address);
    const proof = this.merkleRoot?.getHexProof?.(leaf);

    return { leaf, proof };
  };

  onPreSaleAllowList = (address: string) => {
    if (this.contractInstance!.methods.onPreSaleAllowList) {
      return this.contractInstance!.methods.onPreSaleAllowList(address).call();
    } else {
      const { leaf, proof } = this.getProofForAddress(address);

      if (!proof) throw 'no proof';

      return Promise.resolve(
        this.merkleRoot?.verify?.(proof, leaf, this.merkleRoot.getHexRoot())
      );
    }
  };

  fetchTotalMintable = async () => {
    const totalMintable =
      await this.contractInstance!.methods.MAX_TOTAL_MINT().call();
    return parseInt(totalMintable);
  };

  fetchTotalMinted = async () => {
    const totalMinted =
      await this.contractInstance!.methods.totalSupply().call();
    return parseInt(totalMinted);
  };

  maxMintPerAddress = async () => {
    if (this.contractInstance!.methods.MAX_TOTAL_MINT_PER_ADDRESS) {
      const maxMint =
        await this.contractInstance!.methods.MAX_TOTAL_MINT_PER_ADDRESS().call();
      return parseInt(maxMint);
    } else {
      return Promise.resolve(10);
    }
  };

  balanceOfAddress = async (address: string) => {
    const balance = await this.contractInstance!.methods.balanceOf(
      address
    ).call();

    return parseInt(balance);
  };

  canMint = async (address: string) => {
    if (this.options.debug) console.debug('Checking if canMint');

    const publicSaleActive = await this.isPublicSaleActive();
    if (this.options.debug) console.debug('publicSaleActive', publicSaleActive);

    let presaleMode = false;

    if (!publicSaleActive) {
      if (this.options.debug) console.debug('When public sale inactive');

      const isPresaleActive = await this.isPresaleActive();
      if (this.options.debug) console.debug('isPresaleActive', isPresaleActive);

      if (!isPresaleActive) {
        if (this.options.debug) console.debug('Presale inactive');

        this.events.emit('ERROR', {
          type: 'BASE_COLLECTION/PRESALE_INACTIVE',
          message: FORMATTED_ERRORS['BASE_COLLECTION/PRESALE_INACTIVE'],
        });

        return Promise.reject({
          custom: FORMATTED_ERRORS['BASE_COLLECTION/PRESALE_INACTIVE'],
        });
      }

      if (this.options.debug) console.debug('Checking if on presale list');
      const onPresaleList = await this.onPreSaleAllowList(address);
      if (this.options.debug) console.debug('onPresaleList', onPresaleList);

      if (!onPresaleList) {
        this.events.emit('ERROR', {
          type: 'BASE_COLLECTION/CANNOT_MINT_PRESALE',
          message: FORMATTED_ERRORS['BASE_COLLECTION/CANNOT_MINT_PRESALE'],
        });
        return Promise.reject({
          custom: FORMATTED_ERRORS['BASE_COLLECTION/CANNOT_MINT_PRESALE'],
        });
      }

      presaleMode = true;
    }

    if (this.options.debug)
      console.debug('Checking total supply and total minted');

    const totalSupply = await this.fetchTotalMintable();
    const totalMinted = await this.fetchTotalMinted();

    if (this.options.debug) console.debug('totalSupply', totalSupply);
    if (this.options.debug) console.debug('totalMinted', totalMinted);

    if (totalSupply == totalMinted) {
      this.events.emit('ERROR', {
        type: 'BASE_COLLECTION/EXCEEDS_MAX_SUPPLY',
        message: FORMATTED_ERRORS['BASE_COLLECTION/EXCEEDS_MAX_SUPPLY'],
      });

      return Promise.reject({
        custom: FORMATTED_ERRORS['BASE_COLLECTION/EXCEEDS_MAX_SUPPLY'],
      });
    }

    if (!presaleMode) return Promise.resolve(presaleMode);

    if (this.options.debug)
      console.debug('Checking maxPerAddress and addressBalance');

    const maxPerAddress = await this.maxMintPerAddress();
    const addressBalance = await this.balanceOfAddress(address);

    if (this.options.debug) console.debug('maxPerAddress', maxPerAddress);
    if (this.options.debug) console.debug('addressBalance', addressBalance);

    return addressBalance < maxPerAddress
      ? Promise.resolve(presaleMode)
      : (() => {
          this.events.emit('ERROR', {
            type: 'BASE_COLLECTION/EXCEEDS_INDIVIDUAL_SUPPLY',
            message:
              FORMATTED_ERRORS['BASE_COLLECTION/EXCEEDS_INDIVIDUAL_SUPPLY'],
          });

          Promise.reject({
            custom:
              FORMATTED_ERRORS['BASE_COLLECTION/EXCEEDS_INDIVIDUAL_SUPPLY'],
          });
        })();
  };

  fetchCurrentPrice = () => {
    return this.contractInstance!.methods.PRICE().call();
  };

  mintTo = async (quantity: number = 1, address: string) => {
    return this.canMint(address).then(async (presaleMode) => {
      const priceFromContract = await this.fetchCurrentPrice();
      const priceBig = new BigNumber(priceFromContract);
      const quantityBig = new BigNumber(quantity);

      if (this.options.debug) console.debug('presaleMode', presaleMode);
      if (this.options.debug)
        console.debug('priceFromContract', priceFromContract);

      if (presaleMode && this.contractInstance!.methods.earlyPurchase) {
        if (this.options.debug) console.debug('Early purchase flow');

        const { proof } = this.getProofForAddress(address);
        return this.contractInstance!.methods.earlyPurchase(
          quantity,
          proof
        ).send(
          {
            from: address,
            value: priceBig.multipliedBy(quantityBig).toString(),
          },
          this.postConfirm
        );
      } else {
        if (this.options.debug) console.debug('General purchase flow');

        return this.contractInstance!.methods.purchase(quantity).send(
          {
            from: address,
            value: priceBig.multipliedBy(quantityBig).toString(),
          },
          this.postConfirm
        );
      }
    });
  };

  postConfirm = async (error: any, transactionHash: string) => {
    if (error) {
      return this.events.emit('ERROR', {
        type: error.message,
        message: 'Failed to submit transaction',
      });
    }

    this.events.emit('TRANSACTION_SUBMITTED', {
      transactionHash,
    });

    let receipt = await this.getTransactionReceiptMined(transactionHash);
    if (receipt.transactionHash) {
      receipt = await this.getTransactionReceiptMined(receipt.transactionHash);
    }
    this.events.emit('TRANSACTION_COMPLETED', { receipt });
    return;
  };

  getTransactionReceiptMined = (
    txHash: string,
    interval: number = 500
  ): any => {
    const self = this.web3Instance.eth;
    const transactionReceiptAsync = function (resolve: any, reject: any) {
      self.getTransactionReceipt(txHash, (error, receipt) => {
        if (error) {
          reject(error);
        } else if (receipt == null) {
          setTimeout(() => transactionReceiptAsync(resolve, reject), interval);
        } else {
          resolve(receipt);
        }
      });
    };

    if (Array.isArray(txHash)) {
      return Promise.all(
        txHash.map((oneTxHash) =>
          this.getTransactionReceiptMined(oneTxHash, interval)
        )
      );
    } else if (typeof txHash === 'string') {
      return new Promise(transactionReceiptAsync);
    } else {
      throw new Error('Invalid Type: ' + txHash);
    }
  };

  fetchTotalMintedPadded = async () => {
    const totalMinted = await this.fetchTotalMinted();
    return totalMinted + (Number(this.projectData?.pad_no_minted) || 0);
  };

  fetchCurrentPriceFormatted = async () => {
    const currentPrice = await this.fetchCurrentPrice();
    return Web3.utils.fromWei(currentPrice);
  };
}
