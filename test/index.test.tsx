import { HangWalletPlugin } from '../src';

describe('Thing', () => {
  let hangsdk: HangWalletPlugin;

  beforeEach(() => {
    hangsdk = new HangWalletPlugin({
      slug: 'prefill-info-test-live-from-home-2021-12-08-f88d',
    });
  });

  it('renders without crashing', () => {
    expect(hangsdk.projectData).toBeFalsy();
  });
});
