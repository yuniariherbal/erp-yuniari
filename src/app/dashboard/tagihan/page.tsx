import { getTransaksiB2B, getMitra } from "@/actions/data";
import { TagihanClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TagihanPage({
    searchParams,
}: {
    searchParams: Promise<{ mitraId?: string }>;
}) {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user.user?.user_metadata?.role === "Karyawan") {
        redirect("/dashboard/pos");
    }

    const { mitraId } = await searchParams;
    const data = await getTransaksiB2B(mitraId);
    const mitraList = await getMitra();

    return <TagihanClient data={data || []} mitraList={mitraList || []} initialMitraId={mitraId} />;
}
