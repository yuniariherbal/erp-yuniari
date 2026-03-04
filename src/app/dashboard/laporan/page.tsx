import { getPendapatan, getPengeluaran, getKategori } from "@/actions/data";
import { LaporanClient } from "./client";

export default async function LaporanPage() {
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
