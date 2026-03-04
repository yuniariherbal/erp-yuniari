import { getKaryawan } from "@/actions/data";
import { KaryawanClient } from "./client";

export default async function KaryawanPage() {
    const data = await getKaryawan();
    return <KaryawanClient data={data || []} />;
}
