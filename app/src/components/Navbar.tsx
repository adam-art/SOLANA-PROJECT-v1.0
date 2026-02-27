"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

export function Navbar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname?.startsWith(path) ? "text-purple-400" : "text-gray-300 hover:text-white";

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex space-x-8 items-center">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Yield Protocol
                        </Link>
                        <div className="hidden md:flex space-x-6">
                            <Link href="/markets" className={`transition ${isActive('/markets')}`}>Markets</Link>
                            <Link href="/portfolio" className={`transition ${isActive('/portfolio')}`}>Portfolio</Link>
                            <Link href="/leverage" className={`transition ${isActive('/leverage')}`}>Leverage</Link>
                            <Link href="/depin" className={`transition ${isActive('/depin')}`}>DePIN</Link>
                        </div>
                    </div>
                    <div>
                        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
