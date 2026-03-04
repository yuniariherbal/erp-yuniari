-- =============================================
-- ERP Yuniari - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Kategori untuk pendapatan & pengeluaran
CREATE TABLE IF NOT EXISTS kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pendapatan', 'pengeluaran')),
    deskripsi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pendapatan (Income)
CREATE TABLE IF NOT EXISTS pendapatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
    deskripsi TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50),
    catatan TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pengeluaran (Expenses)
CREATE TABLE IF NOT EXISTS pengeluaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
    deskripsi TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50),
    catatan TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Karyawan (Employee)
CREATE TABLE IF NOT EXISTS karyawan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    telepon VARCHAR(20),
    posisi VARCHAR(100),
    gaji_pokok DECIMAL(15,2) NOT NULL,
    tanggal_bergabung DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penggajian (Payroll)
CREATE TABLE IF NOT EXISTS penggajian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karyawan_id UUID REFERENCES karyawan(id) ON DELETE CASCADE,
    periode_bulan INTEGER NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INTEGER NOT NULL,
    gaji_pokok DECIMAL(15,2) NOT NULL,
    tunjangan DECIMAL(15,2) DEFAULT 0,
    potongan DECIMAL(15,2) DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    total_gaji DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dibayar', 'batal')),
    tanggal_bayar DATE,
    catatan TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(karyawan_id, periode_bulan, periode_tahun)
);

-- Produk/Layanan (untuk POS)
CREATE TABLE IF NOT EXISTS produk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(15,2) NOT NULL,
    stok INTEGER DEFAULT 0,
    satuan VARCHAR(50) DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaksi POS
CREATE TABLE IF NOT EXISTS transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_transaksi VARCHAR(50) UNIQUE NOT NULL,
    tanggal TIMESTAMPTZ DEFAULT NOW(),
    total DECIMAL(15,2) NOT NULL,
    diskon DECIMAL(15,2) DEFAULT 0,
    total_bayar DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50),
    catatan TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detail Transaksi POS
CREATE TABLE IF NOT EXISTS transaksi_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
    produk_id UUID REFERENCES produk(id) ON DELETE SET NULL,
    nama_produk VARCHAR(200) NOT NULL,
    harga DECIMAL(15,2) NOT NULL,
    jumlah INTEGER NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL
);

-- Function to decrement stok
CREATE OR REPLACE FUNCTION decrement_stok(p_id UUID, p_jumlah INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE produk SET stok = stok - p_jumlah WHERE id = p_id AND stok >= p_jumlah;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE pendapatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengeluaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE penggajian ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE karyawan ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_detail ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Authenticated users can do everything" ON pendapatan FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON pengeluaran FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON penggajian FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON transaksi FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON kategori FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON karyawan FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON produk FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON transaksi_detail FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- Seed Data (Kategori defaults)
-- =============================================

INSERT INTO kategori (nama, tipe) VALUES
    ('Penjualan', 'pendapatan'),
    ('Jasa', 'pendapatan'),
    ('Lainnya', 'pendapatan'),
    ('Operasional', 'pengeluaran'),
    ('Gaji', 'pengeluaran'),
    ('Sewa', 'pengeluaran'),
    ('Utilitas', 'pengeluaran'),
    ('Perlengkapan', 'pengeluaran'),
    ('Lainnya', 'pengeluaran')
ON CONFLICT DO NOTHING;
