import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react'
import './polyfill'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [new PhantomWalletAdapter()]

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <ConnectionProvider endpoint="http://127.0.0.1:8899">
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <App />

          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
