import Web3 from 'web3';
import events from "events";
import { BigNumber } from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { IProjectMetadata } from './types';

const abi =
  '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"string","name":"baseTokenURI","type":"string"},{"internalType":"uint256[]","name":"numericValues","type":"uint256[]"},{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"address[]","name":"payees","type":"address[]"},{"internalType":"uint256[]","name":"shares","type":"uint256[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ERC20PaymentReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"addr","type":"address"},{"indexed":true,"internalType":"uint256","name":"atPrice","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"count","type":"uint256"}],"name":"EarlyPurchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"PayeeAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PaymentReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"addr","type":"address"},{"indexed":true,"internalType":"uint256","name":"atPrice","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"count","type":"uint256"}],"name":"Purchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"_baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxTxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_merkleRoot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_preSaleTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_presaleMaxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_presalePrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_publicSaleTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"payee","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address payable","name":"account","type":"address"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"released","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"released","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"shares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"totalReleased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalReleased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalShares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive","payable":true},{"inputs":[{"internalType":"uint256","name":"publicSaleTime","type":"uint256"},{"internalType":"uint256","name":"preSaleTime","type":"uint256"},{"internalType":"uint256","name":"maxPerAddress","type":"uint256"},{"internalType":"uint256","name":"presaleMaxPerAddress","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"presalePrice","type":"uint256"},{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"uint256","name":"maxTxPerAddress","type":"uint256"}],"name":"setSaleInformation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseUri","type":"string"}],"name":"setBaseUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"}],"name":"setMerkleRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"count","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"earlyPurchase","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[],"name":"isPublicSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"isPreSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"onEarlyPurchaseList","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"MAX_TOTAL_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"MAX_TOTAL_MINT_PER_ADDRESS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}]';

interface IHangCoreProps {
  debug?: boolean;
  slug: string;
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
  merkleRoot?: MerkleTree;
  contractInstance?: Contract;
  web3Instance: Web3;
  options: IHangCoreProps;
  events: events.EventEmitter;
  projectData?: IProjectMetadata;

  constructor(web3Instance: Web3, options: IHangCoreProps) {
    this.options = options;
    this.events = new events.EventEmitter();
    this.web3Instance = web3Instance;
  }

  async fetchProjectMetadata(_: string) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.projectData = {
      contract: {
        abi,
        address: '0xAB5a5aD2978204d0dD9F02d85b8DF60cA5977605',
        chain: 'mumbai',
        chain_id: 80001,
        id: 1,
        platform: 'ethereum',
        whitelist: [],
      },
      pad_no_minted: 0,
    };
    this.merkleRoot = new MerkleTree(
      this.projectData.contract.whitelist,
      keccak256,
      {
        hashLeaves: true,
        sortPairs: true,
      }
    );
    this.events.emit('state-change');
  }

  contract = () => {
    if (!this.projectData) throw 'sdk not ready';

    this.contractInstance =
      this.contractInstance ||
      new this.web3Instance.eth.Contract(
        JSON.parse(this.projectData.contract.abi),
        this.projectData.contract.address
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
    const proof = this.merkleRoot?.getHexProof?.(leaf);

    return { leaf, proof };
  };

  onPreSaleAllowList = (address: string) => {
    if (this.contract().methods.onPreSaleAllowList) {
      return this.contract().methods.onPreSaleAllowList(address).call();
    } else {
      const { leaf, proof } = this.getProofForAddress(address);

      if (!proof) throw 'no proof';

      return Promise.resolve(
        this.merkleRoot?.verify?.(proof, leaf, this.merkleRoot.getHexRoot())
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

  mintTo = async (quantity: number = 1, address: string) => {
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
