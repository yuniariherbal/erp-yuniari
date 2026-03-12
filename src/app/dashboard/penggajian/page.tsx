import { getPenggajian, getKaryawan } from "@/actions/data";
import { PenggajianClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PenggajianPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }
    const [data, karyawan] = await Promise.all([
        getPenggajian(),
        getKaryawan(),
    ]);

    return <PenggajianClient data={data || []} karyawanList={karyawan || []} />;
}
