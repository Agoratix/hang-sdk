import React from 'react';
import ReactDOM from 'react-dom';

export class Test {
  constructor() {
    console.log('Ready steady');
  }

  call() {
    const elementId = 'hangNft';
    const rootElem = document.createElement('div');
    rootElem.setAttribute('id', elementId);
    document.body.appendChild(rootElem);

    ReactDOM.render(
      <div
        id="iCameOutOfNoWhere"
        style={{ backgroundColor: 'black', width: 100, height: 100 }}
      />,
      document.getElementById(elementId)
    );
  }
}
