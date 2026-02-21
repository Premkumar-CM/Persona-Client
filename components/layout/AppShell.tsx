"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);

    return (
        <div
            className="grid min-h-screen w-full"
            style={{
                gridTemplateColumns: `${collapsed ? "72px" : "256px"} 1fr`,
                transition: "grid-template-columns 300ms ease",
            }}
        >
            <Sidebar />
            <div className="flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
