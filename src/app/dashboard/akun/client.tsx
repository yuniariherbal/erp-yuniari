"use client";

import { useState } from "react";
import { createAuthUser, resetUserPassword, deleteAuthUser } from "@/actions/data";
import { UserAuth } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ManageAkunClient({ usersList, currentUserId }: { usersList: UserAuth[], currentUserId: string }) {
    const router = useRouter();

    const [isTambahOpen, setIsTambahOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleTambah(formData: FormData) {
        setIsSubmitting(true);
        const result = await createAuthUser(formData);
        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Akun baru berhasil dibuat!");
            setIsTambahOpen(false);
            router.refresh();
        }
    }

    async function handleReset(formData: FormData) {
        setIsSubmitting(true);
        const result = await resetUserPassword(selectedUserId, formData);
        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Password berhasil direset!");
            setIsResetOpen(false);
        }
    }

    async function handleDelete(id: string) {
        if (id === currentUserId) {
            toast.error("Tidak bisa menghapus akun Anda sendiri!");
            return;
        }

        if (confirm("Yakin ingin menghapus akses akun ini secara permanen? Akun yang dihapus tidak dapat dipulihkan.")) {
            setIsSubmitting(true);
            const result = await deleteAuthUser(id);
            setIsSubmitting(false);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Akun berhasil dihapus.");
                router.refresh();
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-red-500" /> Manajemen Akses (Admin)
                    </h1>
                    <p className="text-muted-foreground mt-1">Kontrol akses masuk (*login*) seluruh pengguna sistem ERP.</p>
                </div>
                <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Akun Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buat Kredensial Akses Baru</DialogTitle>
                        </DialogHeader>
                        <form action={handleTambah} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email (Bisa Dummy Email)</Label>
                                <Input name="email" type="email" placeholder="Contoh: kasir3@yuniari.local" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Password Sementara</Label>
                                <Input name="password" type="password" placeholder="Minimal 6 Karakter" required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role Jabatan</Label>
                                <Select name="role" defaultValue="Karyawan">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Karyawan">Karyawan (Akses Terbatas)</SelectItem>
                                        <SelectItem value="Chief">Chief (Manajer Cabang)</SelectItem>
                                        <SelectItem value="Master">Master (Akses Penuh)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Memproses..." : "Buat Akun"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                        <TableRow>
                            <TableHead>Email Login</TableHead>
                            <TableHead>Wewenang / Role</TableHead>
                            <TableHead>Terakhir Aktif</TableHead>
                            <TableHead className="text-right">Aksi Password & Limit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    Tidak ada data pengguna ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usersList.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">
                                        {u.email}
                                        {u.id === currentUserId && (
                                            <Badge variant="outline" className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Anda Saat Ini</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === "Master" ? "default" : u.role === "Chief" ? "secondary" : "outline"}
                                            className={u.role === "Master" ? "bg-red-500 hover:bg-red-600" : ""}
                                        >
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {u.last_sign_in_at
                                            ? new Date(u.last_sign_in_at).toLocaleDateString("id-ID", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : "Belum Pernah Login"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5"
                                                onClick={() => {
                                                    setSelectedUserId(u.id);
                                                    setIsResetOpen(true);
                                                }}
                                            >
                                                <KeyRound className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">Reset Pass</span>
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={u.id === currentUserId || isSubmitting}
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Reset Password */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Kata Sandi</DialogTitle>
                    </DialogHeader>
                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-3 rounded-md text-xs mb-4 border border-amber-200 dark:border-amber-900 border-dashed">
                        Tindakan ini akan menimpa password pengguna secara paksa tanpa verifikasi email lama. Peringatkan pengguna untuk mengingat password baru yang Anda buat ini.
                    </div>
                    <form action={handleReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ketik Password Baru</Label>
                            <Input name="password" type="text" placeholder="Masukkan password kuat" required minLength={6} />
                        </div>
                        <Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Mengganti..." : "Ganti Kata Sandi SEKARANG!"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
