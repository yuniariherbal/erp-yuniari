"use client";

import { useState } from "react";
import { upsertKaryawan, deleteKaryawan } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import { formatRupiah } from "@/lib/format";
import type { Karyawan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function KaryawanClient({ data }: { data: Karyawan[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Karyawan | null>(null);

    async function handleSubmit(formData: FormData) {
        if (editing) formData.set("id", editing.id);
        const result = await upsertKaryawan(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(editing ? "Karyawan diupdate" : "Karyawan ditambahkan");
            setOpen(false);
            setEditing(null);
            router.refresh();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus karyawan ini? Data penggajiannya juga akan terhapus.")) return;
        const result = await deleteKaryawan(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Karyawan dihapus");
            router.refresh();
        }
    }

    function handleExport() {
        const exportData = data.map((d) => ({
            Nama: d.nama,
            Email: d.email || "-",
            Telepon: d.telepon || "-",
            Posisi: d.posisi || "-",
            "Gaji Pokok": d.gaji_pokok,
            "Tgl Bergabung": new Date(d.tanggal_bergabung).toLocaleDateString("id-ID"),
            Status: d.status,
        }));
        exportToExcel(exportData, `karyawan_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Karyawan</h1>
                    <p className="text-muted-foreground">Master data karyawan perusahaan</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Karyawan Baru</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit" : "Tambah"} Karyawan</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Lengkap</Label>
                                    <Input name="nama" defaultValue={editing?.nama} placeholder="Nama lengkap karyawan" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" name="email" defaultValue={editing?.email || ""} placeholder="Email" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telepon</Label>
                                        <Input name="telepon" defaultValue={editing?.telepon || ""} placeholder="Nomor telepon/WA" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Posisi</Label>
                                        <Input name="posisi" defaultValue={editing?.posisi || ""} placeholder="Jabatan" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select name="status" defaultValue={editing?.status || "aktif"}>
                                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Gaji Pokok (Rp)</Label>
                                        <Input type="number" name="gaji_pokok" defaultValue={editing?.gaji_pokok} placeholder="0" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tgl Bergabung</Label>
                                        <Input type="date" name="tanggal_bergabung" defaultValue={editing?.tanggal_bergabung || new Date().toISOString().slice(0, 10)} required />
                                    </div>
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
                                <TableHead>Nama</TableHead>
                                <TableHead>Posisi</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead className="text-right">Gaji Pokok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Belum ada data karyawan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.nama}</TableCell>
                                        <TableCell>{d.posisi || "-"}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {d.telepon}<br />
                                            <span className="text-xs">{d.email}</span>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">{formatRupiah(d.gaji_pokok)}</TableCell>
                                        <TableCell>
                                            <Badge variant={d.status === "aktif" ? "default" : "secondary"}>
                                                {d.status}
                                            </Badge>
                                        </TableCell>
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
