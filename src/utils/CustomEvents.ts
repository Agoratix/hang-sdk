import events from 'events';

import { FORMATTED_ERRORS } from './constants';

type CUSTOM_EVENTS = {
  STATE_CHANGE: {
    isReady: boolean;
  };
  ERROR: {
    type: keyof typeof FORMATTED_ERRORS
    message: string;
  };
  TRANSACTION_SUBMITTED: {
    transactionHash: string;
  };
  TRANSACTION_COMPLETED: {
    receipt: any;
  };
  WALLET_CONNECTED: {
    address: string;
  };
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
