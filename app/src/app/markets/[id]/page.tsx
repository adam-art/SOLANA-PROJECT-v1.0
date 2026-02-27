"use client";
import { useState, use } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { connection } from '@/lib/solana';
import { CheckCircle2, ArrowRightLeft } from 'lucide-react';

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { publicKey, sendTransaction } = useWallet();
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [txSignature, setTxSignature] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'deposit' | 'split'>('deposit');
    const [balance, setBalance] = useState<number>(1000);

    const asset = id === '1' ? 'USDC' : id === '2' ? 'SOL' : 'ETH';

    const handleTransaction = async () => {
        if (!publicKey) {
            alert("Please connect your wallet first");
            return;
        }
        if (!amount || isNaN(Number(amount))) return;
        if (Number(amount) > balance) {
            alert("Insufficient balance! You only have " + balance.toFixed(2));
            return;
        }

        try {
            setStatus('loading');
            // Simulate transaction signing request
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey, // Self-transfer to ensure it shows in wallet history
                    lamports: 1000,
                })
            );
            tx.feePayer = publicKey;
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            const signature = await sendTransaction(tx, connection);
            console.log(`Transaction sent: ${signature}`);

            setStatus('success');
            setTxSignature(signature);
            setBalance(prev => prev - Number(amount));
            setAmount('');
        } catch (error) {
            console.error(error);
            setStatus('idle');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-white/10">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600/50 to-cyan-600/50 border border-white/10 flex items-center justify-center text-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        {asset[0]}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">{asset} Yield Market</h1>
                        <p className="text-gray-400 mt-2 font-medium">Maturity: <span className="text-white">Dec 31, 2026</span></p>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 text-right glass-panel px-6 py-4 rounded-2xl">
                    <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Fixed APY</p>
                    <p className="text-4xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">8.5%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card">
                        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">Market Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Value Locked</span>
                                <span className="font-bold text-white">$12.4M</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Implied APY</span>
                                <span className="font-bold text-cyan-400">8.2%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">PT Price</span>
                                <span className="font-bold text-white">0.92 USDC</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">YT Price</span>
                                <span className="font-bold text-white">0.08 USDC</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden">

                    <div className="flex space-x-2 mb-8 bg-black/50 p-1 rounded-xl w-fit border border-white/5">
                        <button
                            onClick={() => setActiveTab('deposit')}
                            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'deposit' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >Deposit & Mint SY</button>
                        <button
                            onClick={() => setActiveTab('split')}
                            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'split' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >Split into PT/YT</button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start text-green-400 mb-6 animate-in slide-in-from-top-4">
                                <CheckCircle2 className="w-6 h-6 mr-3 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-bold block">Transaction Confirmed!</span>
                                    <a
                                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-300 hover:text-white underline mt-1 inline-block"
                                    >
                                        View on Solana Explorer (Devnet) ↗
                                    </a>
                                </div>
                                <button className="ml-auto text-sm opacity-70 hover:opacity-100" onClick={() => setStatus('idle')}>✕</button>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-400">Amount ({activeTab === 'deposit' ? asset : `s${asset}`})</label>
                                <span className="text-sm font-medium text-violet-400 cursor-pointer" onClick={() => setAmount(balance.toString())}>Max: {balance.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="input-field text-2xl font-mono py-4"
                                    placeholder="0.00"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                    <span className="text-gray-500 font-bold">{activeTab === 'deposit' ? asset : `s${asset}`}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center my-2 text-gray-600">
                            <ArrowRightLeft className="w-6 h-6 rotate-90" />
                        </div>

                        <div className="bg-black/40 p-5 rounded-2xl flex justify-between items-center border border-white/5">
                            <span className="text-sm font-medium text-gray-400">You will receive:</span>
                            <div className="text-right">
                                {activeTab === 'deposit' ? (
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold text-white drop-shadow-md">
                                            {amount ? (Number(amount) * 0.999).toFixed(2) : '0.00'} <span className="text-violet-400 text-lg">s{asset}</span>
                                        </p>
                                        <p className="text-xs text-green-400">Est. Protocol Fee: 0.1%</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold text-white drop-shadow-md">
                                            {amount ? Number(amount).toFixed(2) : '0.00'} <span className="text-cyan-400 text-lg">PT</span>
                                        </p>
                                        <p className="text-xl font-bold text-white">
                                            + {amount ? Number(amount).toFixed(2) : '0.00'} <span className="text-violet-400 text-lg">YT</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleTransaction}
                            disabled={!publicKey || !amount || Number(amount) <= 0 || Number(amount) > balance || status === 'loading'}
                            className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center"
                        >
                            {status === 'loading' ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : !publicKey ? (
                                'Connect Wallet to Proceed'
                            ) : activeTab === 'deposit' ? (
                                'Deposit & Mint SY'
                            ) : (
                                'Split SY'
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
