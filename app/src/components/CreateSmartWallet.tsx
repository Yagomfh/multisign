import {
  Box, Button, FormLabel, HStack, IconButton,
  Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, NumberInput, NumberInputField, VStack
} from "@chakra-ui/react"
import { Form, Formik } from "formik";
import { SmallAddIcon } from '@chakra-ui/icons'
import { ChangeEvent, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createWallet } from "../services/programAPI";
import { Wallet } from "@project-serum/anchor";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  fetchNewData: () => void;
}

const CreateSmartWallet = ({ isOpen, onClose, fetchNewData }: IProps) => {
  const [ownersCount, setOwnersCount] = useState<number>(1)
  const wallet = useWallet()


  return (<><Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Create Smart Wallet</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {wallet.publicKey && <Formik
          initialValues={{ threshold: 1, owners: [wallet.publicKey.toBase58()] }}
          onSubmit={(values) => {
            createWallet(wallet as unknown as Wallet, values.owners, Number(values.threshold), () => {
              onClose()
              fetchNewData()
            })
          }}
        >
          {({
            values,
            setValues,
            handleChange,
            handleSubmit
            /* and other goodies */
          }) => (
            <Form onSubmit={handleSubmit}>
              <VStack gap={3} mb={4}>
                <Box w={"100%"}>
                  <FormLabel htmlFor='threshold'>Threshold:</FormLabel>
                  <NumberInput>
                    <NumberInputField id='threshold' placeholder={'3'} value={values.threshold} onChange={handleChange} />
                  </NumberInput>
                </Box>
                <Box w={"100%"}>
                  <FormLabel htmlFor='threshold'>Owners:</FormLabel>
                  {[...Array(ownersCount)].map((x, i) =>
                    <Input key={i} placeholder='Public key' value={values.owners[i]} onChange={
                      (e: ChangeEvent<HTMLInputElement>) => {
                        const newValues = { ...values }
                        newValues.owners[i] = e.target.value
                        setValues(newValues)
                      }
                    } mb={4} />
                  )}
                  <IconButton aria-label='Search database' icon={<SmallAddIcon />} onClick={() => {
                    setOwnersCount(ownersCount + 1)
                    const newOwners = [...values.owners]
                    newOwners.push('')
                    setValues({ ...values, owners: newOwners })
                  }} />
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
  </Modal></>)
}

export default CreateSmartWallet