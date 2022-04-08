import React, { useState } from 'react';
import './App.css';

import { HangWalletPlugin } from 'hang-sdk';

function App() {
  const [quantity, setQuantity] = useState<number>(1);
  const sdk = new HangWalletPlugin('some-project-slug');

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
      <button onClick={() => sdk.mint(quantity)}>Mint a token</button>
    </div>
  );
}

export default App;
