use anchor_lang::prelude::*;

declare_id!("6synpTG67BHwBhghPJi6FozB7VwzDQW4oFCu6J7qZXTm");

#[program]
pub mod consola_multisig {
    use super::*;

    pub fn create_smart_wallet(
        ctx: Context<CreateSmartWallet>,
        owners: Vec<Pubkey>,
        threshold: u64,
    ) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        smart_wallet.owners = owners;
        smart_wallet.threshold = threshold;
        Ok(())
    }

    pub fn create_transaction(
        ctx: Context<CreateTransaction>,
        to: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let owner_index = ctx
            .accounts
            .smart_wallet
            .owners
            .iter()
            .position(|a| a == ctx.accounts.proposer.key)
            .ok_or(ErrorCode::ForbidenOwner)?;
        let mut signers = Vec::new();
        signers.resize(ctx.accounts.smart_wallet.owners.len(), false);
        signers[owner_index] = true;

        let tx = &mut ctx.accounts.transaction;
        tx.signers = signers;
        tx.proposer = ctx.accounts.proposer.key();
        tx.smart_wallet = ctx.accounts.smart_wallet.key();
        tx.did_execute = false;
        tx.to = to;
        tx.amount = amount;

        Ok(())
    }

    pub fn approve(ctx: Context<ApproveOrReject>) -> Result<()> {
        let owner_index = ctx
            .accounts
            .smart_wallet
            .owners
            .iter()
            .position(|a| a == ctx.accounts.owner.key)
            .ok_or(ErrorCode::ForbidenOwner)?;

        ctx.accounts.transaction.signers[owner_index] = true;

        Ok(())
    }

    pub fn reject(ctx: Context<ApproveOrReject>) -> Result<()> {
        let owner_index = ctx
            .accounts
            .smart_wallet
            .owners
            .iter()
            .position(|a| a == ctx.accounts.owner.key)
            .ok_or(ErrorCode::ForbidenOwner)?;

        ctx.accounts.transaction.signers[owner_index] = false;

        Ok(())
    }

    pub fn execute_transaction(ctx: Context<ExecuteTransaction>) -> Result<()> {
        if ctx.accounts.transaction.did_execute {
            return Err(ErrorCode::AlreadyExecuted.into());
        }
        ctx.accounts.smart_wallet.owners.iter().position(|a| a == ctx.accounts.owner.key).ok_or(ErrorCode::ForbidenOwner)?;

        let signature_count = ctx
            .accounts
            .transaction
            .signers
            .iter()
            .filter(|&did_sign| *did_sign)
            .count() as u64;
        if signature_count < ctx.accounts.smart_wallet.threshold {
            return Err(ErrorCode::ThresholdNotReached.into());
        }

        let tx = &ctx.accounts.transaction; 

        if ctx.accounts.to.key() != tx.to {
            return Err(ErrorCode::WrongAccount.into());
        }

        let amount_of_lamports = ctx.accounts.transaction.amount; 
        let from = ctx.accounts.smart_wallet.to_account_info();
        let to = ctx.accounts.to.to_account_info();

        // Debit from_account and credit to_account
        **from.try_borrow_mut_lamports()? -= amount_of_lamports;
        **to.try_borrow_mut_lamports()? += amount_of_lamports;

        ctx.accounts.transaction.did_execute = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateSmartWallet<'info> {
    #[account(init, payer = user, space = 200)]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(mut)]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(init, payer = proposer, space = 1000)]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveOrReject<'info> {
    #[account(mut)]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    pub owner: Signer<'info>
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    #[account(mut)]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we just pay to this account
    pub to: AccountInfo<'info>,
    pub owner: Signer<'info>
}


#[account]
pub struct SmartWallet {
    pub threshold: u64,
    pub owners: Vec<Pubkey>,
}

#[account]
pub struct Transaction {
    pub smart_wallet: Pubkey,
    pub proposer: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub signers: Vec<bool>,
    pub did_execute: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The given owner is not part of this multisig.")]
    ForbidenOwner,
    #[msg("The transaction has already been executed.")]
    AlreadyExecuted,
    #[msg("You don't have enough signatures to execute this transaction.")]
    ThresholdNotReached,
    #[msg("Yoo tried to send the transaction to the wrong account.")]
    WrongAccount,
    #[msg("Transaction failed to execute.")]
    TransactionError,
}