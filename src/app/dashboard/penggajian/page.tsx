import { getPenggajian, getKaryawan } from "@/actions/data";
import { PenggajianClient } from "./client";

export default async function PenggajianPage() {
    const [data, karyawan] = await Promise.all([
        getPenggajian(),
        getKaryawan(),
    ]);

    return <PenggajianClient data={data || []} karyawanList={karyawan || []} />;
}
