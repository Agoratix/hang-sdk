import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import { Home, Coinbase } from './screens';

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/coinbase-sdk">Coinbase SDK</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/coinbase-sdk" element={<Coinbase />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
