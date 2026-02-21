"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { RootState } from "@/store/store";
import { toggleSidebar } from "@/store/uiSlice";
import { useGetMediaQuery } from "@/store/api/mediaApi";
import {
    LayoutDashboard,
    FolderKanban,
    Settings,
    HelpCircle,
    Upload,
    Search,
    ScanFace,
    Activity,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

const mainLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Media Library", href: "/media", icon: FolderKanban },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Search", href: "/search", icon: Search },
];

const aiLinks = [
    { name: "Enrollment", href: "/enrollment", icon: ScanFace },
    { name: "Processing", href: "/processing", icon: Activity },
];

const secondaryLinks = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help Center", href: "/help", icon: HelpCircle },
];

function NavLink({
    href,
    icon: Icon,
    name,
    isActive,
    collapsed,
}: {
    href: string;
    icon: React.ElementType;
    name: string;
    isActive: boolean;
    collapsed: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center px-2",
                isActive
                    ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && name}
        </Link>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
    const { isError } = useGetMediaQuery({});
    const online = !isError;

    return (
        <aside
            className={cn(
                "hidden h-screen flex-col bg-sidebar border-r border-sidebar-border py-4 md:flex sticky top-0 z-30 overflow-hidden transition-all duration-300",
                collapsed ? "w-[60px] px-2" : "w-64 px-3"
            )}
        >
            {/* Brand */}
            <div
                className={cn(
                    "flex items-center pb-5 mb-1",
                    collapsed ? "justify-center" : "justify-between px-1"
                )}
            >
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <ScanFace className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight">Persona</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">
                                AI Face ID
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-1 flex-col gap-0.5">
                {!collapsed && (
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Navigation
                    </p>
                )}
                {mainLinks.map((link) => (
                    <NavLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        name={link.name}
                        isActive={pathname === link.href}
                        collapsed={collapsed}
                    />
                ))}

                <div className="my-3 border-t border-sidebar-border" />

                {!collapsed && (
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        AI Engine
                    </p>
                )}
                {aiLinks.map((link) => (
                    <NavLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        name={link.name}
                        isActive={pathname === link.href}
                        collapsed={collapsed}
                    />
                ))}

                <div className="my-3 border-t border-sidebar-border" />

                {secondaryLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <link.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && link.name}
                    </Link>
                ))}
            </nav>

            {/* Status */}
            <div
                className={cn(
                    "mt-auto pt-4 border-t border-sidebar-border",
                    collapsed ? "flex justify-center" : "px-1"
                )}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            online ? "bg-success" : "bg-destructive"
                        )}
                    />
                    {!collapsed && (
                        <span className="text-xs text-muted-foreground">
                            {online ? "System Online" : "Backend Offline"}
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}
