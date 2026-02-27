"use client";
import Link from 'next/link';
import { ArrowRight, Vault, Coins, LineChart } from 'lucide-react';
import { useState, useEffect } from 'react';

const MOCK_MARKETS = [
    { id: '1', asset: 'USDC', proxy: 'sUSDC', apy: '8.5%', maturity: '2026-12-31', tvl: '$12.4M', logo: 'USDC', category: 'Stablecoins' },
    { id: '2', asset: 'SOL', proxy: 'sSOL', apy: '12.2%', maturity: '2026-06-30', tvl: '$24.1M', logo: 'SOL', category: 'Crypto' },
    { id: '3', asset: 'ETH', proxy: 'sETH', apy: '5.4%', maturity: '2026-09-30', tvl: '$5.6M', logo: 'ETH', category: 'Crypto' },
    { id: '4', asset: 'USDT', proxy: 'sUSDT', apy: '7.8%', maturity: '2027-01-31', tvl: '$8.2M', logo: 'USDT', category: 'Stablecoins' },
];

export default function MarketsPage() {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Stablecoins' | 'Crypto'>('All');

    useEffect(() => {
        // Simulate network fetch
        setTimeout(() => setLoading(false), 500);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 border-b border-white/10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Yield Markets</h1>
                    <p className="text-gray-400 max-w-2xl text-lg">Browse available markets. Deposit your underlying assets to mint SY, then split them into Principal Tokens (PT) and Yield Tokens (YT).</p>
                </div>
                <div className="mt-6 md:mt-0">
                    <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 backdrop-blur-md">
                        <button
                            onClick={() => setFilter('All')}
                            className={`px-6 py-2 rounded-lg transition ${filter === 'All' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            All Markets
                        </button>
                        <button
                            onClick={() => setFilter('Stablecoins')}
                            className={`px-6 py-2 rounded-lg transition ${filter === 'Stablecoins' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Stablecoins
                        </button>
                        <button
                            onClick={() => setFilter('Crypto')}
                            className={`px-6 py-2 rounded-lg transition ${filter === 'Crypto' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Crypto
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_MARKETS.filter(m => filter === 'All' || m.category === filter).map((market) => (
                        <Link href={`/markets/${market.id}`} key={market.id}>
                            <div className="glass-card flex flex-col h-full group">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/50 to-cyan-600/50 flex items-center justify-center font-bold text-lg border border-white/10 shadow-inner">
                                            {market.logo.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-white">{market.asset}</h2>
                                            <p className="text-sm font-medium text-violet-400">{market.proxy}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Fixed APY</p>
                                        <p className="text-xl font-bold text-green-400">{market.apy}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10 mt-auto">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center"><Vault className="w-4 h-4 mr-2" /> Maturity</span>
                                        <span className="font-semibold">{market.maturity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center"><LineChart className="w-4 h-4 mr-2" /> Total Value Locked</span>
                                        <span className="font-semibold">{market.tvl}</span>
                                    </div>

                                    <div className="pt-4 flex w-full">
                                        <span className="w-full text-center py-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-violet-600 group-hover:border-violet-500 transition-all font-medium flex items-center justify-center text-sm">
                                            Trade Market <ArrowRight className="ml-2 w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
