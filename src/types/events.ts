import { FORMATTED_ERRORS } from '../utils/constants';

export interface IStateChangeEventParams {
  isReady: boolean;
}

export interface IErrorEventParams {
  type: keyof typeof FORMATTED_ERRORS;
  message: string;
}

export interface ITransactionSubmittedEventParams {
  transactionHash: string;
}

export interface ITransactionCompletedEventParams {
  receipt: any;
}

export interface IWalletConnectedEventParams {
  address: string;
}
