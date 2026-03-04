import { getPendapatan, getKategori } from "@/actions/data";
import { PendapatanClient } from "./client";

export default async function PendapatanPage() {
    const now = new Date();
    const [data, kategori] = await Promise.all([
        getPendapatan(),
        getKategori("pendapatan"),
    ]);

    const bulanIni = now.getMonth() + 1;
    const tahunIni = now.getFullYear();
    const totalBulanIni = (data || [])
        .filter((d) => {
            const dt = new Date(d.tanggal);
            return dt.getMonth() + 1 === bulanIni && dt.getFullYear() === tahunIni;
        })
        .reduce((sum, d) => sum + d.jumlah, 0);

    return <PendapatanClient data={data || []} kategoriList={kategori || []} totalBulanIni={totalBulanIni} />;
}
