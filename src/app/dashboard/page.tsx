import { getDashboardStats } from "@/actions/data";
import { formatRupiah } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { DashboardChart } from "./chart";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const userRole = data.user?.user_metadata?.role;
    const userId = userRole === "Karyawan" ? data.user?.id : undefined;

    const stats = await getDashboardStats(userId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    {userRole === "Karyawan" ? "Rekap performa penjualan Anda bulan ini" : "Ringkasan keuangan bulan ini"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className={`grid gap-4 sm:grid-cols-2 ${userRole === "Karyawan" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
                <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-950/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {userRole === "Karyawan" ? "Pencapaian Penjualan" : "Pendapatan"}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{formatRupiah(stats.totalPendapatan)}</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-950/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Pengeluaran</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{formatRupiah(stats.totalPengeluaran)}</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            {userRole === "Karyawan" ? "Estimasi Profit" : "Profit / Loss"}
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${stats.profit >= 0 ? "text-blue-900 dark:text-blue-100" : "text-red-600"}`}>
                            {formatRupiah(stats.profit)}
                        </p>
                    </CardContent>
                </Card>

                {userRole !== "Karyawan" && (
                    <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-950/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Gaji Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.penggajianPending}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Chart */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Pendapatan vs Pengeluaran (6 Bulan)</CardTitle>
                </CardHeader>
                <CardContent>
                    <DashboardChart data={stats.chartData} />
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.recentTransaksi.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Belum ada transaksi</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentTransaksi.map((t: any, i: number) => (
                                <div key={i} className="flex items-center justify-between rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-medium">{t.deskripsi || (t.tipe === "pendapatan" ? "Pendapatan" : "Pengeluaran")}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(t.tanggal).toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${t.tipe === "pendapatan" ? "text-emerald-600" : "text-red-500"}`}>
                                            {t.tipe === "pendapatan" ? "+" : "-"}{formatRupiah(t.jumlah)}
                                        </p>
                                        <Badge variant="outline" className={`text-[10px] py-0 h-4 ${t.tipe === "pendapatan" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                            {t.tipe === "pendapatan" ? "Income" : "Expense"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
