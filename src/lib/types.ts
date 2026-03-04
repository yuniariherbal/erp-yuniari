export type Kategori = {
    id: string;
    nama: string;
    tipe: "pendapatan" | "pengeluaran";
    deskripsi: string | null;
    created_at: string;
};

export type Pendapatan = {
    id: string;
    tanggal: string;
    kategori_id: string | null;
    deskripsi: string;
    jumlah: number;
    metode_pembayaran: string | null;
    catatan: string | null;
    user_id: string;
    created_at: string;
    kategori?: Kategori;
};

export type Pengeluaran = {
    id: string;
    tanggal: string;
    kategori_id: string | null;
    deskripsi: string;
    jumlah: number;
    metode_pembayaran: string | null;
    catatan: string | null;
    user_id: string;
    created_at: string;
    kategori?: Kategori;
};

export type Karyawan = {
    id: string;
    nama: string;
    email: string | null;
    telepon: string | null;
    posisi: string | null;
    gaji_pokok: number;
    tanggal_bergabung: string;
    status: "aktif" | "nonaktif";
    created_at: string;
};

export type Penggajian = {
    id: string;
    karyawan_id: string;
    periode_bulan: number;
    periode_tahun: number;
    gaji_pokok: number;
    tunjangan: number;
    potongan: number;
    bonus: number;
    total_gaji: number;
    status: "pending" | "dibayar" | "batal";
    tanggal_bayar: string | null;
    catatan: string | null;
    user_id: string;
    created_at: string;
    karyawan?: Karyawan;
};

export type Produk = {
    id: string;
    nama: string;
    deskripsi: string | null;
    harga: number;
    stok: number;
    satuan: string;
    is_active: boolean;
    created_at: string;
};

export type Transaksi = {
    id: string;
    nomor_transaksi: string;
    tanggal: string;
    total: number;
    diskon: number;
    total_bayar: number;
    metode_pembayaran: string | null;
    catatan: string | null;
    user_id: string;
    created_at: string;
    transaksi_detail?: TransaksiDetail[];
};

export type TransaksiDetail = {
    id: string;
    transaksi_id: string;
    produk_id: string | null;
    nama_produk: string;
    harga: number;
    jumlah: number;
    subtotal: number;
};

export type CartItem = {
    produk_id: string;
    nama: string;
    harga: number;
    jumlah: number;
    subtotal: number;
};
