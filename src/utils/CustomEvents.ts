import events from 'events';

import {
  IErrorEventParams,
  IStateChangeEventParams,
  ITransactionCompletedEventParams,
  ITransactionSubmittedEventParams,
  IWalletConnectedEventParams,
} from '../types';

type CUSTOM_EVENTS = {
  ERROR: IErrorEventParams;
  STATE_CHANGE: IStateChangeEventParams;
  TRANSACTION_COMPLETED: ITransactionCompletedEventParams;
  TRANSACTION_SUBMITTED: ITransactionSubmittedEventParams;
  WALLET_CONNECTED: IWalletConnectedEventParams;
  WALLET_CHANGED: null,
};

export declare interface CustomEvents {
  on<T extends keyof CUSTOM_EVENTS, R extends CUSTOM_EVENTS[T]>(
    event: T,
    listener: (params: R) => void
  ): this;
}
export class CustomEvents extends events.EventEmitter {
  constructor() {
    super();
  }

  emit<T extends keyof CUSTOM_EVENTS, R extends CUSTOM_EVENTS[T]>(
    event: T,
    params: R
  ): boolean {
    return super.emit(event, params);
  }
}
