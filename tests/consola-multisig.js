const anchor = require("@project-serum/anchor");
const { associated } = require("@project-serum/anchor/dist/cjs/utils/pubkey");
const assert = require("assert");
const { SystemProgram } = anchor.web3;

describe("consola-multisig test:", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ConsolaMultisig;

  it("Test - Smart wallet program", async () => {
    const ownerA = anchor.web3.Keypair.generate();
    const ownerB = anchor.web3.Keypair.generate();
    const smartWallet = anchor.web3.Keypair.generate();

    const owners = [ownerA.publicKey, ownerB.publicKey, provider.wallet.publicKey];

    const threshold = new anchor.BN(2);
    console.log(owners)

    await program.rpc.createSmartWallet(owners, threshold, {
      accounts: {
        smartWallet: smartWallet.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [smartWallet]
    })
    const account = await program.account.smartWallet.fetch(smartWallet.publicKey);
    assert.ok(account.threshold.toString() == threshold.toString())
    assert.ok(JSON.stringify(account.owners) == JSON.stringify(owners))
    console.log(await program.account.smartWallet.all())

    const transaction = anchor.web3.Keypair.generate();

    await program.rpc.createTransaction({
      accounts: {
        smartWallet: smartWallet.publicKey,
        transaction: transaction.publicKey,
        proposer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [transaction]
    })

    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Transaction's signers state:", transactionAccount.signers)

    await program.rpc.approve({
      accounts: {
        smartWallet: smartWallet.publicKey,
        transaction: transaction.publicKey,
        owner: ownerA.publicKey,
      },
      signers: [ownerA]
    })

    transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Transaction's signers state:", transactionAccount.signers)
    
    await program.rpc.approve({
      accounts: {
        smartWallet: smartWallet.publicKey,
        transaction: transaction.publicKey,
        owner: ownerB.publicKey,
      },
      signers: [ownerB]
    })

    await program.rpc.reject({
      accounts: {
        smartWallet: smartWallet.publicKey,
        transaction: transaction.publicKey,
        owner: ownerA.publicKey,
      },
      signers: [ownerA]
    })
    transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Transaction's signers state:", transactionAccount.signers)

    await program.rpc.executeTransaction({
      accounts: {
        smartWallet: smartWallet.publicKey,
        transaction: transaction.publicKey,
        owner: ownerB.publicKey,
      },
      signers: [ownerB]
    })
    transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Transaction state:", transactionAccount)
  })
});
