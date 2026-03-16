import { getProduk, getKategori } from "@/actions/data";
import { ProdukClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProdukPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }

    const [data, kategoriList] = await Promise.all([
        getProduk(),
        getKategori("produk"),
    ]);

    return <ProdukClient data={data || []} kategoriList={kategoriList || []} />;
}
