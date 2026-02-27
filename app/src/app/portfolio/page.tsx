"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PieChart, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Transaction, SystemProgram } from '@solana/web3.js';
import { connection } from '@/lib/solana';

export default function PortfolioPage() {
    const { publicKey, sendTransaction } = useWallet();
    const { setVisible } = useWalletModal();
    const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [txSignature, setTxSignature] = useState<string>('');
    const [lastClaimed, setLastClaimed] = useState<number | null>(null);
    const [timeToNextClaim, setTimeToNextClaim] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    // Dynamic calculations
    const BASE_NAV = 14295.40;
    const YIELD_AMOUNT = 84.50;
    const currentNav = isClient ? (BASE_NAV + (lastClaimed ? 0 : YIELD_AMOUNT)) : BASE_NAV;

    // Simulated 7-day cooldown (in milliseconds)
    const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        setIsClient(true);
        if (publicKey) {
            const storedItem = localStorage.getItem(`lastClaimed_${publicKey.toString()}`);
            if (storedItem) {
                setLastClaimed(parseInt(storedItem, 10));
            }
        }
    }, [publicKey]);

    useEffect(() => {
        // Simple timer update if cooldown is active
        if (!lastClaimed) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastClaimed;
            if (elapsed >= COOLDOWN_MS) {
                setLastClaimed(null);
                setTimeToNextClaim('');
            } else {
                const remaining = COOLDOWN_MS - elapsed;
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeToNextClaim(`${days}d ${hours}h ${mins}m`);
            }
        }, 60000); // Check every minute

        // Initial setup
        const initialRemaining = COOLDOWN_MS - (Date.now() - lastClaimed);
        if (initialRemaining > 0) {
            const days = Math.floor(initialRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((initialRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((initialRemaining % (1000 * 60 * 60)) / (1000 * 60));
            setTimeToNextClaim(`${days}d ${hours}h ${mins}m`);
        }

        return () => clearInterval(interval);
    }, [lastClaimed]);

    const handleClaimYield = async () => {
        if (!publicKey) return;
        if (lastClaimed && Date.now() - lastClaimed < COOLDOWN_MS) {
            alert("Yield is locked. You can only claim once every 7 days.");
            return;
        }

        try {
            setClaimStatus('loading');
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 1000,
                })
            );
            tx.feePayer = publicKey;
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            const signature = await sendTransaction(tx, connection);

            setClaimStatus('success');
            setTxSignature(signature);
            const now = Date.now();
            setLastClaimed(now);
            if (publicKey) {
                localStorage.setItem(`lastClaimed_${publicKey.toString()}`, now.toString());
            }

            setTimeout(() => {
                setClaimStatus('idle');
                setTxSignature('');
            }, 8000);
        } catch (error) {
            setClaimStatus('idle');
        }
    };

    if (!publicKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                    <Wallet className="w-10 h-10 text-violet-400" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Connect your wallet</h1>
                    <p className="text-gray-400 max-w-sm">Connect your Solana wallet to view your active positions, yields, and transaction history.</p>
                </div>
                <button className="btn-primary" onClick={() => setVisible(true)}>
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end pb-8 border-b border-white/10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Portfolio Overview</h1>
                    <p className="text-gray-400 font-mono text-sm">{publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-white/5"><PieChart className="w-32 h-32" /></div>
                    <p className="text-gray-400 uppercase tracking-widest font-semibold text-sm mb-2 relative z-10">Net Asset Value</p>
                    <h2 className="text-6xl font-extrabold tracking-tight text-white mb-4 relative z-10">
                        ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <div className="flex space-x-4 relative z-10">
                        <span className="flex items-center text-green-400 font-medium bg-green-400/10 px-3 py-1.5 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" /> +$240.20 (Today)
                        </span>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-4">
                    <div>
                        <p className="text-gray-400 uppercase tracking-widest font-semibold text-sm mb-2">Claimable Yield</p>
                        <h2 className="text-4xl font-bold tracking-tight text-green-400">
                            {lastClaimed ? "$0.00" : "$84.50"}
                        </h2>
                    </div>

                    {claimStatus === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-start text-green-400 text-sm animate-in zoom-in">
                            <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-bold">Yield claimed!</span>
                                <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="block text-green-300 hover:text-white underline mt-1">
                                    View Explorer ↗
                                </a>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleClaimYield}
                        disabled={!!lastClaimed || claimStatus === 'loading'}
                        className="btn-primary w-full py-3 flex justify-center items-center"
                    >
                        {claimStatus === 'loading' ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : lastClaimed ? (
                            `Next Claim in: ${timeToNextClaim || '7d 0h'}`
                        ) : (
                            'Claim All Yield'
                        )}
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight pt-8 border-t border-white/10">Active Positions</h3>

            <div className="overflow-x-auto rounded-2xl glass-panel">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm tracking-wider uppercase">
                            <th className="p-6 font-semibold">Asset</th>
                            <th className="p-6 font-semibold">Type</th>
                            <th className="p-6 font-semibold text-right">Balance</th>
                            <th className="p-6 font-semibold text-right">Value (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/5 transition">
                            <td className="p-6 font-bold flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center">U</div>
                                <span>USDC</span>
                            </td>
                            <td className="p-6"><span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold font-mono">PT / Principal</span></td>
                            <td className="p-6 text-right font-mono">10,000.00 PT</td>
                            <td className="p-6 text-right font-bold">$9,240.00</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition">
                            <td className="p-6 font-bold flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center">U</div>
                                <span>USDC</span>
                            </td>
                            <td className="p-6"><span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full text-xs font-bold font-mono">YT / Yield</span></td>
                            <td className="p-6 text-right font-mono">10,000.00 YT</td>
                            <td className="p-6 text-right font-bold">$840.00</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition">
                            <td className="p-6 font-bold flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">S</div>
                                <span>SOL</span>
                            </td>
                            <td className="p-6"><span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold font-mono">sSOL / Mapped SY</span></td>
                            <td className="p-6 text-right font-mono">24.50 sSOL</td>
                            <td className="p-6 text-right font-bold">$4,215.40</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
