export type Kategori = {
    id: string;
    nama: string;
    tipe: "pendapatan" | "pengeluaran" | "produk";
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
    kategori_id: string | null;
    is_active: boolean;
    created_at: string;
    kategori?: Kategori;
};

export type Transaksi = {
    id: string;
    nomor_transaksi: string;
    tanggal: string;
    total: number;
    diskon: number;
    diskon_persen?: number;
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

export type Mitra = {
    id: string;
    nama: string;
    kategori: "Reseller" | "Agen" | "Maklon" | null;
    kontak_wa: string | null;
    alamat: string | null;
    created_at: string;
    updated_at: string;
};

export type TransaksiB2B = {
    id: string;
    nomor_transaksi: string;
    mitra_id: string | null;
    tanggal: string;
    total: number;
    diskon: number;
    ongkir: number;
    total_tagihan: number;
    jumlah_dibayar: number;
    sisa_tagihan: number;
    status_pembayaran: "Lunas" | "DP/Parsial" | "Belum Bayar";
    status_pengiriman: "Diproses" | "Dikirim" | "Selesai";
    jatuh_tempo: string | null;
    metode_pembayaran: string | null;
    catatan: string | null;
    nominal_retur: number;
    user_id: string;
    created_at: string;
    updated_at: string;
    mitra?: Mitra;
    transaksi_b2b_detail?: TransaksiB2BDetail[];
};

export type TransaksiB2BDetail = {
    id: string;
    transaksi_b2b_id: string;
    produk_id: string | null;
    nama_produk: string;
    harga: number;
    jumlah: number;
    subtotal: number;
};

export type UserAuth = {
    id: string;
    email: string;
    role: string;
    last_sign_in_at: string | null;
    created_at: string;
};
