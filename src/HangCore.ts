import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { FORMATTED_ERRORS, networkMap } from './utils/constants';
import { CustomEvents } from './utils/CustomEvents';
import { IProjectMetadata } from './types';

const abi =
  '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"string","name":"baseTokenURI","type":"string"},{"internalType":"uint256[]","name":"numericValues","type":"uint256[]"},{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"address[]","name":"payees","type":"address[]"},{"internalType":"uint256[]","name":"shares","type":"uint256[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ERC20PaymentReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"addr","type":"address"},{"indexed":true,"internalType":"uint256","name":"atPrice","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"count","type":"uint256"}],"name":"EarlyPurchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"PayeeAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PaymentReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"addr","type":"address"},{"indexed":true,"internalType":"uint256","name":"atPrice","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"count","type":"uint256"}],"name":"Purchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"_baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_maxTxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_merkleRoot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_preSaleTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_presaleMaxPerAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_presalePrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"_publicSaleTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"payee","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address payable","name":"account","type":"address"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"released","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"released","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"shares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"totalReleased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalReleased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalShares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive","payable":true},{"inputs":[{"internalType":"uint256","name":"publicSaleTime","type":"uint256"},{"internalType":"uint256","name":"preSaleTime","type":"uint256"},{"internalType":"uint256","name":"maxPerAddress","type":"uint256"},{"internalType":"uint256","name":"presaleMaxPerAddress","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"presalePrice","type":"uint256"},{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"uint256","name":"maxTxPerAddress","type":"uint256"}],"name":"setSaleInformation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseUri","type":"string"}],"name":"setBaseUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"}],"name":"setMerkleRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"count","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"earlyPurchase","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[],"name":"isPublicSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"isPreSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"onEarlyPurchaseList","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"MAX_TOTAL_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"MAX_TOTAL_MINT_PER_ADDRESS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}]';

interface IHangCoreProps {
  debug?: boolean;
  slug: string;
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

  async fetchProjectMetadata(_: string) {
    // TODO: fetch data from new endpoint
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
    const totalMintable = await this.contractInstance!.methods.MAX_TOTAL_MINT().call();
    return parseInt(totalMintable);
  };

  fetchTotalMinted = async () => {
    const totalMinted = await this.contractInstance!.methods.totalSupply().call();
    return parseInt(totalMinted);
  };

  maxMintPerAddress = async () => {
    if (this.contractInstance!.methods.MAX_TOTAL_MINT_PER_ADDRESS) {
      const maxMint = await this.contractInstance!
        .methods.MAX_TOTAL_MINT_PER_ADDRESS()
        .call();
      return parseInt(maxMint);
    } else {
      return Promise.resolve(10);
    }
  };

  balanceOfAddress = async (address: string) => {
    const balance = await this.contractInstance!.methods.balanceOf(address).call();

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
        return this.contractInstance!
          .methods.earlyPurchase(quantity, proof)
          .send(
            {
              from: address,
              value: priceBig.multipliedBy(quantityBig).toString(),
            },
            this.postConfirm
          );
      } else {
        if (this.options.debug) console.debug('General purchase flow');

        return this.contractInstance!
          .methods.purchase(quantity)
          .send(
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
    return totalMinted + (Number(this.projectData?.pad_no_minted) || 0)
  }

  fetchCurrentPriceFormatted = async () => {
    const currentPrice = await this.fetchCurrentPrice();
    return Web3.utils.fromWei(currentPrice);
  }
}
