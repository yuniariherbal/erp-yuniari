"use client";

import { useState } from "react";
import { upsertProduk, deleteProduk } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import { formatRupiah } from "@/lib/format";
import type { Produk } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Pencil, Package } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProdukClient({ data }: { data: Produk[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Produk | null>(null);

    async function handleSubmit(formData: FormData) {
        if (editing) formData.set("id", editing.id);
        const result = await upsertProduk(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(editing ? "Produk diupdate" : "Produk ditambahkan");
            setOpen(false);
            setEditing(null);
            router.refresh();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus produk ini? (Hanya akan menonaktifkan agar tidak merusak history transaksi)")) return;
        const result = await deleteProduk(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Produk dinonaktifkan");
            router.refresh();
        }
    }

    function handleExport() {
        const exportData = data.map((d) => ({
            Nama: d.nama,
            Deskripsi: d.deskripsi || "-",
            Harga: d.harga,
            Stok: d.stok,
            Satuan: d.satuan,
            Status: d.stok > 0 ? "Tersedia" : "Habis",
        }));
        exportToExcel(exportData, `produk_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Katalog Produk</h1>
                    <p className="text-muted-foreground">Kelola barang/jasa untuk Point of Sale</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Tambah Produk</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Tambah"} Produk / Layanan</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Barang/Jasa</Label>
                                    <Input name="nama" defaultValue={editing?.nama} placeholder="Contoh: Kopi Susu, atau Jasa Service" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Harga Jual (Rp)</Label>
                                        <Input type="number" name="harga" defaultValue={editing?.harga} placeholder="0" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Satuan</Label>
                                        <Input name="satuan" defaultValue={editing?.satuan || "pcs"} placeholder="pcs, porsi, jam" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Stok Awal</Label>
                                    <Input type="number" name="stok" defaultValue={editing?.stok || 0} placeholder="Bisa diset 0 jika berupa Jasa" />
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
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Barang/Jasa</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                                <TableHead className="text-center">Stok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p>Katalog masih kosong</p>
                                            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" /> Tambah Produk Pertama
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell>
                                            <p className="font-medium">{d.nama}</p>
                                            {d.deskripsi && <p className="text-xs text-muted-foreground line-clamp-1">{d.deskripsi}</p>}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-emerald-600">
                                            {formatRupiah(d.harga)}<span className="text-xs text-muted-foreground font-normal">/{d.satuan}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-medium ${d.stok <= 5 && d.stok > 0 ? "text-amber-500" : d.stok <= 0 ? "text-red-500" : ""}`}>
                                                {d.stok}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {d.stok > 0 ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Tersedia</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-red-50 text-red-700">Habis</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-end">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setOpen(true); }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
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
