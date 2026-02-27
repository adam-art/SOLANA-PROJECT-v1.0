import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // In a real scenario, this would fetch from the DB:
        // const markets = await prisma.market.findMany();
        const MOCK_MARKETS = [
            { id: '1', asset: 'USDC', proxy: 'sUSDC', apy: '8.5%', maturity: '2026-12-31', tvl: '$12.4M' },
            { id: '2', asset: 'SOL', proxy: 'sSOL', apy: '12.2%', maturity: '2026-06-30', tvl: '$24.1M' },
        ];
        return NextResponse.json({ markets: MOCK_MARKETS });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
    }
}
