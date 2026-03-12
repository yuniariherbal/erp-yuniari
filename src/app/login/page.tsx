"use client";

import { useState } from "react";
import Image from "next/image";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");

    async function handleSubmit(formData: FormData) {
        const emailStr = formData.get("email") as string;
        if (emailStr) setUsername(emailStr.split('@')[0]);
        setLoading(true);
        setError("");
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    if (loading && !error) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-6" />
                <h2 className="text-3xl font-bold animate-pulse text-zinc-900 dark:text-zinc-50">
                    Selamat Datang, {username}!
                </h2>
                <p className="text-muted-foreground mt-2 font-medium">Memuat sistem ERP...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-50 overflow-hidden">
                        <Image src="/favicon.png" alt="Herbal Yuniari Logo" width={100} height={100} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">ERP Yuniari</h1>
                        <p className="text-sm text-muted-foreground">Mini ERP System</p>
                    </div>
                </div>

                <Card className="shadow-xl border-0 shadow-zinc-200/50 dark:shadow-zinc-900/50">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">Masuk</CardTitle>
                        <CardDescription>Masukkan email dan password Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email / Username</Label>
                                <Input id="email" name="email" type="text" placeholder="nama@email.com atau username" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" placeholder="••••••••" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Masuk
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
