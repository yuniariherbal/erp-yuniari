import { getAuthUsers } from "@/actions/data";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ManageAkunClient } from "./client";

export default async function AkunPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Pastikan cuma Master yang bisa akses rute ini
    if (user?.user_metadata?.role !== "Master") {
        redirect("/dashboard");
    }

    const response = await getAuthUsers();

    // Fallback jika API error saat get auth
    const usersList = response.data || [];

    return <ManageAkunClient usersList={usersList} currentUserId={user.id} />;
}
