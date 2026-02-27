use anchor_lang::prelude::*;

#[error_code]
pub enum YieldError {
    #[msg("Market initialization failed.")]
    MarketInitFailed,
    #[msg("Insufficient balance for deposit.")]
    InsufficientBalance,
    #[msg("Maturity date must be in the future.")]
    InvalidMaturityDate,
    #[msg("Leverage must be between 2x and 10x.")]
    InvalidLeverage,
    #[msg("Health factor too low. Position is liquidatable.")]
    HealthFactorTooLow,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Math operation overflowed.")]
    MathOverflow,
}
