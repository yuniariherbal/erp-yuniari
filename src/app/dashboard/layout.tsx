"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Wallet,
    FileSpreadsheet,
    LogOut,
    Menu,
    Package,
    Loader2,
    Truck,
    Briefcase,
    Lock,
    Receipt,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, restricted: true },
    { href: "/dashboard/pendapatan", label: "Pendapatan", icon: TrendingUp },
    { href: "/dashboard/pengeluaran", label: "Pengeluaran", icon: TrendingDown },
    { href: "/dashboard/pos", label: "POS Kasir", icon: ShoppingCart },
    { href: "/dashboard/pos-b2b", label: "POS Invoice (B2B)", icon: Truck, restricted: true },
    { href: "/dashboard/produk", label: "Produk", icon: Package, restricted: true },
    { href: "/dashboard/mitra", label: "Mitra / Agen", icon: Briefcase, restricted: true },
    { href: "/dashboard/tagihan", label: "Data Tagihan", icon: Receipt, restricted: true },
    { href: "/dashboard/karyawan", label: "Karyawan", icon: Users, restricted: true },
    { href: "/dashboard/penggajian", label: "Penggajian", icon: Wallet, restricted: true },
    { href: "/dashboard/laporan", label: "Laporan", icon: FileSpreadsheet, restricted: true },
    { href: "/dashboard/akun", label: "Manage Akun", icon: Lock, masterOnly: true },
];

function SidebarContent({ pathname, role, onLogout }: { pathname: string, role: string, onLogout?: () => void }) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-4 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden">
                    <Image src="/favicon.png" alt="Herbal Yuniari Logo" width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div>
                    <p className="text-sm font-bold tracking-tight">ERP Yuniari</p>
                    <p className="text-xs text-muted-foreground">Mini ERP</p>
                </div>
            </div>

            <Separator />

            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    if (item.restricted && role === "Karyawan") return null;
                    if (item.masterOnly && role !== "Master") return null;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                isActive
                                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator />

            <div className="p-3">
                <form action={async () => {
                    if (onLogout) onLogout();
                    await logout();
                }}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" type="submit">
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<string>("Karyawan");
    const [email, setEmail] = useState<string>("Admin");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const getSessionData = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                if (data.user.user_metadata?.role) {
                    setRole(data.user.user_metadata.role);
                }
                if (data.user.email) {
                    setEmail(data.user.email.split('@')[0]);
                }
            }
        };
        getSessionData();
    }, []);

    if (isLoggingOut) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-6" />
                <h2 className="text-3xl font-bold animate-pulse text-zinc-900 dark:text-zinc-50">
                    Terima Kasih, {email}!
                </h2>
                <p className="text-muted-foreground mt-2 font-medium">Sedang keluar dari sistem...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r bg-white dark:bg-zinc-900 fixed inset-y-0 z-30">
                <SidebarContent pathname={pathname} role={role} onLogout={() => setIsLoggingOut(true)} />
            </aside>

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b bg-white dark:bg-zinc-900 px-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-60 p-0">
                        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                        <div onClick={() => setOpen(false)}>
                            <SidebarContent pathname={pathname} role={role} onLogout={() => setIsLoggingOut(true)} />
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-white overflow-hidden flex items-center justify-center">
                        <Image src="/favicon.png" alt="Logo" width={48} height={48} className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-sm">ERP Yuniari</span>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 lg:ml-60">
                <div className="p-4 pt-18 lg:p-8 lg:pt-8:">
                    {children}
                </div>
            </main>
        </div>
    );
}
