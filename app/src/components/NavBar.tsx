import { Box, Button, ButtonGroup, Flex, Heading, Spacer, useColorMode } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "./Wallet"

const NavBar = () => {
  const wallet = useWallet();
  const { colorMode, toggleColorMode } = useColorMode()

  return (<>
    <Flex boxShadow='md' p={5}>
      <Box p='2'>
        <Heading size='md'>Multisign App</Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap='2'>
        <Button onClick={toggleColorMode} size='lg'>
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
        <Box>
          <Wallet />
        </Box>
      </ButtonGroup>

    </Flex>
  </>)
}

export default NavBar