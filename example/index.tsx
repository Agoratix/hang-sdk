import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../.';

const App = () => {
  const instance = new Test();
  instance.call();

  return (
    <div />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
