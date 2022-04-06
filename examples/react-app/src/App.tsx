import React, { useEffect } from 'react';
import './App.css';

import { HangWalletPlugin } from 'hang-sdk';

function App() {
  const sdk = new HangWalletPlugin();

  return (
    <div>
      <button onClick={() => sdk.mint()}>Mint a token</button>
    </div>
  );
}

export default App;
