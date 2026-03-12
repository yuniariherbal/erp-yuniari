"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, restricted: true },
    { href: "/dashboard/pendapatan", label: "Pendapatan", icon: TrendingUp },
    { href: "/dashboard/pengeluaran", label: "Pengeluaran", icon: TrendingDown },
    { href: "/dashboard/pos", label: "POS", icon: ShoppingCart },
    { href: "/dashboard/produk", label: "Produk", icon: Package, restricted: true },
    { href: "/dashboard/karyawan", label: "Karyawan", icon: Users, restricted: true },
    { href: "/dashboard/penggajian", label: "Penggajian", icon: Wallet, restricted: true },
    { href: "/dashboard/laporan", label: "Laporan", icon: FileSpreadsheet, restricted: true },
];

function SidebarContent({ pathname, role }: { pathname: string, role: string }) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-4 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                    <BarChart3 className="h-5 w-5 text-zinc-50 dark:text-zinc-900" />
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
                <form action={logout}>
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

    useEffect(() => {
        const getRole = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            if (data.user?.user_metadata?.role) {
                setRole(data.user.user_metadata.role);
            }
        };
        getRole();
    }, []);

    return (
        <div className="flex min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r bg-white dark:bg-zinc-900 fixed inset-y-0 z-30">
                <SidebarContent pathname={pathname} role={role} />
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
                            <SidebarContent pathname={pathname} role={role} />
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-bold text-sm">ERP Yuniari</span>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 lg:ml-60">
                <div className="p-4 pt-18 lg:p-8 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
