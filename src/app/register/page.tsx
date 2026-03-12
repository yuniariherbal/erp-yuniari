"use client";

import { useState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Loader2, BarChart3 } from "lucide-react";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");
        const result = await register(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-50">
                        <BarChart3 className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">ERP Yuniari</h1>
                        <p className="text-sm text-muted-foreground">Mini ERP System</p>
                    </div>
                </div>

                <Card className="shadow-xl border-0 shadow-zinc-200/50 dark:shadow-zinc-900/50">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">Daftar Akun</CardTitle>
                        <CardDescription>Buat akun baru untuk mengakses ERP</CardDescription>
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
                                <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Daftar Sebagai</Label>
                                <Select name="role" defaultValue="Karyawan">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Karyawan">Karyawan</SelectItem>
                                        <SelectItem value="Chief">Chief (Manajer)</SelectItem>
                                        <SelectItem value="Master">Master (Owner)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Daftar
                            </Button>
                        </form>
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                                Masuk
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
