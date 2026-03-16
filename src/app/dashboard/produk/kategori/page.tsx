import { getKategori } from "@/actions/data";
import { KategoriProdukClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function KategoriProdukPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }

    const data = await getKategori("produk");
    return <KategoriProdukClient data={data || []} />;
}
