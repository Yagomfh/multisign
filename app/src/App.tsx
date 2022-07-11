
import { Box } from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react';
import './App.css';
import NavBar from './components/NavBar';
import Home from './pages/Home';
require('@solana/wallet-adapter-react-ui/styles.css');


function App() {
  const wallet = useWallet()
  return (
    <Box>
      <NavBar />
      {wallet.connected && <Home />}
    </Box>
  );
}

export default App;
