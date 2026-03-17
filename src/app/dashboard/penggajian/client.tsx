"use client";

import { useState } from "react";
import { upsertPenggajian, deletePenggajian, bayarGaji } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import { formatRupiah, MONTHS } from "@/lib/format";
import type { Penggajian, Karyawan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PenggajianClient({ data, karyawanList }: { data: Penggajian[]; karyawanList: Karyawan[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Penggajian | null>(null);
    const [selectedKaryawan, setSelectedKaryawan] = useState<string>("");

    const aktifKaryawan = karyawanList.filter((k) => k.status === "aktif");
    const currentYear = new Date().getFullYear();

    async function handleSubmit(formData: FormData) {
        if (editing) formData.set("id", editing.id);
        const result = await upsertPenggajian(formData);
        if (result.error) {
            if (result.error.includes("unique")) {
                toast.error("Gaji bulan ini untuk karyawan tersebut sudah ada");
            } else {
                toast.error(result.error);
            }
        } else {
            toast.success(editing ? "Slip gaji diupdate" : "Slip gaji dibuat");
            setOpen(false);
            setEditing(null);
            setSelectedKaryawan("");
            router.refresh();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus catatan gaji ini?")) return;
        const result = await deletePenggajian(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Catatan dihapus");
            router.refresh();
        }
    }

    async function handleBayar(id: string) {
        if (!confirm("Tandai telah dibayar? Ini akan otomatis mencatat pengeluaran.")) return;
        const result = await bayarGaji(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Gaji ditandai sudah dibayar");
            router.refresh();
        }
    }

    function handleExport() {
        const exportData = data.map((d) => ({
            Periode: `${MONTHS[d.periode_bulan - 1]} ${d.periode_tahun}`,
            Karyawan: d.karyawan?.nama || "-",
            "Gaji Pokok": d.gaji_pokok,
            Tunjangan: d.tunjangan,
            Bonus: d.bonus,
            Potongan: d.potongan,
            "Total Bersih": d.total_gaji,
            Status: d.status,
            "Tgl Bayar": d.tanggal_bayar ? new Date(d.tanggal_bayar).toLocaleDateString("id-ID") : "-",
        }));
        exportToExcel(exportData, `penggajian_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    // Pre-fill gaji pokok based on selected karyawan
    const autoGajiPokok = karyawanList.find((k) => k.id === selectedKaryawan)?.gaji_pokok || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Penggajian</h1>
                    <p className="text-muted-foreground">Kelola slip gaji bulanan karyawan</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-initial">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setSelectedKaryawan(""); } }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="flex-1 sm:flex-initial"><Plus className="mr-2 h-4 w-4" /> Slip Gaji Baru</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Buat"} Slip Gaji</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Karyawan</Label>
                                    <Select
                                        name="karyawan_id"
                                        defaultValue={editing?.karyawan_id || ""}
                                        onValueChange={setSelectedKaryawan}
                                        required
                                    >
                                        <SelectTrigger><SelectValue placeholder="Pilih Karyawan" /></SelectTrigger>
                                        <SelectContent>
                                            {aktifKaryawan.map((k) => (
                                                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bulan</Label>
                                        <Select name="periode_bulan" defaultValue={editing ? String(editing.periode_bulan) : String(new Date().getMonth() + 1)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {MONTHS.map((m, i) => (
                                                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tahun</Label>
                                        <Input type="number" name="periode_tahun" defaultValue={editing?.periode_tahun || currentYear} required />
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-muted/50 p-3 space-y-4 mt-2">
                                    <div className="space-y-2">
                                        <Label>Gaji Pokok (Rp)</Label>
                                        <Input
                                            type="number"
                                            name="gaji_pokok"
                                            defaultValue={editing?.gaji_pokok || (selectedKaryawan ? autoGajiPokok : "")}
                                            className="bg-white dark:bg-zinc-900"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tunjangan</Label>
                                            <Input type="number" name="tunjangan" defaultValue={editing?.tunjangan || "0"} className="bg-white dark:bg-zinc-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bonus</Label>
                                            <Input type="number" name="bonus" defaultValue={editing?.bonus || "0"} className="bg-white dark:bg-zinc-900" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Potongan / Kasbon</Label>
                                        <Input type="number" name="potongan" defaultValue={editing?.potongan || "0"} className="bg-white dark:bg-zinc-900" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Catatan</Label>
                                    <Textarea name="catatan" defaultValue={editing?.catatan || ""} placeholder="Catatan opsional" />
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
                                <TableHead>Periode</TableHead>
                                <TableHead>Karyawan</TableHead>
                                <TableHead className="text-right">Gaji Pokok</TableHead>
                                <TableHead className="text-right">+ Tunjangan/Bonus</TableHead>
                                <TableHead className="text-right text-red-500">- Potongan</TableHead>
                                <TableHead className="text-right font-bold">Total Bersih</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Belum ada data penggajian
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium text-sm">
                                            {MONTHS[d.periode_bulan - 1]} {d.periode_tahun}
                                        </TableCell>
                                        <TableCell>{d.karyawan?.nama}</TableCell>
                                        <TableCell className="text-right text-sm">{formatRupiah(d.gaji_pokok)}</TableCell>
                                        <TableCell className="text-right text-sm text-emerald-600">
                                            +{formatRupiah(d.tunjangan + d.bonus)}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-red-500">
                                            -{formatRupiah(d.potongan)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-sm">
                                            {formatRupiah(d.total_gaji)}
                                        </TableCell>
                                        <TableCell>
                                            {d.status === "dibayar" ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                                                    Dibayar
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-end">
                                                {d.status === "pending" && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleBayar(d.id)} title="Bayar">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
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
