import { HangCore } from './HangCore';
import { HangWalletPlugin } from './HangWalletPlugin';

export * from './HangCore';
export * from './types';
export * from './utils';
export * from './HangWalletPlugin';

// @ts-ignore
window.HangCore = HangCore;
// @ts-ignore
window.HangWalletPlugin = HangWalletPlugin;
