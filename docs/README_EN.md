# Yield Protocol

A Full-Stack DeFi Protocol on Solana ecosystem aiming to allow users to separate the yield from interest-bearing assets (yield-stripping).

## Core Features
1. **Yield Stripping (Sy/PT/YT)**: Deposit assets, mint Standardized Yield (SY), and split them into Principal Token (PT) and Yield Token (YT).
2. **AMM Trading**: Buy and sell PT & YT instantly in the AMM market.
3. **Leverage Trading**: Open leveraged yield positions up to 10x.
4. **DePIN Staking**: Stake your tokens in DePIN projects for dual-yield.

## Tech Stack
- **Smart Contract**: Rust, Anchor Framework (Solana).
- **Frontend**: Next.js 14 (App Router), Tailwind CSS.
- **Database**: PostgreSQL with Prisma ORM.

## How to Run The App
1. `npm install` inside the `app/` directory.
2. Set `.env` file with your PostgreSQL `DATABASE_URL`.
3. Run `npx prisma db push`
4. Run `npm run dev`
5. Open `http://localhost:3000` on your browser.

Use Phantom Wallet (Devnet) with Devnet SOL (Get it from: https://faucet.solana.com) to test the transactions.
