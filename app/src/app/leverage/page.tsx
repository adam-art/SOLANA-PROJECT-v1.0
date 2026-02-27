"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { connection } from '@/lib/solana';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PROGRAM_ID } from '@/lib/solana';
import IDL from '@/lib/idl.json';

export default function LeveragePage() {
    const { publicKey, sendTransaction } = useWallet();
    const [amount, setAmount] = useState('');
    const [leverage, setLeverage] = useState(2);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [txSignature, setTxSignature] = useState<string>('');
    const [balance, setBalance] = useState<number>(1000);

    const handleOpenLeveragedPosition = async () => {
        if (!publicKey || !amount || isNaN(Number(amount))) return;
        if (Number(amount) > balance) {
            alert("Insufficient balance! You only have " + balance.toFixed(2));
            return;
        }
        try {
            setStatus('loading');

            const provider = new anchor.AnchorProvider(connection, (window as any).solana, { preflightCommitment: 'confirmed' });
            const program = new anchor.Program(IDL as any, provider);

            // Generate a new keypair for the leverage position account
            // In a real app, this might be a PDA
            const leveragePosition = anchor.web3.Keypair.generate();
            const collateralBN = new anchor.BN(Number(amount) * 1e6); // Assuming 6 decimals like USDC

            // Find Market PDA if initialized
            const [marketPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("market"), new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v").toBuffer()],
                PROGRAM_ID
            );

            const signature = await program.methods
                .createLeveragePosition(collateralBN, leverage)
                .accounts({
                    user: publicKey,
                    market: marketPDA,
                    leveragePosition: leveragePosition.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([leveragePosition])
                .rpc();

            console.log("Transaction signature", signature);
            setStatus('success');
            setTxSignature(signature);
            setBalance(prev => prev - Number(amount));
            setAmount('');
        } catch (error: any) {
            console.error("Error opening position:", error);

            // Log full details for SendTransactionError as requested
            if (error.logs) {
                console.log("Transaction Logs:", error.logs);
            } else if (typeof error.getLogs === 'function') {
                console.log("Transaction Logs from getLogs():", error.getLogs());
            }

            if (error.message?.includes("HealthFactorTooLow") || error.logs?.some((l: string) => l.includes("HealthFactorTooLow"))) {
                alert("Transaction failed: Health Factor would be too low! Try lowering your leverage or increasing collateral.");
            } else if (error.message?.includes("This program may not be used for executing instructions")) {
                alert("Error: Program ID mismatch or program not deployed to the current network (Devnet). Please deploy the program or update the Program ID in lib/solana.ts.");
            } else {
                alert("Transaction failed. Check console for full details and logs.");
            }
            setStatus('idle');
        }
    };

    const debt = amount ? (Number(amount) * (leverage - 1)).toFixed(2) : '0.00';
    const totalExposure = amount ? (Number(amount) * leverage).toFixed(2) : '0.00';

    // Real calculation for LTV (Debt / Total Exposure * 100)
    const ltv = amount && Number(amount) > 0 ? ((Number(debt) / Number(totalExposure)) * 100).toFixed(2) : '0.00';

    // Health Factor calculation: (Collateral Value * Liquidation Threshold) / Debt
    // For Yield Protocol, let's assume Liquidation Threshold is 85%
    const liquidationThreshold = 0.85;
    const healthFactor = amount && Number(debt) > 0
        ? ((Number(totalExposure) * liquidationThreshold) / Number(debt)).toFixed(2)
        : '∞';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="pb-8 border-b border-white/10">
                <h1 className="text-4xl font-extrabold tracking-tight">Leverage Yield</h1>
                <p className="text-gray-400 mt-2 text-lg">Supercharge your yield up to 10x using isolated margin pools.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Trading Form */}
                <div className="lg:col-span-7 glass-panel p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 text-white/5">
                        <TrendingUp className="w-64 h-64" />
                    </div>

                    <h2 className="text-2xl font-bold mb-8 relative z-10">Open Isolated Position</h2>

                    <div className="space-y-6 relative z-10">
                        {status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start text-green-400 mb-6 slide-in-from-top-4 animate-in">
                                <CheckCircle2 className="w-6 h-6 mr-3 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-bold block">Position opened successfully!</span>
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
                                <label className="text-sm font-medium text-gray-400">Initial Collateral (USDC)</label>
                                <span className="text-sm font-medium text-violet-400 cursor-pointer" onClick={() => setAmount(balance.toString())}>Max: {balance.toFixed(2)}</span>
                            </div>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-field text-xl py-4" placeholder="0.00" />
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between mb-4">
                                <label className="text-sm font-medium text-gray-400">Leverage Slider</label>
                                <span className="text-lg font-bold text-violet-400 bg-white/5 px-4 py-1 rounded-lg border border-white/10">{leverage.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range" min="2" max="10" step="0.5"
                                value={leverage} onChange={e => setLeverage(parseFloat(e.target.value))}
                                className="w-full accent-violet-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                                <span>2.0x</span>
                                <span>5.0x</span>
                                <span>10.0x</span>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start text-red-400 mt-6 pt-4">
                            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                            <p className="text-sm">Leverage trading carries significant risk. If the health factor drops below 1.0, your position will be liquidated and you will lose your collateral.</p>
                        </div>

                        <button
                            onClick={handleOpenLeveragedPosition}
                            disabled={!publicKey || !amount || Number(amount) <= 0 || Number(amount) > balance || status === 'loading'}
                            className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center"
                        >
                            {status === 'loading' ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : !publicKey ? (
                                'Connect Wallet to Proceed'
                            ) : (
                                'Create Long Yield Position'
                            )}
                        </button>
                    </div>
                </div>

                {/* Risk Metrics */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card bg-gradient-to-b from-black to-gray-900 border border-white/10">
                        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-white/10 pb-4">
                            <ShieldAlert className="w-5 h-5 mr-2 text-violet-400" />
                            Simulation Metrics
                        </h3>

                        <div className="space-y-5">
                            <MetricRow label="Total Exposure" value={`$${totalExposure}`} highlight={true} />
                            <MetricRow label="Initial Collateral" value={`$${amount || '0.00'}`} />
                            <MetricRow label="Debt Borrowed" value={`$${debt}`} color="text-red-400" />
                            <div className="border-t border-white/5 my-4"></div>
                            <MetricRow label="Current LTV" value={`${ltv}%`} />
                            <MetricRow label="Liquidation Threshold" value="85.00%" />
                            <MetricRow label="Health Factor" value={healthFactor} color={healthFactor !== '∞' && parseFloat(healthFactor) < 1.1 ? "text-red-500 font-bold" : "text-green-400 font-bold"} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricRow({ label, value, highlight = false, color = "text-white" }: { label: string, value: string, highlight?: boolean, color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">{label}</span>
            <span className={`text-right font-mono ${highlight ? 'text-xl font-bold text-white' : color}`}>
                {value}
            </span>
        </div>
    );
}
