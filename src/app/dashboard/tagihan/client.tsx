"use client";

import { useState } from "react";
import { updateTransaksiB2B } from "@/actions/data";
import { exportToExcel } from "@/lib/export";
import type { TransaksiB2B, Mitra } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Pencil, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatRupiah, formatDate } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TagihanClient({
    data,
    mitraList,
    initialMitraId
}: {
    data: TransaksiB2B[],
    mitraList: Mitra[],
    initialMitraId?: string
}) {
    const router = useRouter();
    const [editing, setEditing] = useState<TransaksiB2B | null>(null);
    const [search, setSearch] = useState("");
    const [selectedMitraId, setSelectedMitraId] = useState(initialMitraId || "all");

    async function handleUpdate(formData: FormData) {
        const result = await updateTransaksiB2B(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Tagihan diupdate");
            setEditing(null);
            router.refresh();
        }
    }

    const filteredData = data.filter(d => {
        const matchSearch = d.nomor_transaksi.toLowerCase().includes(search.toLowerCase()) ||
            d.mitra?.nama.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    function handleMitraChange(value: string) {
        setSelectedMitraId(value);
        if (value === "all") {
            router.push("/dashboard/tagihan");
        } else {
            router.push(`/dashboard/tagihan?mitraId=${value}`);
        }
    }

    function handleExport() {
        const exportData = filteredData.map((d) => ({
            Tanggal: formatDate(d.tanggal),
            "No. Transaksi": d.nomor_transaksi,
            Mitra: d.mitra?.nama || "-",
            Total: d.total_tagihan,
            Dibayar: d.jumlah_dibayar,
            Retur: d.nominal_retur || 0,
            Sisa: d.sisa_tagihan,
            Status: d.status_pembayaran
        }));
        exportToExcel(exportData, `tagihan_${new Date().toISOString().slice(0, 10)}`);
        toast.success("File Excel berhasil diunduh");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Tagihan</h1>
                    <p className="text-muted-foreground">Kelola tagihan B2B, status pembayaran dan retur</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                    <Label className="text-xs mb-1 block">Filter Mitra</Label>
                    <Select value={selectedMitraId} onValueChange={handleMitraChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Mitra" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mitra</SelectItem>
                            {mitraList.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Label className="text-xs mb-1 block">Cari Transaksi</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nomor transaksi atau nama mitra..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8"
                                onClick={() => setSearch("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>No. Transaksi</TableHead>
                                    <TableHead>Mitra</TableHead>
                                    <TableHead>Total Tagihan</TableHead>
                                    <TableHead>Dibayar</TableHead>
                                    <TableHead>Retur</TableHead>
                                    <TableHead>Sisa</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data tagihan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell className="text-sm whitespace-nowrap">{formatDate(d.tanggal)}</TableCell>
                                            <TableCell className="font-medium">{d.nomor_transaksi}</TableCell>
                                            <TableCell>{d.mitra?.nama || "-"}</TableCell>
                                            <TableCell>{formatRupiah(d.total_tagihan)}</TableCell>
                                            <TableCell className="text-emerald-600 font-medium">{formatRupiah(d.jumlah_dibayar)}</TableCell>
                                            <TableCell className="text-orange-600">{formatRupiah(d.nominal_retur || 0)}</TableCell>
                                            <TableCell className="text-destructive font-medium">{formatRupiah(d.sisa_tagihan)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    d.status_pembayaran === "Lunas" ? "default" :
                                                        d.status_pembayaran === "DP/Parsial" ? "secondary" : "destructive"
                                                }>
                                                    {d.status_pembayaran}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(d)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Status Tagihan</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <form action={handleUpdate} className="space-y-4 pt-4">
                            <input type="hidden" name="id" value={editing.id} />
                            <input type="hidden" name="total_tagihan" value={editing.total_tagihan} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nomor Transaksi</Label>
                                    <Input value={editing.nomor_transaksi} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Tagihan</Label>
                                    <Input value={formatRupiah(editing.total_tagihan)} disabled />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jumlah_dibayar">Jumlah Dibayar</Label>
                                <Input
                                    id="jumlah_dibayar"
                                    name="jumlah_dibayar"
                                    type="number"
                                    defaultValue={editing.jumlah_dibayar}
                                    placeholder="Masukkan nominal yang sudah dibayar"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Update total pembayaran yang sudah diterima</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nominal_retur">Nominal Retur</Label>
                                <Input
                                    id="nominal_retur"
                                    name="nominal_retur"
                                    type="number"
                                    defaultValue={editing.nominal_retur || 0}
                                    placeholder="Masukkan nominal retur (jika ada)"
                                />
                                <p className="text-[10px] text-muted-foreground">Nominal ini akan mengurangi sisa tagihan</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Input
                                    id="catatan"
                                    name="catatan"
                                    defaultValue={editing.catatan || ""}
                                    placeholder="Keterangan pembayaran/retur"
                                />
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Sisa Tagihan Sebelumnya:</span>
                                    <span className="font-bold text-destructive">{formatRupiah(editing.sisa_tagihan)}</span>
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground italic mt-2">
                                    Status pembayaran akan otomatis terupdate berdasarkan sisa tagihan (Lunas jika sisa ≤ 0)
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="submit" className="w-full">Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
