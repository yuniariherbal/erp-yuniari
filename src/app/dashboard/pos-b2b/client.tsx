"use client";

import { useState } from "react";
import { createTransaksiB2B } from "@/actions/data";
import { formatRupiah, METODE_PEMBAYARAN } from "@/lib/format";
import type { Produk, Mitra, CartItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus, Search, ShoppingCart, Trash2, Receipt, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function PosB2BClient({ produkList, mitraList }: { produkList: Produk[], mitraList: Mitra[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);

    // B2B specific states
    const [mitraId, setMitraId] = useState<string>("");
    const [diskonNominal, setDiskonNominal] = useState(0);
    const [ongkir, setOngkir] = useState(0);
    const [jumlahDibayar, setJumlahDibayar] = useState(0);
    const [statusPengiriman, setStatusPengiriman] = useState("Diproses");
    const [jatuhTempo, setJatuhTempo] = useState<string>("");

    const [metodePembayaran, setMetodePembayaran] = useState("Transfer");
    const [catatan, setCatatan] = useState("");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successTrx, setSuccessTrx] = useState("");

    const filteredProduk = produkList.filter((p) =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(search.toLowerCase()))
    );

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTagihan = subtotal + ongkir - diskonNominal;

    function addToCart(produk: Produk) {
        if (produk.stok <= 0) {
            toast.error("Stok habis!");
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.produk_id === produk.id);
            if (existing) {
                if (existing.jumlah >= produk.stok) {
                    toast.error("Melebihi stok yang tersedia");
                    return prev;
                }
                return prev.map((item) =>
                    item.produk_id === produk.id
                        ? { ...item, jumlah: item.jumlah + 1, subtotal: (item.jumlah + 1) * item.harga }
                        : item
                );
            }
            return [...prev, { produk_id: produk.id, nama: produk.nama, harga: produk.harga, jumlah: 1, subtotal: produk.harga }];
        });
    }

    function updateQuantity(id: string, delta: number) {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.produk_id === id) {
                    const newQty = item.jumlah + delta;
                    if (newQty <= 0) return { ...item, jumlah: 0 };

                    const p = produkList.find(x => x.id === id);
                    if (p && newQty > p.stok) {
                        toast.error("Melebihi stok");
                        return item;
                    }

                    return { ...item, jumlah: newQty, subtotal: newQty * item.harga };
                }
                return item;
            }).filter((item) => item.jumlah > 0);
        });
    }

    function clearCart() {
        if (confirm("Kosongkan keranjang?")) {
            setCart([]);
            setDiskonNominal(0);
            setOngkir(0);
            setJumlahDibayar(0);
        }
    }

    async function handleCheckout() {
        if (cart.length === 0) return;
        if (!mitraId) {
            toast.error("Pilih mitra/reseller terlebih dahulu!");
            return;
        }

        setIsSubmitting(true);

        const payload = cart.map((c) => ({
            produk_id: c.produk_id,
            nama_produk: c.nama,
            harga: c.harga,
            jumlah: c.jumlah,
            subtotal: c.subtotal,
        }));

        const result = await createTransaksiB2B(
            mitraId,
            payload,
            diskonNominal,
            ongkir,
            jumlahDibayar,
            statusPengiriman,
            jatuhTempo || null,
            metodePembayaran,
            catatan
        );

        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Invoice B2B Berhasil Dibuat");
            setSuccessTrx(result.nomor || "INV-OK");
            setCart([]);
            setDiskonNominal(0);
            setOngkir(0);
            setJumlahDibayar(0);
            setCatatan("");
            router.refresh();
        }
    }

    function resetNewTransaction() {
        setSuccessTrx("");
        setIsCheckoutOpen(false);
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 overflow-hidden">
            {/* KIRI - Katalog Produk */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Truck className="h-5 w-5" /> Katalog B2B
                        </h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari produk konsinyasi..."
                            className="pl-9 bg-zinc-50 dark:bg-zinc-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {produkList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <Package className="h-12 w-12 opacity-20" />
                            <p>Belum ada produk untuk B2B.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                            {filteredProduk.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    disabled={p.stok <= 0}
                                    className="text-left flex flex-col relative overflow-hidden group border rounded-xl bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-36"
                                >
                                    <div className="p-4 flex-1 w-full">
                                        <h3 className="font-medium text-sm line-clamp-2 pr-4">{p.nama}</h3>
                                        <div className="absolute top-3 right-3">
                                            {p.stok > 0 ? (
                                                <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                                                    {p.stok}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-red-100 text-red-700">Habis</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-t bg-zinc-50/50 dark:bg-zinc-950/50 w-full flex justify-between items-center">
                                        <span className="font-bold text-emerald-600 text-sm">{formatRupiah(p.harga)}</span>
                                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KANAN - Keranjang (Cart) B2B */}
            <div className="w-full lg:w-[450px] flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border shadow-lg xl:shadow-sm">
                <div className="p-4 border-b flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Invoice B2B
                            {cart.length > 0 && <Badge variant="secondary" className="ml-2 rounded-full px-2 h-5 text-xs bg-emerald-100 text-emerald-700">{cart.length}</Badge>}
                        </h2>
                        {cart.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-100" onClick={clearCart}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Pilih Mitra */}
                    <div>
                        <Label className="text-xs mb-1 block text-muted-foreground">Pilih Mitra / Reseller</Label>
                        <Select value={mitraId} onValueChange={setMitraId}>
                            <SelectTrigger className="h-10 border-emerald-500/30 w-full">
                                <SelectValue placeholder="-- Pilih Mitra Konsinyasi --" />
                            </SelectTrigger>
                            <SelectContent>
                                {mitraList.length === 0 ? (
                                    <SelectItem value="none" disabled>Belum ada mitra</SelectItem>
                                ) : (
                                    mitraList.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            <div className="flex items-center">
                                                <span>{m.nama} <span className="text-xs text-muted-foreground opacity-70">({m.kategori})</span></span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <Package className="h-16 w-16 mb-4" />
                            <p>Keranjang B2B kosong</p>
                            <p className="text-sm">Klik produk dari katalog</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-4">
                            {cart.map((item) => (
                                <div key={item.produk_id} className="flex gap-3 justify-between items-center group">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm line-clamp-1">{item.nama}</p>
                                        <p className="text-emerald-600 font-semibold text-xs">{formatRupiah(item.harga)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border">
                                        <button className="h-6 w-6 rounded-md hover:bg-white flex items-center justify-center" onClick={() => updateQuantity(item.produk_id, -1)}><Minus className="h-3 w-3" /></button>
                                        <span className="w-6 text-center text-sm font-medium">{item.jumlah}</span>
                                        <button className="h-6 w-6 rounded-md hover:bg-zinc-200 flex items-center justify-center" onClick={() => updateQuantity(item.produk_id, 1)}><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <div className="w-[85px] text-right">
                                        <p className="font-bold text-sm tracking-tight">{formatRupiah(item.subtotal)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total & Checkout */}
                <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50 rounded-b-xl space-y-4 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)]">
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal ({cart.length} item)</span>
                            <span>{formatRupiah(subtotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                            <span>Total Item</span>
                            <span className="text-emerald-600">{formatRupiah(subtotal)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-md font-bold disabled:opacity-50"
                        disabled={cart.length === 0 || !mitraId}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        PROSES INVOICE
                    </Button>
                </div>
            </div>

            {/* Checkout Modal B2B */}
            <Dialog open={isCheckoutOpen} onOpenChange={(v) => { if (!isSubmitting) setIsCheckoutOpen(v); }}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    {!successTrx ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl">Buat Invoice B2B & Konsinyasi</DialogTitle>
                            </DialogHeader>

                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex flex-col items-center justify-center mb-2 border">
                                <span className="text-muted-foreground text-sm font-medium mb-1">TOTAL TAGIHAN</span>
                                <span className="text-3xl font-bold tracking-tighter text-emerald-600">{formatRupiah(totalTagihan)}</span>
                                <span className="text-xs text-muted-foreground mt-1 text-center">
                                    {(totalTagihan - jumlahDibayar) > 0
                                        ? `Sisa Tagihan: ${formatRupiah(totalTagihan - jumlahDibayar)}`
                                        : "Lunas / Tidak Ada Sisa Tagihan"}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 flex-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Diskon Spesial (Rp)</Label>
                                        <Input type="number" value={diskonNominal} onChange={(e) => setDiskonNominal(Number(e.target.value) || 0)} placeholder="0" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Ongkir (Rp)</Label>
                                        <Input type="number" value={ongkir} onChange={(e) => setOngkir(Number(e.target.value) || 0)} placeholder="0" />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-3 flex-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-emerald-600">Terbayar / DP Saat Ini (Rp)</Label>
                                        <Input type="number" value={jumlahDibayar} onChange={(e) => setJumlahDibayar(Number(e.target.value) || 0)} placeholder="Biarkan 0 bila kasbon" className="border-emerald-500/50 font-bold focus-visible:ring-emerald-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Metode</Label>
                                        <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{METODE_PEMBAYARAN.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 flex-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Jatuh Tempo (Wajib utk DP/Kasbon)</Label>
                                        <Input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Status Pengiriman</Label>
                                        <Select value={statusPengiriman} onValueChange={setStatusPengiriman}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Diproses">Diproses (Gudang)</SelectItem>
                                                <SelectItem value="Dikirim">Dikirim ke Kurir</SelectItem>
                                                <SelectItem value="Selesai">Bawa Langsung Selesai</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Catatan Internal</Label>
                                    <Input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Misal: Titip jual 2 minggu..." />
                                </div>
                            </div>

                            <Button onClick={handleCheckout} disabled={isSubmitting} className="w-full h-12 mt-4 font-bold text-md">
                                {isSubmitting ? "MEMPROSES INVOICE..." : "BUAT INVOICE B2B"}
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-emerald-600">INVOICE SUKSES!</h3>
                                <p className="text-muted-foreground mt-1">Nomor: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{successTrx}</span></p>
                            </div>

                            <div className="w-full space-y-3 pt-4 border-t border-dashed">
                                <Button className="w-full h-12 bg-zinc-900 dark:bg-zinc-50" onClick={() => {
                                    window.open(`/invoice/${successTrx}`, '_blank');
                                    resetNewTransaction();
                                }}>
                                    <Receipt className="mr-2 h-4 w-4" /> Cetak Invoice A4
                                </Button>
                                <Button variant="outline" className="w-full h-12" onClick={resetNewTransaction}>
                                    Transaksi Baru B2B
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

const Separator = () => <div className="w-full h-px bg-border" />;
