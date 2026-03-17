"use client";

import { useState } from "react";
import { upsertMitra, deleteMitra } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import type { Mitra } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function MitraClient({ data }: { data: Mitra[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Mitra | null>(null);

    async function handleSubmit(formData: FormData) {
        if (editing) formData.set("id", editing.id);
        const result = await upsertMitra(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(editing ? "Mitra diupdate" : "Mitra ditambahkan");
            setOpen(false);
            setEditing(null);
            router.refresh();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus mitra ini? Transaksi B2B terkait mungkin akan terpengaruh.")) return;
        const result = await deleteMitra(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Mitra dihapus");
            router.refresh();
        }
    }

    function handleExport() {
        const exportData = data.map((d) => ({
            Nama: d.nama,
            Kategori: d.kategori || "-",
            "Kontak WA": d.kontak_wa || "-",
            Alamat: d.alamat || "-",
        }));
        exportToExcel(exportData, `mitra_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mitra / Agen</h1>
                    <p className="text-muted-foreground">Master data reseller, agen, dan maklon</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-initial">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="flex-1 sm:flex-initial"><Plus className="mr-2 h-4 w-4" /> Mitra Baru</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Tambah"} Mitra</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Lengkap</Label>
                                    <Input name="nama" defaultValue={editing?.nama} placeholder="Nama mitra/toko" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select name="kategori" defaultValue={editing?.kategori || "Reseller"}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Reseller">Reseller</SelectItem>
                                                <SelectItem value="Agen">Agen</SelectItem>
                                                <SelectItem value="Maklon">Maklon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kontak WA</Label>
                                        <Input name="kontak_wa" defaultValue={editing?.kontak_wa || ""} placeholder="Contoh: 0812..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Alamat Pengiriman</Label>
                                    <Input name="alamat" defaultValue={editing?.alamat || ""} placeholder="Alamat lengkap" />
                                </div>
                                <Button type="submit" className="w-full">{editing ? "Update" : "Simpan"}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[120px]">Nama Mitra</TableHead>
                                    <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                                    <TableHead>Kontak/Alamat</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Belum ada data mitra
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Link href={`/dashboard/tagihan?mitraId=${d.id}`} className="font-bold hover:underline decoration-zinc-400 underline-offset-4">
                                                        {d.nama}
                                                    </Link>
                                                    <div className="flex items-center gap-2 sm:hidden">
                                                        <Badge variant={
                                                            d.kategori === "Maklon" ? "destructive" :
                                                                d.kategori === "Agen" ? "default" : "secondary"
                                                        } className="text-[10px] py-0 h-4">
                                                            {d.kategori}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                                                            ID: {d.id.slice(0, 5)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant={
                                                    d.kategori === "Maklon" ? "destructive" :
                                                        d.kategori === "Agen" ? "default" : "secondary"
                                                }>
                                                    {d.kategori}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm font-medium">{d.kontak_wa || "-"}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{d.alamat || "-"}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Lihat Tagihan">
                                                        <Link href={`/dashboard/tagihan?mitraId=${d.id}`}>
                                                            <FileText className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
