import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { IContractObject } from './types';

interface IHangCoreProps {
  debug?: boolean;
  contractObject: IContractObject;
}

const formattedExplanations = {
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

export class HangCore {
  merkleRoot: MerkleTree;
  contractInstance?: Contract;
  web3Instance: Web3;
  options: IHangCoreProps;

  constructor(web3Instance: Web3, options: IHangCoreProps) {
    this.options = options;
    this.web3Instance = web3Instance;
    this.merkleRoot = new MerkleTree(
      options.contractObject.whitelist,
      keccak256,
      {
        hashLeaves: true,
        sortPairs: true,
      }
    );
  }

  contract = () => {
    this.contractInstance =
      this.contractInstance ||
      new this.web3Instance.eth.Contract(
        JSON.parse(this.options.contractObject.abi),
        this.options.contractObject.address
      );
    return this.contractInstance;
  };

  isPublicSaleActive = async () => {
    if (this.contract().methods.isPublicSaleActive) {
      return this.contract().methods.isPublicSaleActive().call();
    } else {
      return Promise.resolve(true);
    }
  };

  isPresaleActive = () => {
    return this.contract().methods.isPreSaleActive().call();
  };

  getProofForAddress = (address: string) => {
    const leaf = keccak256(address);
    const proof = this.merkleRoot.getHexProof(leaf);

    return { leaf, proof };
  };

  onPreSaleAllowList = (address: string) => {
    if (this.contract().methods.onPreSaleAllowList) {
      return this.contract().methods.onPreSaleAllowList(address).call();
    } else {
      const { leaf, proof } = this.getProofForAddress(address);

      return Promise.resolve(
        this.merkleRoot.verify(proof, leaf, this.merkleRoot.getHexRoot())
      );
    }
  };

  fetchTotalMintable = async () => {
    const totalMintable = await this.contract().methods.MAX_TOTAL_MINT().call();
    return parseInt(totalMintable);
  };

  fetchTotalMinted = async () => {
    const totalMinted = await this.contract().methods.totalSupply().call();
    return parseInt(totalMinted);
  };

  maxMintPerAddress = async () => {
    if (this.contract().methods.MAX_TOTAL_MINT_PER_ADDRESS) {
      const maxMint = await this.contract()
        .methods.MAX_TOTAL_MINT_PER_ADDRESS()
        .call();
      return parseInt(maxMint);
    } else {
      return Promise.resolve(10);
    }
  };

  balanceOfAddress = async (address: string) => {
    const balance = await this.contract().methods.balanceOf(address).call();

    return parseInt(balance);
  };

  canMint = async (address: string) => {
    if (this.options.debug) console.log('Checking if canMint');

    const publicSaleActive = await this.isPublicSaleActive();
    if (this.options.debug) console.log('publicSaleActive', publicSaleActive);

    let presaleMode = false;

    if (!publicSaleActive) {
      if (this.options.debug) console.log('When public sale inactive');

      const isPresaleActive = await this.isPresaleActive();
      if (this.options.debug) console.log('isPresaleActive', isPresaleActive);

      if (!isPresaleActive) {
        if (this.options.debug) console.log('Presale inactive');

        return Promise.reject({
          custom: formattedExplanations['BASE_COLLECTION/PRESALE_INACTIVE'],
        });
      }

      if (this.options.debug) console.log('Checking if on presale list');
      const onPresaleList = await this.onPreSaleAllowList(address);
      if (this.options.debug) console.log('onPresaleList', onPresaleList);

      if (!onPresaleList)
        return Promise.reject({
          custom: formattedExplanations['BASE_COLLECTION/CANNOT_MINT_PRESALE'],
        });

      presaleMode = true;
    }

    if (this.options.debug)
      console.log('Checking total supply and total minted');

    const totalSupply = await this.fetchTotalMintable();
    const totalMinted = await this.fetchTotalMinted();

    if (this.options.debug) console.log('totalSupply', totalSupply);
    if (this.options.debug) console.log('totalMinted', totalMinted);

    if (totalSupply == totalMinted) {
      return Promise.reject({
        custom: formattedExplanations['BASE_COLLECTION/EXCEEDS_MAX_SUPPLY'],
      });
    }

    if (!presaleMode) return Promise.resolve(presaleMode);

    if (this.options.debug)
      console.log('Checking maxPerAddress and addressBalance');

    const maxPerAddress = await this.maxMintPerAddress();
    const addressBalance = await this.balanceOfAddress(address);

    if (this.options.debug) console.log('maxPerAddress', maxPerAddress);
    if (this.options.debug) console.log('addressBalance', addressBalance);

    return addressBalance < maxPerAddress
      ? Promise.resolve(presaleMode)
      : Promise.reject({
          custom:
            formattedExplanations['BASE_COLLECTION/EXCEEDS_INDIVIDUAL_SUPPLY'],
        });
  };

  fetchCurrentPrice = () => {
    return this.contract().methods.PRICE().call();
  };

  mint = async (quantity: number = 1, address: string) => {
    return this.canMint(address).then(async (presaleMode) => {
      const priceFromContract = await this.fetchCurrentPrice();
      const priceBig = new BigNumber(priceFromContract);
      const quantityBig = new BigNumber(quantity);

      if (this.options.debug) console.log('presaleMode', presaleMode);
      if (this.options.debug)
        console.log('priceFromContract', priceFromContract);

      if (presaleMode && this.contract().methods.earlyPurchase) {
        if (this.options.debug) console.log('Early purchase flow');

        const { proof } = this.getProofForAddress(address);
        return this.contract()
          .methods.earlyPurchase(quantity, proof)
          .send(
            {
              from: address,
              value: priceBig.multipliedBy(quantityBig).toString(),
            },
            () => console.log('trigger an event')
          );
      } else {
        if (this.options.debug) console.log('General purchase flow');

        return this.contract()
          .methods.purchase(quantity)
          .send(
            {
              from: address,
              value: priceBig.multipliedBy(quantityBig).toString(),
            },
            () => console.log('trigger an event')
          );
      }
    });
  };
}
