"use client";

import { useState } from "react";
import { upsertPengeluaran, deletePengeluaran } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import { formatRupiah, formatDateShort, METODE_PEMBAYARAN } from "@/lib/format";
import type { Pengeluaran, Kategori } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Pencil, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PengeluaranClient({
    data,
    kategoriList,
    totalBulanIni,
}: {
    data: Pengeluaran[];
    kategoriList: Kategori[];
    totalBulanIni: number;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Pengeluaran | null>(null);

    async function handleSubmit(formData: FormData) {
        if (editing) formData.set("id", editing.id);
        const result = await upsertPengeluaran(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(editing ? "Pengeluaran diupdate" : "Pengeluaran ditambahkan");
            setOpen(false);
            setEditing(null);
            router.refresh();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus pengeluaran ini?")) return;
        const result = await deletePengeluaran(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Pengeluaran dihapus");
            router.refresh();
        }
    }

    function handleExport() {
        const exportData = data.map((d) => ({
            Tanggal: formatDateShort(d.tanggal),
            Deskripsi: d.deskripsi,
            Kategori: d.kategori?.nama || "-",
            Jumlah: d.jumlah,
            "Metode Pembayaran": d.metode_pembayaran || "-",
            Catatan: d.catatan || "-",
        }));
        exportToExcel(exportData, `pengeluaran_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pengeluaran</h1>
                    <p className="text-muted-foreground">Kelola semua pengeluaran operasional</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-initial">
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="flex-1 sm:flex-initial"><Plus className="mr-2 h-4 w-4" /> Tambah</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Tambah"} Pengeluaran</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tanggal</Label>
                                        <Input type="date" name="tanggal" defaultValue={editing?.tanggal || new Date().toISOString().slice(0, 10)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jumlah (Rp)</Label>
                                        <Input type="number" name="jumlah" defaultValue={editing?.jumlah} placeholder="0" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Deskripsi</Label>
                                    <Input name="deskripsi" defaultValue={editing?.deskripsi} placeholder="Deskripsi pengeluaran" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select name="kategori_id" defaultValue={editing?.kategori_id || ""}>
                                            <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                            <SelectContent>
                                                {kategoriList.map((k) => (
                                                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Metode Pembayaran</Label>
                                        <Select name="metode_pembayaran" defaultValue={editing?.metode_pembayaran || ""}>
                                            <SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                                            <SelectContent>
                                                {METODE_PEMBAYARAN.map((m) => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Catatan</Label>
                                    <Textarea name="catatan" defaultValue={editing?.catatan || ""} placeholder="Catatan tambahan (opsional)" />
                                </div>
                                <Button type="submit" className="w-full" variant="destructive">{editing ? "Update" : "Simpan"} Pengeluaran</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-950/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Total Bulan Ini</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{formatRupiah(totalBulanIni)}</p>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Belum ada data pengeluaran
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="text-sm">{formatDateShort(d.tanggal)}</TableCell>
                                        <TableCell className="text-sm font-medium">{d.deskripsi}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-xs">{d.kategori?.nama || "-"}</Badge></TableCell>
                                        <TableCell className="text-sm">{d.metode_pembayaran || "-"}</TableCell>
                                        <TableCell className="text-right text-sm font-semibold text-red-600">-{formatRupiah(d.jumlah)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
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
