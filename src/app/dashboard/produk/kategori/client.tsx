"use client";

import { useState } from "react";
import { upsertKategori } from "@/actions/data";
import type { Kategori } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil, ListFilter, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function KategoriProdukClient({ data }: { data: Kategori[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Kategori | null>(null);

    async function handleSubmit(formData: FormData) {
        formData.append("tipe", "produk");
        if (editing) formData.set("id", editing.id);

        const result = await upsertKategori(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(editing ? "Kategori diupdate" : "Kategori ditambahkan");
            setOpen(false);
            setEditing(null);
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/produk">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kategori Produk</h1>
                    <p className="text-muted-foreground">Kelola pengelompokan produk/jasa</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Tambah Kategori</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? "Edit" : "Tambah"} Kategori Produk</DialogTitle>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Kategori</Label>
                                <Input name="nama" defaultValue={editing?.nama} placeholder="Contoh: Makanan, Minuman, Jasa" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <Textarea name="deskripsi" defaultValue={editing?.deskripsi || ""} placeholder="Opsional" />
                            </div>
                            <Button type="submit" className="w-full">{editing ? "Update" : "Simpan"}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                                <ListFilter className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p>Belum ada kategori produk</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.nama}</TableCell>
                                        <TableCell className="text-muted-foreground">{d.deskripsi || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-end">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setOpen(true); }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
