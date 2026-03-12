import { getProduk, getMitra } from "@/actions/data";
import { PosB2BClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PosB2BPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }

    const [produk, mitra] = await Promise.all([
        getProduk(),
        getMitra(),
    ]);

    return <PosB2BClient produkList={produk || []} mitraList={mitra || []} />;
}
