"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ========== KATEGORI ==========
export async function getKategori(tipe?: "pendapatan" | "pengeluaran") {
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
export async function getProduk() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("is_active", true)
        .order("nama");
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
        is_active: true,
    };

    if (id) {
        const { error } = await supabase.from("produk").update(payload).eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase.from("produk").insert(payload);
        if (error) return { error: error.message };
    }
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
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(tahunIni, bulanIni - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const s = `${y}-${String(m).padStart(2, "0")}-01`;
        const em = m === 12 ? 1 : m + 1;
        const ey = m === 12 ? y + 1 : y;
        const e = `${ey}-${String(em).padStart(2, "0")}-01`;

        const [p, k] = await Promise.all([
            supabase.from("pendapatan").select("jumlah").gte("tanggal", s).lt("tanggal", e),
            supabase.from("pengeluaran").select("jumlah").gte("tanggal", s).lt("tanggal", e),
        ]);

        const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        chartData.push({
            bulan: MONTHS_SHORT[m - 1],
            pendapatan: (p.data || []).reduce((sum, r) => sum + r.jumlah, 0),
            pengeluaran: (k.data || []).reduce((sum, r) => sum + r.jumlah, 0),
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
