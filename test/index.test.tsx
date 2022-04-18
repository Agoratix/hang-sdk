import { HangWalletPlugin } from '../src';

describe('Thing', () => {
  let hangsdk: HangWalletPlugin;

  beforeEach(() => {
    hangsdk = new HangWalletPlugin('something');
  });

  it('renders without crashing', () => {
    expect(hangsdk.projectData).toBeFalsy();
  });
});
