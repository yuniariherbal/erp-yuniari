import { getPendapatan, getPengeluaran, getKategori } from "@/actions/data";
import { LaporanClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LaporanPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }
    const [pendapatan, pengeluaran, kategori] = await Promise.all([
        // get all so that client side filtering by month/year is instant
        getPendapatan(),
        getPengeluaran(),
        getKategori(),
    ]);

    return (
        <LaporanClient
            pendapatan={pendapatan || []}
            pengeluaran={pengeluaran || []}
            kategori={kategori || []}
        />
    );
}
