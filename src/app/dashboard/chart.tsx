"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatRupiah } from "@/lib/format";

type ChartData = {
    bulan: string;
    pendapatan: number;
    pengeluaran: number;
};

export function DashboardChart({ data }: { data: ChartData[] }) {
    if (data.every((d) => d.pendapatan === 0 && d.pengeluaran === 0)) {
        return (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Belum ada data untuk ditampilkan
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={4}>
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
                />
                <Tooltip
                    formatter={(value: number | undefined) => formatRupiah(Number(value || 0))}
                    contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: "13px",
                    }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px" }} />
                <Bar dataKey="pendapatan" name="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
