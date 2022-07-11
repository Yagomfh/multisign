import { BN, Program, ProgramAccount, Wallet, web3 } from "@project-serum/anchor";
import { getProvider } from "../utils/getProvider";
import idl from '../idl.json';
import { Keypair, PublicKey } from "@solana/web3.js";
import { IdlTypes, TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";

const programID = new PublicKey(idl.metadata.address);

export const fetchWallets = async (wallet: Wallet) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    return program.account.smartWallet.all()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const fetchTransactions = async (wallet: Wallet) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    return program.account.transaction.all()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const acceptTransaction = async (
  wallet: Wallet,
  tx: string,
  smartWallet: string,
  callBack?: () => void
) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.approve({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const rejectTransaction = async (wallet: Wallet, tx: string, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.reject({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const executeTransaction = async (wallet: Wallet, tx: string, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.executeTransaction({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const createWallet = async (wallet: Wallet, owners: string[], threshold: number, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);
  const smartWallet = Keypair.generate();

  try {
    /* interact with the program via rpc */
    await program.rpc.createSmartWallet(owners.map(o => new PublicKey(o)), new BN(threshold), {
      accounts: {
        smartWallet: smartWallet.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [smartWallet]
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const createTransaction = async (wallet: Wallet, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);
  const transaction = Keypair.generate();

  try {
    /* interact with the program via rpc */
    await program.rpc.createTransaction({
      accounts: {
        smartWallet:  new PublicKey(smartWallet),
        transaction: transaction.publicKey,
        proposer: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [transaction]
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}