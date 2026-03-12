import { getTransaksiB2BById } from "@/actions/data";
import { notFound } from "next/navigation";
import InvoiceClient from "./client";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const transaksi = await getTransaksiB2BById(id);

    if (!transaksi) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-8 px-4">
            <InvoiceClient transaksi={transaksi} />
        </div>
    );
}
