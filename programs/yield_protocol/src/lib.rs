use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;

use constants::*;
use errors::*;
use state::*;

declare_id!("DjnbAUiRJ91rSftQqkgZZXqHiCZ7BpvYemxWhS6TwEaU");

#[program]
pub mod yield_protocol {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>, maturity_date: i64) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(maturity_date > Clock::get()?.unix_timestamp, YieldError::InvalidMaturityDate);
        market.admin = ctx.accounts.admin.key();
        market.asset_mint = ctx.accounts.asset_mint.key();
        market.sy_mint = ctx.accounts.sy_mint.key();
        market.pt_mint = ctx.accounts.pt_mint.key();
        market.yt_mint = ctx.accounts.yt_mint.key();
        market.maturity_date = maturity_date;
        market.tvl = 0;
        Ok(())
    }

    pub fn deposit_sy(ctx: Context<DepositSy>, amount: u64) -> Result<()> {
        let position = &mut ctx.accounts.user_position;
        let market = &mut ctx.accounts.market;
        
        // Protocol fee calculation
        let fee = amount.checked_mul(PROTOCOL_FEE_BPS as u64).unwrap().checked_div(10000).unwrap();
        let amount_after_fee = amount.checked_sub(fee).unwrap();

        position.user = ctx.accounts.user.key();
        position.market = market.key();
        position.sy_amount = position.sy_amount.checked_add(amount_after_fee).map_err(|_| YieldError::MathOverflow)?;
        market.tvl = market.tvl.checked_add(amount_after_fee).map_err(|_| YieldError::MathOverflow)?;
        
        Ok(())
    }

    pub fn split_sy(ctx: Context<SplitSy>, amount: u64) -> Result<()> {
        let position = &mut ctx.accounts.user_position;
        require!(position.sy_amount >= amount, YieldError::InsufficientBalance);
        
        position.sy_amount = position.sy_amount.checked_sub(amount).unwrap();
        position.pt_amount = position.pt_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        position.yt_amount = position.yt_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        Ok(())
    }

    pub fn merge_pt_yt(ctx: Context<MergePtYt>, amount: u64) -> Result<()> {
        let position = &mut ctx.accounts.user_position;
        require!(position.pt_amount >= amount && position.yt_amount >= amount, YieldError::InsufficientBalance);
        
        position.pt_amount = position.pt_amount.checked_sub(amount).unwrap();
        position.yt_amount = position.yt_amount.checked_sub(amount).unwrap();
        position.sy_amount = position.sy_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        Ok(())
    }

    pub fn trade_pt(ctx: Context<TradePt>, amount: u64, is_buy: bool) -> Result<()> {
        let position = &mut ctx.accounts.user_position;
        if is_buy {
            position.pt_amount = position.pt_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        } else {
            require!(position.pt_amount >= amount, YieldError::InsufficientBalance);
            position.pt_amount = position.pt_amount.checked_sub(amount).unwrap();
        }
        Ok(())
    }

    pub fn trade_yt(ctx: Context<TradeYt>, amount: u64, is_buy: bool) -> Result<()> {
        let position = &mut ctx.accounts.user_position;
        if is_buy {
            position.yt_amount = position.yt_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        } else {
            require!(position.yt_amount >= amount, YieldError::InsufficientBalance);
            position.yt_amount = position.yt_amount.checked_sub(amount).unwrap();
        }
        Ok(())
    }

    pub fn create_leverage_position(ctx: Context<CreateLeverage>, collateral: u64, leverage: u8) -> Result<()> {
        require!(leverage >= MIN_LEVERAGE && leverage <= MAX_LEVERAGE, YieldError::InvalidLeverage);
        
        let position = &mut ctx.accounts.leverage_position;
        position.user = ctx.accounts.user.key();
        position.market = ctx.accounts.market.key();
        position.collateral_amount = collateral;
        position.leverage = leverage;
        
        // Debt = Collateral * (Leverage - 1)
        let total_exposure = collateral.checked_mul(leverage as u64).map_err(|_| YieldError::MathOverflow)?;
        let debt = total_exposure.checked_sub(collateral).unwrap();
        position.debt_amount = debt;

        // Simple Health Factor Check: (Exposure * 0.85) / Debt must be > 1.0
        // (Exposure * 85) / (Debt * 100) > 1
        if debt > 0 {
            let numerator = total_exposure.checked_mul(85).unwrap();
            let denominator = debt.checked_mul(100).unwrap();
            require!(numerator > denominator, YieldError::HealthFactorTooLow);
        }

        Ok(())
    }

    pub fn close_leverage_position(_ctx: Context<CloseLeverage>) -> Result<()> {
        // Logic to settle debt and return remaining collateral
        Ok(())
    }

    pub fn add_collateral(ctx: Context<AddCollateral>, amount: u64) -> Result<()> {
        let position = &mut ctx.accounts.leverage_position;
        position.collateral_amount = position.collateral_amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        Ok(())
    }

    pub fn stake_depin(ctx: Context<StakeDePIN>, amount: u64) -> Result<()> {
        let stake = &mut ctx.accounts.stake;
        let pool = &mut ctx.accounts.pool;
        
        stake.user = ctx.accounts.user.key();
        stake.pool = pool.key();
        stake.amount = stake.amount.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        stake.staked_at = Clock::get()?.unix_timestamp;
        
        pool.total_staked = pool.total_staked.checked_add(amount).map_err(|_| YieldError::MathOverflow)?;
        Ok(())
    }

    pub fn unstake_depin(ctx: Context<UnstakeDePIN>, amount: u64) -> Result<()> {
        let stake = &mut ctx.accounts.stake;
        let pool = &mut ctx.accounts.pool;
        require!(stake.amount >= amount, YieldError::InsufficientBalance);
        
        stake.amount = stake.amount.checked_sub(amount).unwrap();
        pool.total_staked = pool.total_staked.checked_sub(amount).unwrap();
        Ok(())
    }

    pub fn claim_yield(_ctx: Context<ClaimYield>) -> Result<()> {
        // Distribute yield to YT holders
        Ok(())
    }

    pub fn claim_depin_rewards(ctx: Context<ClaimDePINRewards>) -> Result<()> {
        let stake = &ctx.accounts.stake;
        let now = Clock::get()?.unix_timestamp;
        let duration = now.checked_sub(stake.staked_at).unwrap();
        
        // Simple Reward Math: 1 reward per 1000 tokens per day (86400 seconds)
        // Reward = (Amount * duration) / (1000 * 86400)
        let reward = (stake.amount as u128)
            .checked_mul(duration as u128).unwrap()
            .checked_div(1000 * 86400).unwrap();
            
        msg!("Claiming {} rewards", reward);
        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init, 
        payer = admin, 
        space = Market::LEN,
        seeds = [b"market", asset_mint.key().as_ref()], 
        bump
    )]
    pub market: Account<'info, Market>,
    /// CHECK: Mint pubkey
    pub asset_mint: AccountInfo<'info>,
    /// CHECK: SY mint
    pub sy_mint: AccountInfo<'info>,
    /// CHECK: PT mint
    pub pt_mint: AccountInfo<'info>,
    /// CHECK: YT mint
    pub yt_mint: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSy<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 8,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SplitSy<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user)]
    pub user_position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct MergePtYt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user)]
    pub user_position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct TradePt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, has_one = user)]
    pub user_position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct TradeYt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, has_one = user)]
    pub user_position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct CreateLeverage<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"leverage", user.key().as_ref(), market.key().as_ref()],
        bump
    )]
    pub leverage_position: Account<'info, LeveragePosition>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseLeverage<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user, close = user)]
    pub leverage_position: Account<'info, LeveragePosition>,
}

#[derive(Accounts)]
pub struct AddCollateral<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user)]
    pub leverage_position: Account<'info, LeveragePosition>,
}

#[derive(Accounts)]
pub struct StakeDePIN<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, DePINPool>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8,
        seeds = [b"depin_stake", user.key().as_ref(), pool.key().as_ref()],
        bump
    )]
    pub stake: Account<'info, DePINStake>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeDePIN<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, DePINPool>,
    #[account(mut, has_one = user, has_one = pool)]
    pub stake: Account<'info, DePINStake>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, has_one = user)]
    pub user_position: Account<'info, UserPosition>,
}

#[derive(Accounts)]
pub struct ClaimDePINRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, DePINPool>,
    #[account(mut, has_one = user, has_one = pool)]
    pub stake: Account<'info, DePINStake>,
}
