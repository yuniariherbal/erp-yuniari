import { getProduk, getKategori } from "@/actions/data";
import { PosClient } from "./client";

export default async function PosPage() {
    const [produk, kategori] = await Promise.all([
        getProduk(),
        getKategori("produk"),
    ]);
    return <PosClient produkList={produk || []} kategoriList={kategori || []} />;
}
