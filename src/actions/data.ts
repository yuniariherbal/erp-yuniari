"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ========== KATEGORI ==========
export async function getKategori(tipe?: "pendapatan" | "pengeluaran" | "produk") {
    const supabase = await createClient();
    let query = supabase.from("kategori").select("*").order("nama");
    if (tipe) query = query.eq("tipe", tipe);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function upsertKategori(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;
    const payload = {
        nama: formData.get("nama") as string,
        tipe: formData.get("tipe") as string,
        deskripsi: (formData.get("deskripsi") as string) || null,
    };

    if (id) {
        const { error } = await supabase.from("kategori").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("kategori").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/pendapatan");
    revalidatePath("/pengeluaran");
    revalidatePath("/dashboard/produk");
    revalidatePath("/dashboard/produk/kategori");
    return { success: true };
}

// ========== PENDAPATAN ==========
export async function getPendapatan(bulan?: number, tahun?: number) {
    const supabase = await createClient();
    let query = supabase
        .from("pendapatan")
        .select("*, kategori(*)")
        .order("tanggal", { ascending: false });

    if (bulan && tahun) {
        const start = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
        const endMonth = bulan === 12 ? 1 : bulan + 1;
        const endYear = bulan === 12 ? tahun + 1 : tahun;
        const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
        query = query.gte("tanggal", start).lt("tanggal", end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function upsertPendapatan(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const id = formData.get("id") as string | null;
    const payload = {
        tanggal: formData.get("tanggal") as string,
        kategori_id: (formData.get("kategori_id") as string) || null,
        deskripsi: formData.get("deskripsi") as string,
        jumlah: parseFloat(formData.get("jumlah") as string),
        metode_pembayaran: (formData.get("metode_pembayaran") as string) || null,
        catatan: (formData.get("catatan") as string) || null,
        user_id: user.id,
    };

    if (id) {
        const { error } = await supabase.from("pendapatan").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("pendapatan").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/pendapatan");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePendapatan(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("pendapatan").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/pendapatan");
    revalidatePath("/dashboard");
    return { success: true };
}

// ========== PENGELUARAN ==========
export async function getPengeluaran(bulan?: number, tahun?: number) {
    const supabase = await createClient();
    let query = supabase
        .from("pengeluaran")
        .select("*, kategori(*)")
        .order("tanggal", { ascending: false });

    if (bulan && tahun) {
        const start = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
        const endMonth = bulan === 12 ? 1 : bulan + 1;
        const endYear = bulan === 12 ? tahun + 1 : tahun;
        const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
        query = query.gte("tanggal", start).lt("tanggal", end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function upsertPengeluaran(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const id = formData.get("id") as string | null;
    const payload = {
        tanggal: formData.get("tanggal") as string,
        kategori_id: (formData.get("kategori_id") as string) || null,
        deskripsi: formData.get("deskripsi") as string,
        jumlah: parseFloat(formData.get("jumlah") as string),
        metode_pembayaran: (formData.get("metode_pembayaran") as string) || null,
        catatan: (formData.get("catatan") as string) || null,
        user_id: user.id,
    };

    if (id) {
        const { error } = await supabase.from("pengeluaran").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("pengeluaran").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/pengeluaran");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePengeluaran(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("pengeluaran").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/pengeluaran");
    revalidatePath("/dashboard");
    return { success: true };
}

// ========== KARYAWAN ==========
export async function getKaryawan() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("karyawan")
        .select("*")
        .order("nama");
    if (error) throw error;
    return data;
}

export async function upsertKaryawan(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;
    const payload = {
        nama: formData.get("nama") as string,
        email: (formData.get("email") as string) || null,
        telepon: (formData.get("telepon") as string) || null,
        posisi: (formData.get("posisi") as string) || null,
        gaji_pokok: parseFloat(formData.get("gaji_pokok") as string),
        tanggal_bergabung: formData.get("tanggal_bergabung") as string,
        status: (formData.get("status") as string) || "aktif",
    };

    if (id) {
        const { error } = await supabase.from("karyawan").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("karyawan").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/karyawan");
    revalidatePath("/penggajian");
    return { success: true };
}

export async function deleteKaryawan(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("karyawan").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/karyawan");
    return { success: true };
}

// ========== PENGGAJIAN ==========
export async function getPenggajian(bulan?: number, tahun?: number) {
    const supabase = await createClient();
    let query = supabase
        .from("penggajian")
        .select("*, karyawan(*)")
        .order("created_at", { ascending: false });

    if (bulan) query = query.eq("periode_bulan", bulan);
    if (tahun) query = query.eq("periode_tahun", tahun);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function upsertPenggajian(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const id = formData.get("id") as string | null;
    const gaji_pokok = parseFloat(formData.get("gaji_pokok") as string) || 0;
    const tunjangan = parseFloat(formData.get("tunjangan") as string) || 0;
    const potongan = parseFloat(formData.get("potongan") as string) || 0;
    const bonus = parseFloat(formData.get("bonus") as string) || 0;

    const payload = {
        karyawan_id: formData.get("karyawan_id") as string,
        periode_bulan: parseInt(formData.get("periode_bulan") as string),
        periode_tahun: parseInt(formData.get("periode_tahun") as string),
        gaji_pokok,
        tunjangan,
        potongan,
        bonus,
        total_gaji: gaji_pokok + tunjangan + bonus - potongan,
        status: (formData.get("status") as string) || "pending",
        tanggal_bayar: (formData.get("tanggal_bayar") as string) || null,
        catatan: (formData.get("catatan") as string) || null,
        user_id: user.id,
    };

    if (id) {
        const { error } = await supabase.from("penggajian").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("penggajian").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/penggajian");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePenggajian(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("penggajian").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/penggajian");
    return { success: true };
}

export async function bayarGaji(id: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase
        .from("penggajian")
        .update({ status: "dibayar", tanggal_bayar: today })
        .eq("id", id);
    if (error) return { error: error.message };

    // Also record it as pengeluaran
    const { data: gaji } = await supabase.from("penggajian").select("*, karyawan(nama)").eq("id", id).single();
    if (gaji) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("pengeluaran").insert({
            tanggal: today,
            deskripsi: `Gaji ${gaji.karyawan?.nama} - ${gaji.periode_bulan}/${gaji.periode_tahun}`,
            jumlah: gaji.total_gaji,
            metode_pembayaran: "Transfer Bank",
            catatan: "Otomatis dari penggajian",
            user_id: user?.id,
        });
    }

    revalidatePath("/penggajian");
    revalidatePath("/pengeluaran");
    revalidatePath("/dashboard");
    return { success: true };
}

// ========== PRODUK ==========
export async function getProduk(categoryId?: string) {
    const supabase = await createClient();
    let query = supabase
        .from("produk")
        .select("*, kategori(*)")
        .eq("is_active", true)
        .order("nama");

    if (categoryId && categoryId !== "all") {
        query = query.eq("kategori_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function upsertProduk(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;
    const payload = {
        nama: formData.get("nama") as string,
        deskripsi: (formData.get("deskripsi") as string) || null,
        harga: parseFloat(formData.get("harga") as string),
        stok: parseInt(formData.get("stok") as string) || 0,
        satuan: (formData.get("satuan") as string) || "pcs",
        kategori_id: (formData.get("kategori_id") as string) || null,
        is_active: true,
    };

    if (id) {
        const { error } = await supabase.from("produk").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("produk").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/dashboard/produk");
    revalidatePath("/dashboard/pos");
    revalidatePath("/pos");
    return { success: true };
}

export async function deleteProduk(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("produk").update({ is_active: false }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/pos");
    return { success: true };
}

// ========== TRANSAKSI POS ==========
export async function getTransaksi(limit = 50) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("transaksi")
        .select("*, transaksi_detail(*)")
        .order("tanggal", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data;
}

export async function getTransaksiById(idOrNomor: string) {
    const supabase = await createClient();
    // Try by ID first, then by nomor_transaksi
    let query = supabase.from("transaksi").select("*, transaksi_detail(*)");

    // Check if it looks like a UUID
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNomor);

    if (isId) {
        query = query.eq("id", idOrNomor);
    } else {
        query = query.eq("nomor_transaksi", idOrNomor);
    }

    const { data, error } = await query.single();
    if (error) {
        console.error("Error getTransaksiById:", error);
        return null;
    }
    return data;
}

export async function createTransaksi(
    items: { produk_id: string; nama_produk: string; harga: number; jumlah: number; subtotal: number }[],
    diskon: number,
    diskon_persen: number,
    metode_pembayaran: string,
    catatan?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const total_bayar = total - diskon;
    const nomor = `TRX-${Date.now()}`;

    const { data: trx, error: trxError } = await supabase
        .from("transaksi")
        .insert({
            nomor_transaksi: nomor,
            total,
            diskon,
            diskon_persen,
            total_bayar,
            metode_pembayaran,
            catatan: catatan || null,
            user_id: user.id,
        })
        .select()
        .single();

    if (trxError) return { error: trxError.message };

    const details = items.map((item) => ({
        transaksi_id: trx.id,
        ...item,
    }));

    const { error: detailError } = await supabase.from("transaksi_detail").insert(details);
    if (detailError) return { error: detailError.message };

    // Update stok
    for (const item of items) {
        await supabase.rpc("decrement_stok", { p_id: item.produk_id, p_jumlah: item.jumlah });
    }

    // Record as pendapatan
    await supabase.from("pendapatan").insert({
        tanggal: new Date().toISOString().split("T")[0],
        deskripsi: `Transaksi POS ${nomor}`,
        jumlah: total_bayar,
        metode_pembayaran,
        catatan: `${items.length} item`,
        user_id: user.id,
    });

    revalidatePath("/pos");
    revalidatePath("/pendapatan");
    revalidatePath("/dashboard");
    return { success: true, nomor };
}

// ========== DASHBOARD STATS ==========
export async function getDashboardStats() {
    const supabase = await createClient();
    const now = new Date();
    const bulanIni = now.getMonth() + 1;
    const tahunIni = now.getFullYear();
    const startDate = `${tahunIni}-${String(bulanIni).padStart(2, "0")}-01`;
    const endMonth = bulanIni === 12 ? 1 : bulanIni + 1;
    const endYear = bulanIni === 12 ? tahunIni + 1 : tahunIni;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const [pendapatan, pengeluaran, transaksi, penggajianPending] = await Promise.all([
        supabase
            .from("pendapatan")
            .select("jumlah")
            .gte("tanggal", startDate)
            .lt("tanggal", endDate),
        supabase
            .from("pengeluaran")
            .select("jumlah")
            .gte("tanggal", startDate)
            .lt("tanggal", endDate),
        supabase
            .from("transaksi")
            .select("total_bayar, tanggal")
            .order("tanggal", { ascending: false })
            .limit(5),
        supabase
            .from("penggajian")
            .select("id")
            .eq("status", "pending"),
    ]);

    const totalPendapatan = (pendapatan.data || []).reduce((sum, r) => sum + r.jumlah, 0);
    const totalPengeluaran = (pengeluaran.data || []).reduce((sum, r) => sum + r.jumlah, 0);

    // Get monthly data for chart (last 6 months)
    const sixMonthsAgoD = new Date(tahunIni, bulanIni - 6, 1);
    const sixMonthsAgoS = `${sixMonthsAgoD.getFullYear()}-${String(sixMonthsAgoD.getMonth() + 1).padStart(2, "0")}-01`;

    const [allP, allK] = await Promise.all([
        supabase.from("pendapatan").select("jumlah, tanggal").gte("tanggal", sixMonthsAgoS).lt("tanggal", endDate),
        supabase.from("pengeluaran").select("jumlah, tanggal").gte("tanggal", sixMonthsAgoS).lt("tanggal", endDate),
    ]);

    const chartData = [];
    const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(tahunIni, bulanIni - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const s = `${y}-${String(m).padStart(2, "0")}`; // YYYY-MM

        const pFiltered = (allP.data || []).filter(r => r.tanggal.startsWith(s));
        const kFiltered = (allK.data || []).filter(r => r.tanggal.startsWith(s));

        chartData.push({
            bulan: MONTHS_SHORT[m - 1],
            pendapatan: pFiltered.reduce((sum, r) => sum + r.jumlah, 0),
            pengeluaran: kFiltered.reduce((sum, r) => sum + r.jumlah, 0),
        });
    }
    return {
        totalPendapatan,
        totalPengeluaran,
        profit: totalPendapatan - totalPengeluaran,
        recentTransaksi: transaksi.data || [],
        penggajianPending: penggajianPending.data?.length || 0,
        chartData,
    };
}

// ========== MITRA (B2B) ==========
export async function getMitra() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("mitra")
        .select("*")
        .order("nama", { ascending: true });
    if (error) throw error;
    return data;
}

export async function upsertMitra(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;
    const payload = {
        nama: formData.get("nama") as string,
        kategori: formData.get("kategori") as string,
        kontak_wa: (formData.get("kontak_wa") as string) || null,
        alamat: (formData.get("alamat") as string) || null,
    };

    if (id) {
        const { error } = await supabase.from("mitra").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("mitra").insert(payload);
        if (error) return { error: error.message };
    }
    revalidatePath("/dashboard/mitra");
    return { success: true };
}

export async function deleteMitra(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("mitra").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/mitra");
    return { success: true };
}

// ========== TRANSAKSI B2B ==========
export async function getTransaksiB2B(mitraId?: string, limit = 100) {
    const supabase = await createClient();
    let query = supabase
        .from("transaksi_b2b")
        .select("*, mitra(*)")
        .order("tanggal", { ascending: false });

    if (mitraId) {
        query = query.eq("mitra_id", mitraId);
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    return data;
}

export async function getTransaksiB2BById(idOrNomor: string) {
    const supabase = await createClient();
    let query = supabase.from("transaksi_b2b").select("*, mitra(*), transaksi_b2b_detail(*)");

    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNomor);
    if (isId) {
        query = query.eq("id", idOrNomor);
    } else {
        query = query.eq("nomor_transaksi", idOrNomor);
    }

    const { data, error } = await query.single();
    if (error) return null;
    return data;
}

export async function createTransaksiB2B(
    mitra_id: string,
    items: { produk_id: string; nama_produk: string; harga: number; jumlah: number; subtotal: number }[],
    diskon: number,
    ongkir: number,
    jumlah_dibayar: number,
    status_pengiriman: string,
    jatuh_tempo: string | null,
    metode_pembayaran: string,
    catatan?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const total_tagihan = total + ongkir - diskon;
    const sisa_tagihan = total_tagihan - jumlah_dibayar;

    let status_pembayaran = "Belum Bayar";
    if (jumlah_dibayar >= total_tagihan) {
        status_pembayaran = "Lunas";
    } else if (jumlah_dibayar > 0) {
        status_pembayaran = "DP/Parsial";
    }

    const nomor = `INV-${Date.now()}`;

    const { data: trx, error: trxError } = await supabase
        .from("transaksi_b2b")
        .insert({
            nomor_transaksi: nomor,
            mitra_id,
            total,
            diskon,
            ongkir,
            total_tagihan,
            jumlah_dibayar,
            sisa_tagihan,
            status_pembayaran,
            status_pengiriman,
            jatuh_tempo,
            metode_pembayaran,
            catatan: catatan || null,
            nominal_retur: 0,
            user_id: user.id,
        })
        .select()
        .single();

    if (trxError) return { error: trxError.message };

    const details = items.map((item) => ({
        transaksi_b2b_id: trx.id,
        ...item,
    }));

    const { error: detailError } = await supabase.from("transaksi_b2b_detail").insert(details);
    if (detailError) return { error: detailError.message };

    // Update stok
    for (const item of items) {
        await supabase.rpc("decrement_stok", { p_id: item.produk_id, p_jumlah: item.jumlah });
    }

    // Only record pendapatan for the amount actually paid right now
    if (jumlah_dibayar > 0) {
        await supabase.from("pendapatan").insert({
            tanggal: new Date().toISOString().split("T")[0],
            deskripsi: `DP/Payment Invoice ${nomor}`,
            jumlah: jumlah_dibayar,
            metode_pembayaran,
            catatan: `Pembayaran B2B Mitra ID: ${mitra_id}`,
            user_id: user.id,
        });
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard/pos-b2b");
    revalidatePath("/dashboard/pendapatan");
    revalidatePath("/dashboard");
    return { success: true, nomor };
}

export async function updateTransaksiB2B(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const jumlah_dibayar = Number(formData.get("jumlah_dibayar") || 0);
    const nominal_retur = Number(formData.get("nominal_retur") || 0);
    const total_tagihan = Number(formData.get("total_tagihan") || 0);
    const catatan = formData.get("catatan") as string;

    const sisa_tagihan = total_tagihan - jumlah_dibayar - nominal_retur;
    let status_pembayaran = "Belum Bayar";
    if (sisa_tagihan <= 0) {
        status_pembayaran = "Lunas";
    } else if (jumlah_dibayar > 0) {
        status_pembayaran = "DP/Parsial";
    }

    const { error } = await supabase
        .from("transaksi_b2b")
        .update({
            jumlah_dibayar,
            nominal_retur,
            sisa_tagihan,
            status_pembayaran,
            catatan,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard/pos-b2b");
    revalidatePath("/dashboard/mitra");
    return { success: true };
}


// ========== AUTH / USER MANAGEMENT (ADMIN ONLY) ==========

export async function getAuthUsers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Pastikan cuma Master yang bisa akses
    if (user?.user_metadata?.role !== "Master") {
        return { error: "Akses Ditolak. Harus Master." };
    }

    // Panggil Service Role / Admin Client
    const adminAuthClient = await createAdminClient();
    const { data: users, error } = await adminAuthClient.auth.admin.listUsers();

    if (error) return { error: error.message };

    const mapped = users.users.map(u => ({
        id: u.id,
        email: u.email || "",
        role: u.user_metadata?.role || "Karyawan",
        last_sign_in_at: u.last_sign_in_at || null,
        created_at: u.created_at
    }));

    return { data: mapped };
}

export async function createAuthUser(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.user_metadata?.role !== "Master") {
        return { error: "Akses Ditolak." };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const adminAuthClient = await createAdminClient();

    // Auto confirm dan sign up lewat backend
    const { error } = await adminAuthClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: role }
    });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/akun");
    return { success: true };
}

export async function resetUserPassword(userId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.user_metadata?.role !== "Master") {
        return { error: "Akses Ditolak." };
    }

    const newPassword = formData.get("password") as string;
    const adminAuthClient = await createAdminClient();

    const { error } = await adminAuthClient.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    );

    if (error) return { error: error.message };

    return { success: true };
}

export async function deleteAuthUser(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.user_metadata?.role !== "Master") {
        return { error: "Akses Ditolak." };
    }

    // Cegah hapus diri sendiri dari dashboard ini (Miskilik bahaya)
    if (user?.id === userId) {
        return { error: "Tidak dapat menghapus akun Anda sendiri!" };
    }

    const adminAuthClient = await createAdminClient();
    const { error } = await adminAuthClient.auth.admin.deleteUser(userId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/akun");
    return { success: true };
}
