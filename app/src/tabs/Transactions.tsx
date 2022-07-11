import { CheckCircleIcon, CloseIcon } from "@chakra-ui/icons"
import { Avatar, Badge, Box, Button, ButtonGroup, Flex, Heading, Spacer, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { ProgramAccount, Wallet } from "@project-serum/anchor"
import { IdlTypes, TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import CreateTransaction from "../components/CreateTransaction"
import { acceptTransaction, executeTransaction, fetchTransactions, fetchWallets, rejectTransaction } from "../services/programAPI"

const Transactions = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const wallet = useWallet()
  const [transactions, setTransactions] = useState<ProgramAccount<TypeDef<any, IdlTypes<any>>>[]>([])
  const [smartWallets, setSmartWallets] = useState<ProgramAccount<TypeDef<any, IdlTypes<any>>>[]>([])

  const fetchSmartWallets = async () => {
    const wallets = await fetchWallets(wallet as unknown as Wallet)
    wallets?.length && setSmartWallets(wallets)
  }

  const fetchData = async () => {
    const txs = await fetchTransactions(wallet as unknown as Wallet)
    txs?.length && setTransactions(txs)
  }

  const getThreshold = (pubkey: string) => {
    const smartWallet = smartWallets.find(sw =>
      sw.publicKey.toBase58() == pubkey
    )
    return smartWallet?.account.threshold.toString() || ''
  }

  const signersToObject = (tx: ProgramAccount<TypeDef<any, IdlTypes<any>>>) => {
    const smartWallet = smartWallets.find(sw =>
      sw.publicKey.toBase58() == tx.account.smartWallet.toBase58()
    )
    const res = []
    for (let i = 0; i < smartWallet?.account.owners.length; i++) {
      res.push({
        pubkey: smartWallet?.account.owners[i].toBase58(),
        signed: tx.account.signers[i]
      })
    }
    return res
  }

  useEffect(() => {
    fetchSmartWallets()
    fetchData()
  }, [wallet])

  return (<>
    <VStack>
      <Button w={"100%"} onClick={onOpen} mb={10}>Create Transaction</Button>
      {transactions.map((tx, i) =>
        <VStack boxShadow='md' width={"80%"} p='6' rounded='md' bg='whiteAlpha.50' key={`wart-wallet-${i}`} alignItems={'flex-start'}>
          <Flex w={"100%"} mb={4}>
            <Heading as='h4' size='md'>
              Transaction - {tx.publicKey.toBase58().substring(0, 30)}...
            </Heading>
            <Spacer />
            {tx.account.didExecute && <Flex alignItems={'center'}>
              <CheckCircleIcon mr={4} />
              <Text>Transaction Executed</Text>
            </Flex>}
          </Flex>
          <Box border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"100%"}>
            <Text>Proposed by: {tx.account.proposer.toString().substring(0, 30)}...</Text>
          </Box>
          <Flex width={"100%"}>
            <Box border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"49%"}>
              <Text>Total approved: {tx.account.signers.filter((s: boolean) => s == true).length}</Text>
            </Box>
            <Spacer />
            <Box border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"49%"}>
              <Text>{`Threshold: ${getThreshold(tx.account.smartWallet.toBase58())}`}</Text>
            </Box>
          </Flex>
          <Box border='1px' borderColor='gray.600' rounded='md' p={6} alignItems={'flex-start'} w={"100%"}>
            {signersToObject(tx).map((x, i) => <Box key={i}>
              <Flex alignItems={'center'}>
                {x.signed ? <CheckCircleIcon mr={4} /> : <CloseIcon mr={4} />}
                <Text>{x.pubkey}</Text>
              </Flex>
            </Box>)}
          </Box>
          {!tx.account.didExecute && <ButtonGroup spacing='6'>
            <Button colorScheme='green' onClick={() => acceptTransaction(
              wallet as unknown as Wallet,
              tx.publicKey.toBase58(),
              tx.account.smartWallet.toBase58(),
              () => {
                fetchData()
              }
            )}>Accept</Button>
            <Button colorScheme='red' onClick={() => rejectTransaction(
              wallet as unknown as Wallet,
              tx.publicKey.toBase58(),
              tx.account.smartWallet.toBase58(),
              () => {
                fetchData()
              }
            )}>Reject</Button>
            <Button colorScheme='purple' onClick={() => executeTransaction(
              wallet as unknown as Wallet,
              tx.publicKey.toBase58(),
              tx.account.smartWallet.toBase58(),
              () => {
                fetchData()
              }
            )}>Execute</Button>
          </ButtonGroup>}
        </VStack>
      )}
    </VStack>
    <CreateTransaction smartWallets={smartWallets.map(sw => sw.publicKey.toBase58())} isOpen={isOpen} onClose={onClose} fetchNewData={fetchData} />
  </>)
}

export default Transactions