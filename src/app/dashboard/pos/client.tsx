"use client";

import { useState } from "react";
import { createTransaksi } from "@/actions/data";
import { formatRupiah, METODE_PEMBAYARAN } from "@/lib/format";
import type { Produk, CartItem, Kategori } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Minus, Search, ShoppingCart, Trash2, Receipt, Package } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function PosClient({ produkList, kategoriList }: { produkList: Produk[]; kategoriList: Kategori[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [diskonType, setDiskonType] = useState<"nominal" | "persen">("nominal");
    const [diskonValue, setDiskonValue] = useState(0);
    const [metodePembayaran, setMetodePembayaran] = useState("Cash");
    const [catatan, setCatatan] = useState("");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successTrx, setSuccessTrx] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredProduk = produkList.filter((p) => {
        const matchesSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
            (p.deskripsi && p.deskripsi.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || p.kategori_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const diskonNominal = diskonType === "nominal" ? diskonValue : (subtotal * diskonValue / 100);
    const total = subtotal - diskonNominal;

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
                    if (newQty <= 0) return { ...item, jumlah: 0 }; // handled by filter below

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
            setDiskonValue(0);
        }
    }

    async function handleCheckout() {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        const payload = cart.map((c) => ({
            produk_id: c.produk_id,
            nama_produk: c.nama,
            harga: c.harga,
            jumlah: c.jumlah,
            subtotal: c.subtotal,
        }));

        const result = await createTransaksi(payload, diskonNominal, diskonType === "persen" ? diskonValue : 0, metodePembayaran, catatan);
        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Transaksi Berhasil");
            setSuccessTrx(result.nomor || "TRX-OK");
            setCart([]);
            setDiskonValue(0);
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
                            <Package className="h-5 w-5" /> Katalog
                        </h2>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari menu, layanan..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Produk Cepat</DialogTitle>
                                </DialogHeader>
                                <form action={async (formData) => {
                                    const { upsertProduk } = await import("@/actions/data");
                                    const res = await upsertProduk(formData);
                                    if (res.error) toast.error(res.error);
                                    else { toast.success("Produk ditambahkan!"); router.refresh(); }
                                }} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nama Barang/Jasa</Label>
                                        <Input name="nama" placeholder="Contoh: Kopi Susu, atau Jasa Service" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Harga Jual (Rp)</Label>
                                            <Input type="number" name="harga" placeholder="0" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Satuan</Label>
                                            <Input name="satuan" defaultValue="pcs" placeholder="pcs, porsi, jam" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Stok Awal</Label>
                                            <Input type="number" name="stok" defaultValue={0} placeholder="Bisa diset 0 jika berupa Jasa" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kategori</Label>
                                            <Select name="kategori_id">
                                                <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                                <SelectContent>
                                                    {kategoriList.map((k) => (
                                                        <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full">Simpan ke Katalog</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto no-scrollbar bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="sm"
                        className="rounded-full flex-shrink-0"
                        onClick={() => setSelectedCategory("all")}
                    >
                        Semua
                    </Button>
                    {kategoriList.map(cat => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            className="rounded-full flex-shrink-0"
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.nama}
                        </Button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {produkList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <Package className="h-12 w-12 opacity-20" />
                            <p>Belum ada produk untuk POS.</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" /> Tambah Produk Cepat
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Tambah Produk Baru</DialogTitle>
                                    </DialogHeader>
                                    <form action={async (formData) => {
                                        const { upsertProduk } = await import("@/actions/data");
                                        const res = await upsertProduk(formData);
                                        if (res.error) toast.error(res.error);
                                        else { toast.success("Produk ditambahkan!"); router.refresh(); }
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nama Barang/Jasa</Label>
                                            <Input name="nama" placeholder="Contoh: Es Teh" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Harga Jual (Rp)</Label>
                                                <Input type="number" name="harga" placeholder="0" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Satuan</Label>
                                                <Input name="satuan" defaultValue="pcs" placeholder="pcs" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stok Awal</Label>
                                            <Input type="number" name="stok" defaultValue={0} />
                                        </div>
                                        <Button type="submit" className="w-full">Simpan</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {p.kategori && (
                                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-muted-foreground">
                                                    {p.kategori.nama}
                                                </span>
                                            )}
                                            {p.deskripsi && <p className="text-xs text-muted-foreground line-clamp-1">{p.deskripsi}</p>}
                                        </div>

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
                            {filteredProduk.length === 0 && search && (
                                <div className="col-span-full py-10 text-center text-muted-foreground">
                                    Pencarian &quot;{search}&quot; tidak ditemukan
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KANAN - Keranjang (Cart) */}
            <div className="w-full lg:w-[400px] flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border shadow-lg xl:shadow-sm">
                <div className="p-4 border-b flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-t-xl">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Pesanan
                        {cart.length > 0 && (
                            <Badge variant="secondary" className="ml-2 rounded-full px-2 h-5 text-xs bg-emerald-100 text-emerald-700">
                                {cart.length} item
                            </Badge>
                        )}
                    </h2>
                    {cart.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-100 dark:hover:bg-red-900/30" onClick={clearCart}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <ShoppingCart className="h-16 w-16 mb-4" />
                            <p>Keranjang masih kosong</p>
                            <p className="text-sm">Pilih produk di sebelah kiri</p>
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
                                        <button
                                            className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                            onClick={() => updateQuantity(item.produk_id, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium">{item.jumlah}</span>
                                        <button
                                            className="h-6 w-6 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                            onClick={() => updateQuantity(item.produk_id, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>

                                    <div className="w-[85px] text-right">
                                        <p className="font-bold text-sm tracking-tight">{formatRupiah(item.subtotal)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total & Checkout Button */}
                <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50 rounded-b-xl space-y-4 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)]">
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal ({cart.length} item)</span>
                            <span>{formatRupiah(subtotal)}</span>
                        </div>
                        {diskonNominal > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Diskon {diskonType === "persen" && `(${diskonValue}%)`}</span>
                                <span>-{formatRupiah(diskonNominal)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                            <span>Total Tagihan</span>
                            <span className="text-emerald-600">{formatRupiah(total)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-md font-bold disabled:opacity-50"
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        BAYAR {cart.length > 0 ? formatRupiah(total) : ""}
                    </Button>
                </div>
            </div>

            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={(v) => { if (!isSubmitting) setIsCheckoutOpen(v); }}>
                <DialogContent className="sm:max-w-md">
                    {!successTrx ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl">Selesaikan Pembayaran</DialogTitle>
                            </DialogHeader>

                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 flex flex-col items-center justify-center mb-4 border">
                                <span className="text-muted-foreground text-sm font-medium mb-1">TOTAL TAGIHAN</span>
                                <span className="text-3xl font-bold tracking-tighter text-emerald-600">{formatRupiah(total)}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Diskon</Label>
                                    <div className="flex gap-2">
                                        <Select value={diskonType} onValueChange={(val: "nominal" | "persen") => setDiskonType(val)}>
                                            <SelectTrigger className="w24 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nominal">Rp</SelectItem>
                                                <SelectItem value="persen">%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            value={diskonValue}
                                            onChange={(e) => setDiskonValue(Number(e.target.value) || 0)}
                                            placeholder="0"
                                            className="h-11 font-medium text-lg flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Metode Pembayaran</Label>
                                    <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                                        <SelectTrigger className="h-11 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {METODE_PEMBAYARAN.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Catatan Transaksi</Label>
                                    <Input
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Contoh: Nama pelanggan, tanpa gula, dsb."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button variant="outline" className="h-12" onClick={() => setIsCheckoutOpen(false)} disabled={isSubmitting}>
                                    Batal
                                </Button>
                                <Button className="h-12 text-md font-bold" onClick={handleCheckout} disabled={isSubmitting}>
                                    {isSubmitting ? "Memproses..." : "Selesaikan"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        // Success State
                        <div className="py-8 flex flex-col items-center text-center space-y-6">
                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                <Receipt className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Pembayaran Berhasil!</h2>
                                <p className="text-emerald-600 font-medium">#{successTrx}</p>
                                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-4">
                                    Transaksi telah dicatat dan masuk ke menu Pendapatan
                                </p>
                            </div>
                            <div className="w-full flex gap-3 pt-4 border-t">
                                <Button variant="outline" className="flex-1" onClick={() => window.open(`/struk/${successTrx}`, "_blank")}>
                                    <Receipt className="mr-2 h-4 w-4" /> Cetak Struk
                                </Button>
                                <Button className="flex-1" onClick={resetNewTransaction}>
                                    Transaksi Baru
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
