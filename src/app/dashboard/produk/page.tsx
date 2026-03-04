import { getProduk } from "@/actions/data";
import { ProdukClient } from "./client";

export default async function ProdukPage() {
    const data = await getProduk();
    return <ProdukClient data={data || []} />;
}
