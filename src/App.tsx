import React, { useEffect, useState } from 'react';

// --- CETAKAN DATA ---
interface Room { id: number; name: string; description: string; capacity: number; }
interface Booking { id: number; roomId: number; borrowerName: string; bookingDate: string; endTime: string; status: string; statusHistory: string; }

// TEMA WARNA CUSTOM ARCHTKA (Estetik Pastel)
const THEME = { 
  bg: '#FCF9EA',       // Krem Lembut
  primary: '#BADFDB',  // Mint / Tosca Lembut
  danger: '#FFA4A4',   // Merah/Salmon Lembut
  warning: '#FFBDBD',  // Pink/Warning Lembut
  text: '#2d3748',     // Abu-abu gelap untuk teks utama
  textLight: '#94a3b8' // Abu-abu super soft untuk placeholder/keterangan
};

function App() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'ruangan' | 'peminjaman' | 'riwayat'>('beranda');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<Booking | null>(null);

  // Form State
  const [roomForm, setRoomForm] = useState({ name: '', capacity: '', description: '' });
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const [bookingForm, setBookingForm] = useState({ roomId: '', borrowerName: '', bookingDate: '', endTime: '' });
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // Filter & Pagination State (Riset tiap ganti tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    // Riset filter & halaman tiap pindah tab biar rapi
    setSearchQuery(''); setCurrentPage(1); setSortOrder('desc');
  }, [activeTab]);

  const fetchData = () => {
    fetch('http://localhost:5157/api/Rooms').then(res => res.json()).then(data => setRooms(data));
    fetch('http://localhost:5157/api/Bookings').then(res => res.json()).then(data => setBookings(data));
  };

  useEffect(() => { fetchData(); }, []);

  // Statistik Beranda
  const totalRooms = rooms.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const totalHistory = bookings.filter(b => b.statusHistory && b.statusHistory.length > 0).length;

  // --- FUNGSI CRUD RUANGAN ---
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoomId ? `http://localhost:5157/api/Rooms/${editingRoomId}` : 'http://localhost:5157/api/Rooms';
    const method = editingRoomId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomForm.name, capacity: parseInt(roomForm.capacity), description: "Ruangan Kampus" })
    });
    if (res.ok) { 
      setRoomForm({ name: '', capacity: '', description: '' }); setEditingRoomId(null); setShowRoomModal(false); fetchData(); 
    }
  };

  const handleEditRoomClick = (r: Room) => {
    setEditingRoomId(r.id);
    setRoomForm({ name: r.name, capacity: r.capacity.toString(), description: r.description });
    setShowRoomModal(true);
  }

  const handleDeleteRoom = (id: number) => {
    if (window.confirm("Hapus ruangan ini?")) { fetch(`http://localhost:5157/api/Rooms/${id}`, { method: 'DELETE' }).then(res => { if (res.ok) fetchData(); }); }
  };

  // --- FUNGSI CRUD PEMINJAMAN ---
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBookingId ? `http://localhost:5157/api/Bookings/${editingBookingId}` : 'http://localhost:5157/api/Bookings';
    const method = editingBookingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: parseInt(bookingForm.roomId), borrowerName: bookingForm.borrowerName,
        bookingDate: bookingForm.bookingDate, endTime: bookingForm.endTime
      })
    });
    if (res.ok) {
      setBookingForm({ roomId: '', borrowerName: '', bookingDate: '', endTime: '' });
      setEditingBookingId(null); setShowBookingModal(false); fetchData();
      if(activeTab === 'beranda') setActiveTab('peminjaman'); 
    }
  };

  const handleEditBookingClick = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setBookingForm({
      roomId: booking.roomId.toString(), borrowerName: booking.borrowerName,
      bookingDate: booking.bookingDate.split('.')[0], endTime: booking.endTime.split('.')[0]
    });
    setShowBookingModal(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    fetch(`http://localhost:5157/api/Bookings/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(res => { if (res.ok) fetchData(); });
  };

  const handleDeleteBooking = (id: number) => {
    if (window.confirm("Hapus data peminjaman ini?")) { fetch(`http://localhost:5157/api/Bookings/${id}`, { method: 'DELETE' }).then(res => { if (res.ok) fetchData(); }); }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr); return `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
  };

  // --- LOGIKA FILTER & PAGINASI ---
  let filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  filteredRooms.sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  const totalPagesRooms = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  let filteredBookings = bookings.filter(b => b.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()));
  filteredBookings.sort((a, b) => {
    const timeA = new Date(a.bookingDate).getTime(); const timeB = new Date(b.bookingDate).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB; 
  });
  const totalPagesBookings = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: THEME.bg, minHeight: '100vh', color: THEME.text, paddingBottom: '60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .custom-tab { color: ${THEME.textLight}; padding: 8px 18px; cursor: pointer; border-radius: 20px; font-weight: 500; transition: all 0.3s; margin-left: 8px; }
        .custom-tab:hover { color: ${THEME.text}; background-color: rgba(186, 223, 219, 0.4); }
        .custom-tab.active { background-color: ${THEME.primary}; color: ${THEME.text}; font-weight: 600; box-shadow: 0 4px 10px rgba(186, 223, 219, 0.4); }
        
        .table-custom { border-collapse: separate; border-spacing: 0; width: 100%; margin-bottom: 0; }
        .table-custom th { background-color: ${THEME.primary}; color: ${THEME.text}; font-weight: 600; padding: 16px 15px; border: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-custom thead tr th:first-child { border-top-left-radius: 16px; }
        .table-custom thead tr th:last-child { border-top-right-radius: 16px; }
        
        .table-custom tbody tr:nth-child(even) td { background-color: rgba(186, 223, 219, 0.15); } 
        .table-custom tbody tr:nth-child(odd) td { background-color: white; }
        .table-custom td { padding: 15px; vertical-align: middle; border: none; font-size: 14px; color: ${THEME.text}; }
        .table-custom tbody tr:hover td { background-color: rgba(186, 223, 219, 0.4); transition: 0.2s; }
        
        .btn-pastel-primary { background-color: ${THEME.primary}; color: ${THEME.text}; font-weight: 600; border: none; transition: 0.3s; }
        .btn-pastel-primary:hover { background-color: #a0ccc7; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(186,223,219,0.5); }
        
        .badge-approved { background-color: ${THEME.primary}; color: ${THEME.text}; }
        .badge-rejected { background-color: ${THEME.danger}; color: #742a2a; }
        .badge-pending { background-color: ${THEME.warning}; color: #742a2a; }
        
        .emoji-btn { background: transparent; border: none; font-size: 18px; transition: transform 0.2s; cursor: pointer; padding: 5px; }
        .emoji-btn:hover { transform: scale(1.3); }
        
        .stat-card { transition: all 0.3s; border-radius: 20px; border: none; background-color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.02); cursor: pointer; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px rgba(186,223,219,0.3); }
        
        .layout-container { max-width: 1200px; margin: 0 auto; }

        /* Custom Input Soft Colors */
        .soft-input { color: ${THEME.text}; background-color: #f8fafc; border: 1px solid #e2e8f0; }
        .soft-input::placeholder { color: ${THEME.textLight}; opacity: 0.7; }
        select.soft-input:invalid { color: ${THEME.textLight}; }
        input[type="datetime-local"].soft-input::-webkit-datetime-edit { color: ${THEME.textLight}; }
        input[type="datetime-local"].soft-input::-webkit-datetime-edit-fields-wrapper { color: ${THEME.text}; }
        
        /* Pagination Buttons */
        .page-btn { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 12px; font-weight: 600; color: ${THEME.text}; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: ${THEME.primary}; border-color: ${THEME.primary}; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* ==========================================
          NAVBAR ARCHTKA
      ========================================== */}
      <div className="bg-white shadow-sm sticky-top mb-4">
        <div className="layout-container px-4 py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('beranda')}>
            <span className="fs-3 me-2">🏛️</span>
            <h4 className="mb-0 fw-bold" style={{ color: THEME.text, letterSpacing: '-0.5px' }}>Archtka</h4>
          </div>
          
          <div className="d-flex flex-wrap gap-1 justify-content-end">
            <div className={`custom-tab ${activeTab === 'beranda' ? 'active' : ''}`} onClick={() => setActiveTab('beranda')}>Beranda</div>
            <div className={`custom-tab ${activeTab === 'ruangan' ? 'active' : ''}`} onClick={() => setActiveTab('ruangan')}>Data Ruangan</div>
            <div className={`custom-tab ${activeTab === 'peminjaman' ? 'active' : ''}`} onClick={() => setActiveTab('peminjaman')}>Data Peminjaman</div>
            <div className={`custom-tab ${activeTab === 'riwayat' ? 'active' : ''}`} onClick={() => setActiveTab('riwayat')}>Riwayat</div>
          </div>
        </div>
      </div>

      <div className="layout-container px-4">
        
        {/* Tombol Kembali */}
        {activeTab !== 'beranda' && (
          <div className="mb-3 animate__animated animate__fadeIn">
            <button className="btn btn-sm bg-white shadow-sm rounded-pill px-3 fw-bold" style={{ color: THEME.textLight, border: '1px solid #e2e8f0' }} onClick={() => setActiveTab('beranda')}>
              ⬅ Kembali ke Beranda
            </button>
          </div>
        )}

        {/* ==========================================
            TAB 1: BERANDA (BANNER DIREVISI)
        ========================================== */}
        {activeTab === 'beranda' && (
          <div className="animate__animated animate__fadeIn">
            
            {/* BANNER SELAMAT DATANG TUKAR POSISI */}
            <div className="card border-0 mb-5 overflow-hidden" style={{ borderRadius: '24px', background: `linear-gradient(135deg, ${THEME.primary} 0%, #dcf0ed 100%)`, boxShadow: '0 10px 25px rgba(186,223,219,0.4)' }}>
              <div className="card-body p-4 p-md-5 d-flex flex-column-reverse flex-md-row justify-content-between align-items-center">
                
                {/* Teks Kiri, Agak Menjorok ke Dalam & Memanjang */}
                <div className="text-center text-md-start ps-md-4 mt-4 mt-md-0" style={{ maxWidth: '650px' }}>
                  <h2 className="fw-bold mb-3" style={{ color: THEME.text, lineHeight: '1.2' }}>
                    Selamat Datang di <br className="d-none d-md-block"/>Aplikasi Peminjaman Ruangan
                  </h2>
                  <p className="mb-0" style={{ color: '#4a5568', fontSize: '1.05rem', lineHeight: '1.6' }}>
                    Kelola ketersediaan prasarana, pantau seluruh pengajuan masuk, 
                    serta periksa riwayat aktivitas dengan antarmuka yang lebih cerdas, rapi, dan elegan.
                  </p>
                </div>

                {/* Emoticon Kanan (Peminjaman & Kalender) */}
                <div className="display-1 pe-md-4" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.1)' }}>
                  📅🗝️
                </div>

              </div>
            </div>

            {/* 4 KOTAK STATISTIK */}
            <div className="row g-4 mb-4">
              <div className="col-md-3 col-sm-6">
                <div className="card stat-card h-100 p-4 d-flex flex-column justify-content-between" onClick={() => setActiveTab('ruangan')}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: THEME.primary, fontSize: '20px' }}>🏢</div>
                    <div><h6 className="text-muted mb-0 small fw-bold">Total Ruangan</h6><h3 className="fw-bold mb-0">{totalRooms}</h3></div>
                  </div>
                  <div className="border-top pt-2 mt-2 text-end small fw-bold" style={{ color: THEME.textLight }}>Lihat Detail ➔</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="card stat-card h-100 p-4 d-flex flex-column justify-content-between" onClick={() => { setEditingBookingId(null); setBookingForm({ roomId: '', borrowerName: '', bookingDate: '', endTime: '' }); setShowBookingModal(true); }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: '#f1f5f9', fontSize: '20px' }}>📝</div>
                    <div><h6 className="text-muted mb-0 small fw-bold">Total Pengajuan</h6><h3 className="fw-bold mb-0">{totalBookings}</h3></div>
                  </div>
                  <div className="border-top pt-2 mt-2 text-end small fw-bold" style={{ color: THEME.textLight }}>Buat Baru ➔</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="card stat-card h-100 p-4 d-flex flex-column justify-content-between" onClick={() => setActiveTab('peminjaman')}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: THEME.warning, fontSize: '20px' }}>⏳</div>
                    <div><h6 className="text-muted mb-0 small fw-bold">Menunggu ACC</h6><h3 className="fw-bold mb-0">{pendingBookings}</h3></div>
                  </div>
                  <div className="border-top pt-2 mt-2 text-end small fw-bold" style={{ color: THEME.textLight }}>Verifikasi ➔</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="card stat-card h-100 p-4 d-flex flex-column justify-content-between" onClick={() => setActiveTab('riwayat')}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: THEME.danger, fontSize: '20px' }}>📜</div>
                    <div><h6 className="text-muted mb-0 small fw-bold">Total Riwayat</h6><h3 className="fw-bold mb-0">{totalHistory}</h3></div>
                  </div>
                  <div className="border-top pt-2 mt-2 text-end small fw-bold" style={{ color: THEME.textLight }}>Buka Log ➔</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PENGATURAN TABEL UMUM (SEARCH & PAGINATION UI)
        ========================================== */}
        {activeTab !== 'beranda' && (
          <div className="d-flex flex-wrap justify-content-between align-items-end mb-3">
            <h4 className="fw-bold mb-2 mb-md-0">{activeTab === 'ruangan' ? 'Data Prasarana' : activeTab === 'peminjaman' ? 'Data Pengajuan' : 'Riwayat Status'}</h4>
            <div className="d-flex gap-2">
              <input type="text" className="form-control rounded-pill soft-input px-3" placeholder="🔍 Cari data..." value={searchQuery} onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}} style={{ width: '200px' }} />
              <select className="form-select rounded-pill soft-input px-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} style={{ width: '150px' }}>
                <option value="desc">⬇️ Terbaru</option>
                <option value="asc">⬆️ Terlama</option>
              </select>
              {activeTab === 'ruangan' && (
                <button className="btn btn-pastel-primary rounded-pill px-4 shadow-sm" onClick={() => { setEditingRoomId(null); setRoomForm({ name: '', capacity: '', description: '' }); setShowRoomModal(true); }}>+ Tambah Ruangan</button>
              )}
              {activeTab === 'peminjaman' && (
                <button className="btn btn-pastel-primary rounded-pill px-4 shadow-sm" onClick={() => { setEditingBookingId(null); setBookingForm({ roomId: '', borrowerName: '', bookingDate: '', endTime: '' }); setShowBookingModal(true); }}>+ Input Pengajuan</button>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: DATA RUANGAN
        ========================================== */}
        {activeTab === 'ruangan' && (
          <div className="card border-0 shadow-sm animate__animated animate__fadeIn" style={{ borderRadius: '16px', backgroundColor: 'transparent' }}>
            <div className="card-body p-0 table-responsive">
              <table className="table-custom">
                <thead><tr><th className="ps-4">No.</th><th>Nama Ruangan</th><th>Kapasitas</th><th>Keterangan</th><th className="text-center">Aksi</th></tr></thead>
                <tbody>
                  {paginatedRooms.map((r, index) => (
                    <tr key={r.id}>
                      <td className="ps-4 fw-bold" style={{ color: THEME.textLight }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-bold">{r.name}</td>
                      <td>{r.capacity} Orang</td>
                      <td><span className="small text-muted">Prasarana Terdaftar</span></td>
                      <td className="text-center">
                        <button className="emoji-btn me-2" title="Edit" onClick={() => handleEditRoomClick(r)}>✏️</button>
                        <button className="emoji-btn" title="Hapus" onClick={() => handleDeleteRoom(r.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {paginatedRooms.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted bg-white">Tidak ada data ditemukan.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: DATA PEMINJAMAN
        ========================================== */}
        {activeTab === 'peminjaman' && (
          <div className="card border-0 shadow-sm animate__animated animate__fadeIn" style={{ borderRadius: '16px', backgroundColor: 'transparent' }}>
            <div className="card-body p-0 table-responsive">
              <table className="table-custom" style={{ minWidth: '850px' }}>
                <thead>
                  <tr><th className="ps-4">No.</th><th>Pengaju</th><th>Ruangan</th><th>Jadwal Pelaksanaan</th><th className="text-center">Verifikasi</th><th className="text-center">Status</th><th className="text-center pe-4">Aksi</th></tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b, index) => {
                    const roomName = rooms.find(r => r.id === b.roomId)?.name || `Ruang #${b.roomId}`;
                    return (
                      <tr key={b.id}>
                        <td className="ps-4 fw-bold" style={{ color: THEME.textLight }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="fw-bold">{b.borrowerName}</td>
                        <td className="fw-medium">{roomName}</td>
                        <td>
                          <div>{formatDateTime(b.bookingDate)}</div>
                          <div className="small" style={{ color: THEME.textLight }}>s.d {formatDateTime(b.endTime)}</div>
                        </td>
                        <td className="text-center">
                          {b.status === 'Pending' ? (
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn badge rounded-pill badge-approved px-3 py-2 border-0 fw-bold shadow-sm" onClick={() => handleUpdateStatus(b.id, 'Approved')}>Approve</button>
                                <button className="btn badge rounded-pill badge-rejected px-3 py-2 border-0 fw-bold shadow-sm" onClick={() => handleUpdateStatus(b.id, 'Rejected')}>Reject</button>
                              </div>
                          ) : ( <span className="small text-muted">- Selesai -</span> )}
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 py-2 shadow-sm ${b.status === 'Approved' ? 'badge-approved' : b.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{b.status}</span>
                        </td>
                        <td className="text-center pe-4">
                          <button className="emoji-btn me-1" title="Edit Data" onClick={() => handleEditBookingClick(b)}>✏️</button>
                          <button className="emoji-btn" title="Hapus Data" onClick={() => handleDeleteBooking(b.id)}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedBookings.length === 0 && <tr><td colSpan={7} className="text-center py-5 text-muted bg-white">Tidak ada pengajuan ditemukan.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: RIWAYAT
        ========================================== */}
        {activeTab === 'riwayat' && (
          <div className="card border-0 shadow-sm animate__animated animate__fadeIn" style={{ borderRadius: '16px', backgroundColor: 'transparent' }}>
            <div className="card-body p-0 table-responsive">
              <table className="table-custom">
                <thead>
                  <tr><th className="ps-4">No.</th><th>Peminjam & Ruang</th><th className="text-center">Status Akhir</th><th>Riwayat Terakhir</th><th className="text-center pe-4">Detail</th></tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b, index) => {
                    const roomName = rooms.find(r => r.id === b.roomId)?.name || `Ruang #${b.roomId}`;
                    const historyLines = b.statusHistory ? b.statusHistory.split('\n') : [];
                    const lastHistory = historyLines.length > 0 ? historyLines[historyLines.length - 1] : 'Tidak ada catatan.';
                    return (
                      <tr key={b.id}>
                        <td className="ps-4 fw-bold" style={{ color: THEME.textLight }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div className="fw-bold">{b.borrowerName}</div>
                          <div className="small" style={{ color: THEME.textLight }}>{roomName}</div>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 py-2 shadow-sm ${b.status === 'Approved' ? 'badge-approved' : b.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{b.status}</span>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span className="text-truncate d-inline-block w-100">{lastHistory}</span>
                        </td>
                        <td className="text-center pe-4">
                          <button className="btn badge rounded-pill badge-approved px-3 py-2 border-0 fw-bold shadow-sm" onClick={() => setShowHistoryModal(b)}>Lihat Log Lengkap</button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedBookings.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted bg-white">Belum ada riwayat yang tercatat.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            FOOTER PAGINATION (Khusus Tabel)
        ========================================== */}
        {activeTab !== 'beranda' && (
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 bg-white p-3 shadow-sm rounded-4">
            <div className="small fw-bold mb-2 mb-md-0" style={{ color: THEME.textLight }}>
              Tampilkan 
              <select className="mx-2 rounded soft-input px-2 py-1" value={itemsPerPage} onChange={e => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select> 
              baris per halaman
            </div>
            
            {/* Logic Paginasi */}
            {(() => {
              const totalPages = activeTab === 'ruangan' ? totalPagesRooms : totalPagesBookings;
              return (
                <div className="d-flex align-items-center gap-2">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
                  <span className="fw-bold mx-2" style={{ color: THEME.text }}>{currentPage} / {totalPages || 1}</span>
                  <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* ==========================================
          MODALS POP-UP (Dengan Input Soft)
      ========================================== */}
      
      {/* 1. Modal Ruangan */}
      {showRoomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(45, 55, 72, 0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white shadow-lg p-4 animate__animated animate__zoomIn" style={{ width: '90%', maxWidth: '400px', borderRadius: '25px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">🏢 {editingRoomId ? 'Edit Ruangan' : 'Tambah Ruangan'}</h5>
              <button className="btn-close" onClick={() => setShowRoomModal(false)}></button>
            </div>
            <form onSubmit={handleSaveRoom}>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Nama Ruangan</label>
                <input type="text" className="form-control rounded-3 py-2 soft-input" placeholder="Misal: Aula Utama" required value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Kapasitas (Orang)</label>
                <input type="number" className="form-control rounded-3 py-2 soft-input" placeholder="Misal: 100" required value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-pastel-primary w-100 rounded-pill py-2 shadow-sm">Simpan Ruangan</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Form Peminjaman (+ Input Pengajuan) */}
      {showBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(45, 55, 72, 0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white shadow-lg p-4 animate__animated animate__zoomIn" style={{ width: '90%', maxWidth: '450px', borderRadius: '25px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h5 className="fw-bold mb-0">{editingBookingId ? '✏️ Edit Data Pengajuan' : '📝 Input Pengajuan'}</h5>
              <button className="btn-close" onClick={() => setShowBookingModal(false)}></button>
            </div>
            <form onSubmit={handleSaveBooking}>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Nama Pengaju</label>
                <input type="text" className="form-control rounded-3 py-2 soft-input" placeholder="Ketik nama lengkap..." required value={bookingForm.borrowerName} onChange={e => setBookingForm({...bookingForm, borrowerName: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Pilihan Prasarana</label>
                <select className="form-select rounded-3 py-2 soft-input" required value={bookingForm.roomId} onChange={e => setBookingForm({...bookingForm, roomId: e.target.value})}>
                  <option value="" disabled hidden>-- Silakan Pilih --</option>
                  {rooms.map(r => <option key={r.id} value={r.id} style={{ color: THEME.text }}>{r.name} (Max: {r.capacity})</option>)}
                </select>
              </div>
              <div className="row mb-4">
                <div className="col-6">
                  <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Waktu Mulai</label>
                  <input type="datetime-local" className="form-control rounded-3 py-2 soft-input" required value={bookingForm.bookingDate} onChange={e => setBookingForm({...bookingForm, bookingDate: e.target.value})} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold" style={{ color: THEME.textLight }}>Waktu Selesai</label>
                  <input type="datetime-local" className="form-control rounded-3 py-2 soft-input" required value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-pastel-primary w-100 rounded-pill py-2 shadow-sm">
                {editingBookingId ? "Simpan Perubahan" : "Simpan Pengajuan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Log Riwayat */}
      {showHistoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(45, 55, 72, 0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white shadow-lg overflow-hidden animate__animated animate__zoomIn" style={{ width: '90%', maxWidth: '500px', borderRadius: '25px' }}>
            <div className="px-4 py-3 d-flex justify-content-between align-items-center border-bottom" style={{ backgroundColor: THEME.primary }}>
              <h5 className="fw-bold mb-0 text-white">Riwayat Sistem</h5>
              <button className="btn-close btn-close-white" onClick={() => setShowHistoryModal(null)}></button>
            </div>
            <div className="p-4 bg-white" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <div className="mb-3">
                <h6 className="fw-bold mb-0">{showHistoryModal.borrowerName}</h6>
                <small style={{ color: THEME.textLight }}>{rooms.find(r => r.id === showHistoryModal.roomId)?.name}</small>
              </div>
              <div className="rounded-3 p-3 border shadow-sm small" style={{ backgroundColor: THEME.bg }}>
                {showHistoryModal.statusHistory ? showHistoryModal.statusHistory.split('\n').map((historyItem, index) => (
                  <div key={index} className="mb-2 pb-2 border-bottom border-white fw-medium text-secondary">{historyItem}</div>
                )) : ( <div>Belum ada log sistem.</div> )}
              </div>
            </div>
            <div className="p-3 text-end border-top" style={{ backgroundColor: THEME.bg }}>
              <button className="btn btn-light rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowHistoryModal(null)}>Tutup Log</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;