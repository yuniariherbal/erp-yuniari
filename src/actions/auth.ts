"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard");
}

import { headers } from "next/headers";

export async function register(formData: FormData) {
    const supabase = await createClient();

    // Get the current host dynamically for the callback URL
    const headerList = await headers();
    const host = headerList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/dashboard`;

    const { error } = await supabase.auth.signUp({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        options: {
            emailRedirectTo: callbackUrl,
            data: {
                role: formData.get("role") as string || "Karyawan"
            }
        }
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
