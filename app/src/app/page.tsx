"use client";
import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, ShieldCheck, Activity, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function DashboardPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 md:p-12 glass-panel">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-cyan-600/20 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
            </span>
            <span>Yield Protocol v1.0 is Live on Devnet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Unlock the power of <br />
            <span className="text-gradient">Yield-Stripping</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Split your yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT).
            Trade, leverage, and maximize your DeFi returns on the lightning-fast Solana network.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/markets" className="btn-primary flex items-center">
              Explore Markets <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!connected && (
              <button className="btn-secondary flex items-center" onClick={() => setVisible(true)}>
                Connect Wallet <Zap className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Value Locked" value="$42,105,920" icon={<ShieldCheck className="w-6 h-6 text-violet-400" />} trend="+12.5%" />
        <StatCard title="24h Trading Volume" value="$12,492,103" icon={<BarChart3 className="w-6 h-6 text-cyan-400" />} trend="+5.2%" />
        <StatCard title="Average Yield (APY)" value="14.2%" icon={<TrendingUp className="w-6 h-6 text-green-400" />} trend="+1.1%" />
        <StatCard title="Active Positions" value="3,291" icon={<Activity className="w-6 h-6 text-amber-400" />} trend="+8.4%" />
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <FeatureCard title="Mint & Split" desc="Deposit assets to map them into Standardized Yield (SY), then split into PT and YT." number="01" />
        <FeatureCard title="Trade Yield" desc="Speculate on yield direction by holding YT, or lock in fixed yield by holding PT." number="02" />
        <FeatureCard title="Leverage" desc="Multiply your yield exposure up to 10x with our integrated margin engine." number="03" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass-card flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 inline-block">
          {icon}
        </div>
        <div className="flex items-center text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
          {trend}
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, number }: { title: string, desc: string, number: string }) {
  return (
    <div className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden group">
      <div className="absolute -right-8 -top-8 text-9xl font-black text-white/5 transition-transform group-hover:scale-110 group-hover:text-white/10">{number}</div>
      <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{title}</h3>
      <p className="text-gray-400 relative z-10 leading-relaxed">{desc}</p>
    </div>
  );
}
