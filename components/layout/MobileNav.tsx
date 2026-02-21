"use client";

import Link from "next/link";
import {
    Menu,
    LayoutDashboard,
    FolderKanban,
    Upload,
    Search,
    ScanFace,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-64 p-0">
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 py-5 border-b">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ScanFace className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Persona</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            AI Face ID
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Navigation
                    </p>
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/media"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <FolderKanban className="h-4 w-4" />
                        Media Library
                    </Link>
                    <Link
                        href="/upload"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Upload
                    </Link>
                    <Link
                        href="/search"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </Link>

                    <Separator className="my-3" />

                    <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        AI Engine
                    </p>
                    <Link
                        href="/enrollment"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <ScanFace className="h-4 w-4" />
                        Enrollment
                    </Link>
                    <Link
                        href="/processing"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Activity className="h-4 w-4" />
                        Processing
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
