"use client";

import { useState } from "react";
import { formatRupiah, MONTHS } from "@/lib/format";
import { exportToExcel } from "@/lib/export";
import type { Pendapatan, Pengeluaran } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, BarChart4, Plus, Minus } from "lucide-react";

export function LaporanClient({
    pendapatan,
    pengeluaran,
}: {
    pendapatan: Pendapatan[];
    pengeluaran: Pengeluaran[];
}) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [bulan, setBulan] = useState(currentMonth);
    const [tahun, setTahun] = useState(currentYear);

    // Filter Data
    const filteredPendapatan = pendapatan.filter((p) => {
        const d = new Date(p.tanggal);
        return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });

    const filteredPengeluaran = pengeluaran.filter((p) => {
        const d = new Date(p.tanggal);
        return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });

    const totalPendapatan = filteredPendapatan.reduce((sum, p) => sum + p.jumlah, 0);
    const totalPengeluaran = filteredPengeluaran.reduce((sum, p) => sum + p.jumlah, 0);
    const labaBersih = totalPendapatan - totalPengeluaran;

    // Group by Kategori
    const pendapatanByKategori = filteredPendapatan.reduce((acc, curr) => {
        const kName = curr.kategori?.nama || "Tidak Diberi Kategori";
        acc[kName] = (acc[kName] || 0) + curr.jumlah;
        return acc;
    }, {} as Record<string, number>);

    const pengeluaranByKategori = filteredPengeluaran.reduce((acc, curr) => {
        const kName = curr.kategori?.nama || "Tidak Diberi Kategori";
        acc[kName] = (acc[kName] || 0) + curr.jumlah;
        return acc;
    }, {} as Record<string, number>);

    // Export Funcs
    function exportLabaRugi() {
        const data = [
            { Deskripsi: "PENDAPATAN", Jumlah: "" },
            ...Object.entries(pendapatanByKategori).map(([k, v]) => ({ Deskripsi: `  - ${k}`, Jumlah: v })),
            { Deskripsi: "Total Pendapatan", Jumlah: totalPendapatan },
            { Deskripsi: "", Jumlah: "" },
            { Deskripsi: "PENGELUARAN", Jumlah: "" },
            ...Object.entries(pengeluaranByKategori).map(([k, v]) => ({ Deskripsi: `  - ${k}`, Jumlah: v })),
            { Deskripsi: "Total Pengeluaran", Jumlah: totalPengeluaran },
            { Deskripsi: "", Jumlah: "" },
            { Deskripsi: "LABA/RUGI BERSIH", Jumlah: labaBersih },
        ];
        exportToExcel(data, `LabaRugi_${MONTHS[bulan - 1]}_${tahun}`);
    }

    function exportDetail(tipe: "pendapatan" | "pengeluaran") {
        const source = tipe === "pendapatan" ? filteredPendapatan : filteredPengeluaran;
        const data = source.map((d) => ({
            Tanggal: d.tanggal,
            Deskripsi: d.deskripsi,
            Kategori: d.kategori?.nama || "-",
            Metode: d.metode_pembayaran || "-",
            Jumlah: d.jumlah,
            Catatan: d.catatan || "-",
        }));
        exportToExcel(data, `Detail_${tipe}_${MONTHS[bulan - 1]}_${tahun}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h1>
                    <p className="text-muted-foreground">Monitor kesehatan bisnis bulanan</p>
                </div>
                <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border items-center shadow-sm">
                    <Select value={String(bulan)} onValueChange={(v) => setBulan(Number(v))}>
                        <SelectTrigger className="w-[130px] h-9 border-0 bg-transparent shadow-none focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                    <Select value={String(tahun)} onValueChange={(v) => setTahun(Number(v))}>
                        <SelectTrigger className="w-[100px] h-9 border-0 bg-transparent shadow-none focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-950/30">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">Total Pendapatan</h3>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">{formatRupiah(totalPendapatan)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-950/30">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Total Pengeluaran</h3>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-50">{formatRupiah(totalPengeluaran)}</p>
                    </CardContent>
                </Card>
                <Card className={`border-0 shadow-sm ${labaBersih >= 0 ? "bg-blue-50 dark:bg-blue-950/30" : "bg-neutral-100 dark:bg-neutral-900/50"}`}>
                    <CardContent className="p-6">
                        <h3 className={`text-sm font-medium mb-1 ${labaBersih >= 0 ? "text-blue-800 dark:text-blue-400" : "text-neutral-600"}`}>Laba/Rugi Bersih</h3>
                        <p className={`text-2xl font-bold ${labaBersih >= 0 ? "text-blue-900 dark:text-blue-50" : "text-red-500"}`}>{formatRupiah(labaBersih)}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="laba-rugi" className="w-full">
                <TabsList className="grid w-full grid-cols-3 P-1 mb-4">
                    <TabsTrigger value="laba-rugi">Laba Rugi</TabsTrigger>
                    <TabsTrigger value="pendapatan">Rekap Pendapatan</TabsTrigger>
                    <TabsTrigger value="pengeluaran">Rekap Pengeluaran</TabsTrigger>
                </TabsList>

                {/* Laporan Laba Rugi */}
                <TabsContent value="laba-rugi">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-lg">Laporan Laba Rugi</CardTitle>
                                <CardDescription>Periode {MONTHS[bulan - 1]} {tahun}</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={exportLabaRugi}>
                                <Download className="mr-2 h-4 w-4" /> Export Excel
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Box Pendapatan */}
                            <div>
                                <h4 className="font-semibold text-emerald-600 uppercase mb-3 flex items-center"><Plus className="mr-1 h-4 w-4" /> PENDAPATAN</h4>
                                {Object.keys(pendapatanByKategori).length === 0 ? (
                                    <p className="text-muted-foreground text-sm ml-5">Tidak ada data</p>
                                ) : (
                                    <div className="space-y-2 ml-5">
                                        {Object.entries(pendapatanByKategori).map(([k, v]) => (
                                            <div key={k} className="flex justify-between text-sm py-1 border-b border-dashed">
                                                <span>{k}</span>
                                                <span className="font-medium">{formatRupiah(v)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-sm py-2 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-lg mt-2">
                                            <span>Total Pendapatan</span>
                                            <span className="text-emerald-600">{formatRupiah(totalPendapatan)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Box Pengeluaran */}
                            <div>
                                <h4 className="font-semibold text-red-500 uppercase mb-3 flex items-center"><Minus className="mr-1 h-4 w-4" /> PENGELUARAN</h4>
                                {Object.keys(pengeluaranByKategori).length === 0 ? (
                                    <p className="text-muted-foreground text-sm ml-5">Tidak ada data</p>
                                ) : (
                                    <div className="space-y-2 ml-5">
                                        {Object.entries(pengeluaranByKategori).map(([k, v]) => (
                                            <div key={k} className="flex justify-between text-sm py-1 border-b border-dashed">
                                                <span>{k}</span>
                                                <span className="font-medium">{formatRupiah(v)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-sm py-2 font-bold bg-red-50/50 dark:bg-red-950/20 px-2 rounded-lg mt-2">
                                            <span>Total Pengeluaran</span>
                                            <span className="text-red-500">{formatRupiah(totalPengeluaran)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Box Net */}
                            <div className={`p-4 rounded-xl flex justify-between items-center text-lg font-bold ${labaBersih >= 0 ? "bg-blue-600 text-white" : "bg-red-500 text-white"}`}>
                                <span>LABA BERSIH OPERASIONAL</span>
                                <span>{formatRupiah(labaBersih)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Rekap Pendapatan */}
                <TabsContent value="pendapatan">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-lg">Detail Pendapatan</CardTitle>
                                <CardDescription>Rincian pemasukan bulan {MONTHS[bulan - 1]} {tahun}</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => exportDetail("pendapatan")}>
                                <Download className="mr-2 h-4 w-4" /> Export Detail
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredPendapatan.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground space-y-3">
                                    <BarChart4 className="h-10 w-10 mx-auto opacity-20" />
                                    <p>Tidak ada pendapatan di bulan ini</p>
                                </div>
                            ) : (
                                <div className="divide-y max-h-[500px] overflow-y-auto">
                                    {filteredPendapatan.map(p => (
                                        <div key={p.id} className="p-4 flex justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                            <div>
                                                <p className="font-medium text-sm">{p.deskripsi}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(p.tanggal).toLocaleDateString("id-ID")} • {p.kategori?.nama}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600 text-sm">+{formatRupiah(p.jumlah)}</p>
                                                <p className="text-xs text-muted-foreground">{p.metode_pembayaran}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Rekap Pengeluaran */}
                <TabsContent value="pengeluaran">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-lg">Detail Pengeluaran</CardTitle>
                                <CardDescription>Rincian operasional bulan {MONTHS[bulan - 1]} {tahun}</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => exportDetail("pengeluaran")}>
                                <Download className="mr-2 h-4 w-4" /> Export Detail
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredPengeluaran.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground space-y-3">
                                    <BarChart4 className="h-10 w-10 mx-auto opacity-20" />
                                    <p>Tidak ada pengeluaran di bulan ini</p>
                                </div>
                            ) : (
                                <div className="divide-y max-h-[500px] overflow-y-auto">
                                    {filteredPengeluaran.map(p => (
                                        <div key={p.id} className="p-4 flex justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                            <div>
                                                <p className="font-medium text-sm">{p.deskripsi}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(p.tanggal).toLocaleDateString("id-ID")} • {p.kategori?.nama}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-500 text-sm">-{formatRupiah(p.jumlah)}</p>
                                                <p className="text-xs text-muted-foreground">{p.metode_pembayaran}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
