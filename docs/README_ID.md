# Yield Protocol

Aplikasi DeFi Full-Stack di ekosistem Solana yang memungkinkan pengguna melakukan pemisahan hasil (yield-stripping) dari aset berbunga. Aplikasi ini telah dioptimalkan untuk kompatibilitas multi-wallet global seperti **Phantom, Solflare, OKX Wallet, Trust Wallet, dll** menggunakan `@solana/wallet-adapter-react`.

## Fitur Utama & Auto-Kalkulasi
1. **Pemisahan Yield (Sy/PT/YT)**: Setor aset dan pisahkan menjadi Principal Token (PT) dan Yield Token (YT). Aplikasi akan menghitung biaya protokol (0.1%) dan mendistribusikan token PT dan YT secara presisi (1:1).
2. **Leverage Trading**: Buka posisi leverage yield hingga 10x. Sistem secara langsung menghitung:
   - **Total Exposure** = Jaminan Awal x Leverage
   - **Debt (Utang)** = Total Exposure - Jaminan Awal
   - **Current LTV (Loan-To-Value)** = Utang / Total Exposure * 100%
   - **Health Factor** = (Total Exposure * Liquidation Threshold) / Utang
3. **DePIN Staking**: Stake token pada proyek DePIN untuk mendapatkan hasil ekstra (dual-yield). Semua fitur sudah disertakan notifikasi *on-chain* di mana setiap transaksi berhasil akan memunculkan **Link Solana Explorer (Devnet)**!

## Panduan Pengujian (Testnet Users)
Aplikasi terhubung ke jaringan **Solana Devnet**, sehingga tidak menggunakan dana sungguhan.
1. Instal ekstensi dompet Solana (misalnya: Phantom atau Solflare).
2. Ubah mode dompet Anda ke **Solana Devnet**.
3. Klaim SOL Devnet gratis dari [Solana Faucet](https://faucet.solana.com).
4. Akses situs web (misalnya `localhost:3000` atau versi *live*), lalu hubungkan dompet (Connect Wallet).
5. Pada halaman **Markets** atau **Leverage**, masukkan angka dan setujui (Approve) pop-up transaksi dari dompet Anda!
6. Anda bisa melihat bukti konfirmasi transaksi dengan mengeklik tombol **View on Solana Explorer ↗** yang muncul setelah transaksi selesai.

## Panduan Deployment ke Vercel
Karena proyek ini dibangun menggunakan `Next.js 14`, proses deploy ke Vercel sangat mudah:
1. Dorong (*push*) semua pembaruan repositori proyek Anda ke **GitHub, GitLab, atau Bitbucket**.
2. Masuk ke dasbor [Vercel](https://vercel.com).
3. Klik **Add New... > Project**.
4. Impor repositori tempat Anda meletakkan proyek `SOLANA PROJECT v1.0`.
5. Pada menu pengaturan Vercel, pastikan form di bawah ini benar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `app` (Pilih Edit, ketik `app` karena kode sumber berada di dalam `app/`).
   - **Build Command**: `npx prisma generate && next build`ATAU cukup `npm run build` karena prisma di-generate otomatis saat instalasi.
6. Tambahkan `DATABASE_URL` PostgreSQL Anda di menu **Environment Variables**.
7. Klik **Deploy**!
8. Aplikasi Anda akan hidup secara global dalam hitungan menit.

## Teknologi
- **Smart Contract**: Rust, Anchor Framework (Solana).
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Dark Glassmorphism).
- **Database**: PostgreSQL dengan Prisma ORM.
- **Web3**: Solana Web3.js & Wallet Adapter UI.

## Instalasi Lokal Ekstra
1. `cd app`
2. `npm install`
3. Atur konfigurasi `.env` dengan kredensial PostgreSQL.
4. `npx prisma db push`
5. `npm run dev`
