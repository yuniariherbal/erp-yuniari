import { getKaryawan } from "@/actions/data";
import { KaryawanClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function KaryawanPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }

    const data = await getKaryawan();
    return <KaryawanClient data={data || []} />;
}
