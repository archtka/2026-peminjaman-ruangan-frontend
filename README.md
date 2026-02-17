# Archtka - Sistem Peminjaman Ruangan

## Description
Sistem Informasi Manajemen Peminjaman Ruangan berbasis Web yang dirancang untuk mendigitalisasi proses peminjaman prasarana di lingkungan kampus Politeknik Elektronika Negeri Surabaya.

## Features
- Manajemen Data Prasarana (Ruangan & Kapasitas).
- Pengajuan Peminjaman Ruangan dengan sistem anti-bentrok.
- Verifikasi Status (Approve/Reject).
- Perekaman Jejak Aktivitas (Log History).
- Smart Data Table (Paginasi, Pencarian, Pengurutan).

## Tech Stack
- **Frontend:** React.js, TypeScript, Bootstrap/Tailwind CSS
- **Backend:** ASP.NET Core Web API (C#)
- **Database:** SQLite / SQL Server

## Installation
1. Clone repository ini: `git clone [LINK_REPO_ANDA]`
2. Untuk Backend: Buka folder backend dan jalankan `dotnet restore`.
3. Untuk Frontend: Buka folder frontend dan jalankan `npm install`.

## Usage
1. Jalankan server Backend dengan perintah: `dotnet run` (berjalan di localhost:5157).
2. Jalankan server Frontend dengan perintah: `npm start` (berjalan di localhost:3000).
3. Akses web di browser, masuk ke menu Data Ruangan atau Data Peminjaman untuk mulai mengelola prasarana.

## Environment Variables
Buat file `.env` berdasarkan file `.env.example`.
- `DATABASE_URL` = [Konfigurasi koneksi database Anda]
- `API_PORT` = 5157

## Contributing
Sistem ini bersifat tertutup (Private Project) untuk keperluan internal kampus. Kontribusi dilakukan melalui sistem Branching dan Pull Request yang disetujui oleh Project Manager.

## License
MIT License

## Credits / Author Info
Dikembangkan oleh Archtka (Mahasiswa PENS) untuk pemenuhan Tugas Pendahuluan Track PBL 2026.
