"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Cpu, Server, MapPin, Zap, CheckCircle2 } from 'lucide-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import IDL from '@/lib/idl.json';
import { connection } from '@/lib/solana';

const PROJECTS = [
    { id: '1', name: 'Helium Network', token: 'HNT', apy: '18.5%', numApy: 18.5, tag: 'Wireless DePIN', icon: <MapPin className="w-8 h-8" />, color: 'from-blue-600 to-cyan-500' },
    { id: '2', name: 'Render Network', token: 'RNDR', apy: '12.4%', numApy: 12.4, tag: 'Compute DePIN', icon: <Cpu className="w-8 h-8" />, color: 'from-purple-600 to-pink-500' },
    { id: '3', name: 'ShdwDrive', token: 'SHDW', apy: '9.2%', numApy: 9.2, tag: 'Storage DePIN', icon: <Server className="w-8 h-8" />, color: 'from-gray-700 to-black' },
];

export default function DePINPage() {
    const { publicKey, sendTransaction } = useWallet();
    const [staked, setStaked] = useState<string | null>(null);
    const [txSignature, setTxSignature] = useState<string>('');
    const [loading, setLoading] = useState<string | null>(null);
    const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: string }>({});

    const handleStake = async (id: string) => {
        const amount = stakeAmounts[id];
        if (!publicKey) {
            alert("Please connect wallet");
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert("Please enter a valid amount to stake!");
            return;
        }

        try {
            setLoading(id);

            const provider = new anchor.AnchorProvider(connection, (window as any).solana, { preflightCommitment: 'confirmed' });
            const program = new anchor.Program(IDL as any, provider);

            const amountBN = new anchor.BN(Number(amount) * 1e9); // Assuming 9 decimals for SOL

            // Pool address would ideally come from the PROJECT object or be pre-initialized
            const poolPubkey = new PublicKey("A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2"); // Placeholder

            const signature = await program.methods
                .stakeDepin(amountBN)
                .accounts({
                    user: publicKey,
                    pool: poolPubkey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Staked signature:", signature);
            setStaked(id);
            setTxSignature(signature);
            setLoading(null);
        } catch (error: any) {
            console.error("Staking error:", error);
            alert("Transaction failed! Check console for details.");
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="pb-8 border-b border-white/10 mt-4">
                <span className="bg-gradient-to-r from-blue-500 to-green-400 text-transparent bg-clip-text font-bold tracking-widest uppercase text-sm mb-2 block">Partner Integration</span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">DePIN Staking</h1>
                <p className="text-gray-400 mt-4 text-lg max-w-2xl">Support Decentralized Physical Infrastructure Networks on Solana. Stake your tokens dan dapatkan ekstra yield (dual-yield) otomatis dihitung oleh smart contracts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {PROJECTS.map(project => (
                    <div key={project.id} className="glass-panel p-1 rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col">
                        <div className={`h-32 bg-gradient-to-br ${project.color} p-6 flex items-end justify-between relative`}>
                            <div className="absolute top-0 right-0 w-full h-full bg-black/20 group-hover:bg-black/0 transition-all"></div>
                            <div className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 bg-black/40 rounded-full mb-2 inline-block backdrop-blur-md">{project.tag}</span>
                                <h2 className="text-2xl font-bold">{project.name}</h2>
                            </div>
                            <div className="relative z-10 p-2 bg-black/30 rounded-full backdrop-blur-md">
                                {project.icon}
                            </div>
                        </div>

                        <div className="p-6 bg-black/60 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <p className="text-gray-400 text-sm">Reward Token</p>
                                        <p className="font-bold text-white tracking-widest">${project.token}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-sm">Target APY</p>
                                        <p className="font-bold text-green-400 text-xl drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{project.apy}</p>
                                    </div>
                                </div>

                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Stake Amount</span>
                                        <span className="text-violet-400 cursor-pointer font-medium hover:text-violet-300 hover:underline transition-all" onClick={() => setStakeAmounts({ ...stakeAmounts, [project.id]: '1000' })}>Max</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={stakeAmounts[project.id] || ''}
                                            onChange={(e) => setStakeAmounts({ ...stakeAmounts, [project.id]: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 font-mono text-lg transition-colors"
                                            placeholder="0.00"
                                            disabled={staked === project.id}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">SOL</div>
                                    </div>

                                    {/* Auto-Kalkulasi Dual Yield */}
                                    <div className="bg-white/5 rounded-lg text-sm border border-white/5 mt-3 p-3 space-y-2 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/50"></div>
                                        <div className="flex justify-between text-gray-400 pl-2">
                                            <span>Est. Base Yield:</span>
                                            <span className="text-white">{(Number(stakeAmounts[project.id] || 0) * 0.05).toFixed(4)} SOL</span>
                                        </div>
                                        <div className="flex justify-between text-green-400 font-medium pt-2 border-t border-white/5 pl-2">
                                            <span>Est. Extra Yield (+{project.apy}):</span>
                                            <span>{(Number(stakeAmounts[project.id] || 0) * (project.numApy / 100)).toFixed(4)} {project.token}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                {staked === project.id ? (
                                    <div className="flex flex-col space-y-3 bg-green-500/10 border border-green-500/20 p-4 rounded-xl relative animate-in slide-in-from-bottom-2">
                                        <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => { setStaked(null); setTxSignature(''); setStakeAmounts({ ...stakeAmounts, [project.id]: '' }); }}>✕</button>
                                        <div className="flex items-center text-green-400 font-bold">
                                            <CheckCircle2 className="w-5 h-5 mr-2" /> Staked Successfully
                                        </div>
                                        <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-300 hover:text-white underline">
                                            View on Solana Explorer (Devnet) ↗
                                        </a>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleStake(project.id)}
                                        className="btn-primary w-full py-3 flex items-center justify-center font-bold text-lg disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={!publicKey || loading === project.id || !stakeAmounts[project.id] || Number(stakeAmounts[project.id]) <= 0}
                                    >
                                        {loading === project.id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : !publicKey ? (
                                            'Connect Wallet to Proceed'
                                        ) : (
                                            <>Stake to Earn <Zap className="w-5 h-5 ml-2" /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
