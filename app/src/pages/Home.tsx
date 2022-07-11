import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import SmartWallets from "../tabs/SmartWallets"
import Transactions from "../tabs/Transactions"

const Home = () => {
    return (
        <>
            <Box m={100}>
                <Tabs isFitted variant='enclosed'>
                    <TabList mb='1em'>
                        <Tab>Smart wallets</Tab>
                        <Tab>Transactions</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <SmartWallets />
                        </TabPanel>
                        <TabPanel>
                            <Transactions />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </>
    )
}

export default Home