import { getProduk } from "@/actions/data";
import { PosClient } from "./client";

export default async function PosPage() {
    const produk = await getProduk();
    return <PosClient produkList={produk || []} />;
}
