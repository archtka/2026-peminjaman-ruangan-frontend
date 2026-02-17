# 🏛️ Archtka - PENS E-Office (Sistem Peminjaman Ruangan)

Sistem Informasi Manajemen Peminjaman Ruangan berbasis Web yang dirancang untuk mendigitalisasi proses peminjaman prasarana di lingkungan kampus. 

## 📖 Studi Kasus
Proses peminjaman ruangan di kampus seringkali mengalami bentrok jadwal dan tidak tercatatnya riwayat secara transparan. Archtka hadir sebagai solusi E-Office untuk Admin mengelola prasarana, memverifikasi pengajuan peminjaman (Approve/Reject), dan melacak rekam jejak (*log history*) dari setiap perubahan status secara *real-time*.

## 🚀 Fitur Utama & Fungsionalitas
1. **Dashboard Analitik:** Menampilkan statistik total ruangan, pengajuan, dan status *Pending*.
2. **Manajemen Prasarana (CRUD):** Tambah, Edit, Hapus, dan Lihat data ruangan beserta kapasitasnya.
3. **Manajemen Pengajuan Peminjaman:** - Input pengajuan manual.
   - Verifikasi pengajuan (Approve / Reject) yang otomatis mengubah status.
   - *Conflict Handling* (Pencegahan jadwal bentrok).
4. **Log Riwayat (History):** Mencatat setiap aktivitas *update* status secara mendetail.
5. **Smart Table:** Dilengkapi fitur *Search*, *Sort* (Terbaru/Terlama), dan *Pagination* (5, 10, 15 baris).

## 🏗️ Arsitektur Sistem
Aplikasi ini dibangun dengan arsitektur **Client-Server**:
- **Frontend (Client):** React.js dengan TypeScript, mengadopsi UI/UX modern (Pastel Theme, Zebra-striped tables, Responsive Design).
- **Backend (API):** ASP.NET Core Web API (C#) menggunakan Entity Framework Core.
- **Database:** SQLite (untuk fase *development* dan MVP).

## 🔌 API Specification (Singkat)
- `GET /api/Rooms` : Mengambil seluruh data ruangan.
- `POST /api/Rooms` : Menambahkan ruangan baru.
- `GET /api/Bookings` : Mengambil seluruh data peminjaman beserta log riwayat.
- `POST /api/Bookings` : Membuat pengajuan baru (terdapat validasi bentrok jadwal).
- `PUT /api/Bookings/{id}/status` : Update status peminjaman (Approve/Reject).

## 💻 Cara Instalasi & Menjalankan
1. **Backend:** Buka terminal di folder backend -> jalankan `dotnet run` (Berjalan di `http://localhost:5157`).
2. **Frontend:** Buka terminal di folder frontend -> jalankan `npm install` lalu `npm start` (Berjalan di `http://localhost:3000`).

## 💡 Refleksi Pembelajaran
Melalui proyek ini, mahasiswa memahami pentingnya integrasi antara Frontend dan RESTful API Backend, manajemen *state* pada React, serta implementasi *business logic* (seperti validasi waktu dan pencatatan log) langsung pada sisi Backend.