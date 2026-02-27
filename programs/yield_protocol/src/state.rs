use anchor_lang::prelude::*;
use crate::constants::*;

#[account]
pub struct Market {
    pub admin: Pubkey,
    pub asset_mint: Pubkey,
    pub sy_mint: Pubkey,
    pub pt_mint: Pubkey,
    pub yt_mint: Pubkey,
    pub maturity_date: i64,
    pub tvl: u64,
}

impl Market {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH // admin
        + PUBKEY_LENGTH // asset
        + PUBKEY_LENGTH // sy
        + PUBKEY_LENGTH // pt
        + PUBKEY_LENGTH // yt
        + I64_LENGTH    // maturity_date
        + U64_LENGTH;   // tvl
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub market: Pubkey,
    pub sy_amount: u64,
    pub pt_amount: u64,
    pub yt_amount: u64,
}

#[account]
pub struct LeveragePosition {
    pub user: Pubkey,
    pub market: Pubkey,
    pub collateral_amount: u64,
    pub debt_amount: u64,
    pub leverage: u8,
}

#[account]
pub struct DePINPool {
    pub admin: Pubkey,
    pub project_id: String, // Or pubkey if it's a mint
    pub total_staked: u64,
}

#[account]
pub struct DePINStake {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
}
