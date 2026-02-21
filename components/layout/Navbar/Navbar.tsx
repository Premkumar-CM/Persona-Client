"use client";

import { Search, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/layout/UserNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Navbar() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6">
            <MobileNav />

            <div className="flex w-full items-center gap-2 md:ml-auto">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
                        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
                    }}
                    className="ml-auto flex-1 sm:flex-initial"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search media, people..."
                            className="pl-9 h-9 sm:w-[260px] md:w-[200px] lg:w-[280px] bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                        />
                    </div>
                </form>

                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                </Button>
                <UserNav />
            </div>
        </header>
    );
}
