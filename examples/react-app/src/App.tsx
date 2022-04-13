import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import { HangWalletPlugin } from 'hang-sdk';

function App() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const sdk = useMemo(() => new HangWalletPlugin('some-project-slug'), []);

  useEffect(() => {
    sdk.events.on('STATE_CHANGE', async (params) => {
      setIsReady(params.isReady);
      const totalMintable = await sdk.fetchTotalMintable();
      const currentPrice = await sdk.fetchCurrentPriceFormatted();
      const totalMinted = await sdk.fetchTotalMintedPadded();
      console.log({ totalMintable, currentPrice, totalMinted });
    });
    sdk.events.on('ERROR', (params) => {
      console.log(params);
    });
    sdk.events.on('TRANSACTION_SUBMITTED', (params) =>
      console.log('TRANSACTION_SUBMITTED', params)
    );
    sdk.events.on('TRANSACTION_COMPLETED', (params) =>
      console.log('TRANSACTION_COMPLETED', params)
    );
    sdk.events.on('WALLET_CONNECTED', async (params) => {
      console.log('WALLET_CONNECTED', params)
      const balance = await sdk.balanceOfCurrentWallet();
      console.log({ balance });
    });

    return () => {
      sdk.events.removeAllListeners();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: '100vh',
      }}
    >
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      <button onClick={() => sdk.mint(quantity)}>
        {isReady ? 'Mint a token' : 'Getting things ready'}
      </button>
    </div>
  );
}

export default App;
