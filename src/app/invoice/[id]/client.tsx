"use client";

import { formatRupiah } from "@/lib/format";
import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransaksiB2B } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

export default function InvoiceClient({ transaksi }: { transaksi: TransaksiB2B & { user?: { email?: string } } }) {
    function handleShare() {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Link invoice berhasil disalin!");
    }

    return (
        <div className="flex flex-col items-center w-full max-w-[210mm]">
            {/* Action Bar (Not printed) */}
            <div className="mb-6 flex gap-3 w-full justify-end print:hidden">
                <Button variant="outline" onClick={() => window.close()}>Tutup</Button>
                <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Copy Link
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Invoice A4
                </Button>
            </div>

            {/* Print Area - standard A4 width */}
            <div className="bg-white text-black p-10 w-full min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:p-0 rounded-sm">

                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-6 mb-8 mt-2">
                    <div className="flex items-center gap-4">
                        <Image src="/favicon.png" alt="Logo" width={64} height={64} className="rounded-md" />
                        <div>
                            <h1 className="font-black text-3xl tracking-tight text-zinc-900">HERBAL YUNIARI</h1>
                            <p className="text-zinc-600 font-medium text-sm mt-1">Grosir & Maklon Produk Spesialis Herbal</p>
                            <p className="text-sm text-zinc-500 max-w-xs mt-1 leading-snug">
                                Singkar I, Wareng, Kec. Wonosari, Kabupaten Gunungkidul, D.I Yogyakarta (Telp: 0877-3834-7257)
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-emerald-700 uppercase tracking-widest mb-2">INVOICE</h2>
                        <table className="text-sm font-medium ml-auto">
                            <tbody>
                                <tr>
                                    <td className="text-zinc-500 pr-4 pb-1 text-right">No. Invoice</td>
                                    <td className="font-bold pb-1 text-zinc-900">{transaksi.nomor_transaksi}</td>
                                </tr>
                                <tr>
                                    <td className="text-zinc-500 pr-4 pb-1 text-right">Tanggal</td>
                                    <td className="font-bold pb-1 text-zinc-900">{new Date(transaksi.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                </tr>
                                {transaksi.jatuh_tempo && (
                                    <tr>
                                        <td className="text-zinc-500 pr-4 pb-1 text-right">Jatuh Tempo</td>
                                        <td className="font-bold pb-1 text-red-600">{new Date(transaksi.jatuh_tempo).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info & Bill To */}
                <div className="flex justify-between mb-8">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 w-1/2 mr-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Ditagihkan Kepada:</p>
                        <h3 className="font-bold text-lg text-zinc-900">{transaksi.mitra?.nama || "-"}</h3>
                        <p className="text-sm text-zinc-600 mt-1 font-medium">{transaksi.mitra?.kategori || "Mitra"}</p>
                        <p className="text-sm mt-3 text-zinc-700 whitespace-pre-wrap">{transaksi.mitra?.alamat || "Alamat tidak tersedia"}</p>
                        <p className="text-sm mt-2 font-medium text-zinc-900 flex items-center gap-2">
                            WhatsApp: {transaksi.mitra?.kontak_wa || "-"}
                        </p>
                    </div>

                    <div className="w-1/3 space-y-4">
                        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-emerald-800/60 uppercase tracking-wider">Status Bayar</span>
                            <span className={`font-bold px-3 py-1 bg-white rounded-md border text-sm ${transaksi.status_pembayaran === "Lunas" ? "text-emerald-700 border-emerald-200" :
                                    transaksi.status_pembayaran === "DP/Parsial" ? "text-amber-600 border-amber-200" :
                                        "text-red-600 border-red-200"
                                }`}>{transaksi.status_pembayaran}</span>
                        </div>
                        <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-800/60 uppercase tracking-wider">Pengiriman</span>
                            <span className={`font-bold px-3 py-1 bg-white rounded-md border text-sm ${transaksi.status_pengiriman === 'Selesai' ? 'text-emerald-600 border-emerald-200' :
                                    transaksi.status_pengiriman === 'Dikirim' ? 'text-blue-600 border-blue-200' :
                                        'text-amber-600 border-amber-200'
                                }`}>{transaksi.status_pengiriman}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-hidden rounded-xl border border-zinc-200">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200">
                            <tr>
                                <th className="text-left py-3 px-4 font-bold uppercase text-xs tracking-wider">Deskripsi Item</th>
                                <th className="text-right py-3 px-4 font-bold uppercase text-xs tracking-wider w-24">Harga</th>
                                <th className="text-center py-3 px-4 font-bold uppercase text-xs tracking-wider w-20">Qty</th>
                                <th className="text-right py-3 px-4 font-bold uppercase text-xs tracking-wider w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {transaksi.transaksi_b2b_detail?.map((item, i: number) => (
                                <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-zinc-900">{item.nama_produk}</div>
                                    </td>
                                    <td className="py-4 px-4 text-right text-zinc-600">{formatRupiah(item.harga)}</td>
                                    <td className="py-4 px-4 text-center font-medium text-zinc-900">{item.jumlah}</td>
                                    <td className="py-4 px-4 text-right font-bold text-zinc-900">{formatRupiah(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="flex justify-between items-start mt-4">
                    <div className="w-1/2 pr-12 text-sm text-zinc-600">
                        {transaksi.metode_pembayaran && (
                            <div className="mb-4">
                                <p className="font-bold text-zinc-900 mb-1">Metode Pembayaran:</p>
                                <p>{transaksi.metode_pembayaran}</p>
                            </div>
                        )}
                        {transaksi.catatan && (
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-zinc-700">
                                <p className="font-bold text-zinc-900 mb-1">Catatan:</p>
                                <p className="italic text-sm leading-relaxed">{transaksi.catatan}</p>
                            </div>
                        )}
                        <div className="mt-8 text-center w-48">
                            <p className="mb-16">Hormat Kami,</p>
                            <div className="border-b border-zinc-800 pb-1">
                                <p className="font-bold text-zinc-900">{transaksi.user?.email?.split('@')[0] || "Admin"}</p>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Herbal Yuniari</p>
                        </div>
                    </div>

                    <div className="w-1/2 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-600">
                                <span className="font-medium">Subtotal Item</span>
                                <span className="font-semibold text-zinc-900">{formatRupiah(transaksi.total)}</span>
                            </div>
                            {transaksi.diskon > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span className="font-medium">Diskon</span>
                                    <span className="font-semibold">-{formatRupiah(transaksi.diskon)}</span>
                                </div>
                            )}
                            {transaksi.ongkir > 0 && (
                                <div className="flex justify-between text-zinc-600">
                                    <span className="font-medium">Biaya Pengiriman</span>
                                    <span className="font-semibold text-zinc-900">{formatRupiah(transaksi.ongkir)}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-lg mt-2">
                                <span className="font-black text-zinc-900">Total Tagihan</span>
                                <span className="font-black text-zinc-900 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md">{formatRupiah(transaksi.total_tagihan)}</span>
                            </div>

                            <div className="pt-4 border-t border-zinc-200 border-dashed flex justify-between text-zinc-600">
                                <span className="font-medium">Telah Dibayar / DP</span>
                                <span className="font-semibold text-zinc-900">{formatRupiah(transaksi.jumlah_dibayar)}</span>
                            </div>

                            {(transaksi.sisa_tagihan) > 0 && (
                                <div className="pt-2 flex justify-between items-center">
                                    <span className="font-bold text-red-600 uppercase tracking-wide text-xs">Sisa Pembayaran / Piutang</span>
                                    <span className="font-bold text-red-600 text-lg">{formatRupiah(transaksi.sisa_tagihan)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Global Print Styles for A4 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: A4 portrait;
                        margin: 10mm; 
                    }
                    body { 
                        visibility: hidden; 
                        background: white;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:m-0 { margin: 0 !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:block, 
                    .print\\:block * { visibility: visible; }
                    
                    /* The container for the invoice */
                    .flex.flex-col.items-center.w-full.max-w-\\[210mm\\] {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}} />
        </div>
    );
}
