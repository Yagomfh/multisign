import { AnchorProvider } from '@project-serum/anchor';
import { Wallet } from '@project-serum/anchor/dist/cjs/provider';
import { Commitment, ConfirmOptions, Connection, ConnectionConfig } from '@solana/web3.js';

const opts = {
  preflightCommitment: "processed"
}

export const getProvider = async (wallet: Wallet) => {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const network = "http://127.0.0.1:8899";
  const connection = new Connection(network, opts.preflightCommitment as Commitment | ConnectionConfig | undefined);

  const provider = new AnchorProvider(
    connection, wallet, opts.preflightCommitment as ConfirmOptions,
  );
  return provider;
}