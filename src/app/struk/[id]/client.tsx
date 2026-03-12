"use client";

import { formatRupiah } from "@/lib/format";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaksi } from "@/lib/types";

export default function StrukClient({ transaksi }: { transaksi: Transaksi & { user?: { email?: string } } }) {
    return (
        <div className="flex flex-col items-center">
            {/* Action Bar (Not printed) */}
            <div className="mb-4 flex gap-2 w-full justify-between print:hidden max-w-[58mm] mx-auto">
                <Button variant="outline" onClick={() => window.close()} className="flex-1 text-xs h-9">Tutup</Button>
                <Button onClick={() => window.print()} className="flex-1 text-xs h-9">
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Cetak
                </Button>
            </div>

            {/* Print Area - standard 58mm thermal receipt size */}
            <div className="bg-white text-black p-3 w-[58mm] shadow-lg print:shadow-none print:m-0 print:p-0">
                {/* Header */}
                <div className="text-center mb-3 border-b pb-3 border-dashed border-gray-400">
                    <h1 className="font-bold text-lg mb-1 mt-1">Herbal Yuniari</h1>
                    <p className="text-[10px] leading-tight px-1">Singkar I, Wareng, Kec. Wonosari, Kabupaten Gunungkidul, Daerah Istimewa Yogyakarta</p>
                    <p className="text-[10px] mb-2 mt-1">Telp: 087738347257</p>

                    <div className="flex justify-between text-[10px] mt-2 text-left">
                        <div>
                            <p>No: {transaksi.nomor_transaksi}</p>
                            <p>Tgl: {new Date(transaksi.tanggal).toLocaleDateString("id-ID")}</p>
                        </div>
                        <div className="text-right">
                            <p>Ksr: {transaksi.user?.email ? transaksi.user.email.split('@')[0] : 'Admin'}</p>
                            <p>{new Date(transaksi.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-3">
                    <table className="w-full text-[11px]">
                        <thead>
                            <tr className="border-b border-dashed border-gray-400">
                                <th className="text-left pb-1 font-normal">Item</th>
                                <th className="text-right pb-1 font-normal w-6">Qty</th>
                                <th className="text-right pb-1 font-normal">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksi.transaksi_detail?.map((item, i: number) => (
                                <tr key={i} className="align-top">
                                    <td className="py-1.5 pr-1">
                                        <div className="font-semibold leading-tight">{item.nama_produk}</div>
                                        <div className="text-[10px] text-gray-500">{formatRupiah(item.harga)}</div>
                                    </td>
                                    <td className="py-1.5 text-right">{item.jumlah}</td>
                                    <td className="py-1.5 text-right font-medium">{formatRupiah(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-gray-400 pt-2 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatRupiah(transaksi.total)}</span>
                    </div>
                    {transaksi.diskon > 0 && (
                        <div className="flex justify-between">
                            <span>Diskon {transaksi.diskon_persen && transaksi.diskon_persen > 0 ? `(${transaksi.diskon_persen}%)` : ""}</span>
                            <span>-{formatRupiah(transaksi.diskon)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-sm mt-1.5 pt-1.5 border-t border-gray-300">
                        <span>TOTAL</span>
                        <span>{formatRupiah(transaksi.total_bayar)}</span>
                    </div>
                </div>

                {/* Payment info */}
                <div className="border-t border-dashed border-gray-400 mt-2 pt-2 text-[10px] space-y-1 text-center">
                    <p>Pembayaran: {transaksi.metode_pembayaran}</p>
                    {transaksi.catatan && (
                        <p className="mt-1 italic text-gray-600">Cat: {transaksi.catatan}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-4 pt-3 text-[10px] space-y-1">
                    <p className="font-bold">Terima Kasih</p>
                    <p className="text-gray-500 text-[9px] px-2 leading-tight">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                    <p className="pt-2 font-medium">herbalyuniari.com</p>
                </div>
            </div>

            {/* Global Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: 58mm 297mm; /* standard 58mm thermal roll size */
                        margin: 0; 
                    }
                    body { 
                        visibility: hidden; 
                        background: white;
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:m-0 { margin: 0 !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:block, 
                    .print\\:block * { visibility: visible; }
                    .print\\:block { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 58mm;
                    }
                }
            `}} />
        </div>
    );
}
