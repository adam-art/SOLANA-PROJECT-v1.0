import { Connection, PublicKey } from '@solana/web3.js';

// Update this after 'anchor deploy' to match your program's public key
export const PROGRAM_ID = new PublicKey('DjnbAUiRJ91rSftQqkgZZXqHiCZ7BpvYemxWhS6TwEaU');
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export async function fetchMarketData(marketId: string) {
    // Stub for fetching on-chain data using web3.js or @coral-xyz/anchor
    return { tvl: 0, apy: 0 };
}
