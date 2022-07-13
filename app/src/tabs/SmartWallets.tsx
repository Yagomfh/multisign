import { CopyIcon } from "@chakra-ui/icons"
import { Avatar, Badge, Box, Button, Flex, Heading, HStack, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast, VStack, Wrap } from "@chakra-ui/react"
import { ProgramAccount, Wallet } from "@project-serum/anchor"
import { IdlTypes, TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import CreateSmartWallet from "../components/CreateSmartWallet"
import { fetchWallets } from "../services/programAPI"

const SmartWallets = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const wallet = useWallet()
  const [smartWallets, setSmartWallets] = useState<ProgramAccount<TypeDef<any, IdlTypes<any>>>[]>([])

  const fetchData = async () => {
    const wallets = await fetchWallets(wallet as unknown as Wallet)
    wallets?.length && setSmartWallets(wallets)
  }

  useEffect(() => {
    fetchData()
  }, [wallet])

  return (<>
    <VStack>
      <Button w={"100%"} onClick={onOpen} mb={10}>Create Smart Wallet</Button>
      {smartWallets.map((sm, i) =>
        <VStack boxShadow='md' width={"80%"} p='6' rounded='md' bg='whiteAlpha.50' key={`smart-wallet-${i}`} alignItems={'flex-start'}>
          <Flex>
            <Heading as='h4' size='md' mb={4}>
              Smart Wallet #{i + 1} - {sm.publicKey.toBase58().substring(0, 30)}...
            </Heading>
            <IconButton aria-label='Search database' variant='outline' onClick={() => {
              navigator.clipboard.writeText(sm.publicKey.toBase58())
              toast({
                title: 'Copied!',
                status: 'success',
                duration: 1000,
                isClosable: true,
              })
            }} icon={<CopyIcon />} />
          </Flex>
          <Box border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"100%"}>
            <Text>Threshold: {sm.account.threshold.toString()}</Text>
          </Box>
          <VStack border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"100%"}>
            <Text>Owners:</Text>
            {sm.account.owners.map((o: any) => {
              return <Flex>
                <Avatar size='xs' name={o.toBase58()} mr={2} />
                <Badge colorScheme='purple' key={o.toBase58()}>{o.toBase58()}</Badge>
              </Flex>
            })}
          </VStack>
        </VStack>
      )}
    </VStack>
    <CreateSmartWallet isOpen={isOpen} onClose={onClose} fetchNewData={fetchData} />
  </>)
}

export default SmartWallets