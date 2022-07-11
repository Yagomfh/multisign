import {
  Box, Button, FormLabel, HStack,
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Select, VStack
} from "@chakra-ui/react"
import { Form, Formik } from "formik";
import { useWallet } from "@solana/wallet-adapter-react";
import { createTransaction } from "../services/programAPI";
import { Wallet } from "@project-serum/anchor";


interface IProps {
  isOpen: boolean;
  onClose: () => void;
  smartWallets: string[]
  fetchNewData: () => void;
}

const CreateTransaction = ({ isOpen, onClose, smartWallets, fetchNewData }: IProps) => {
  const wallet = useWallet()

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Smart Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {wallet.publicKey && <Formik
              initialValues={{ smartWallet: '' }}
              onSubmit={(values) => {
                createTransaction(wallet as unknown as Wallet, values.smartWallet, () => {
                  onClose()
                  fetchNewData()
                })
              }}
            >
              {({
                values,
                handleChange,
                handleSubmit
                /* and other goodies */
              }) => (
                <Form onSubmit={handleSubmit}>
                  <VStack gap={3} mb={4}>
                    <Box w={"100%"}>
                      <FormLabel htmlFor='threshold'>Smart wallet:</FormLabel>
                      <Select placeholder='Select Smart Wallet' name={'smartWallet'} onChange={handleChange} value={values.smartWallet}>
                        {smartWallets.map((sw, idx) => <option value={sw} key={sw}>#{idx + 1} - {sw.substring(0, 30)}...</option>)}
                      </Select>
                    </Box>
                    <HStack w={"100%"} justifyContent={'flex-end'} mt={4} mb={4}>
                      <Button colorScheme='red' onClick={onClose}>
                        Close
                      </Button>
                      <Button mr={4} type="submit">Create</Button>
                    </HStack>
                  </VStack>
                </Form>
              )}
            </Formik>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>)
}

export default CreateTransaction