import { getTransaksiById } from "@/actions/data";
import { notFound } from "next/navigation";
import StrukClient from "./client";

export default async function StrukPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const transaksi = await getTransaksiById(id);

    if (!transaksi) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <StrukClient transaksi={transaksi} />
        </div>
    );
}
