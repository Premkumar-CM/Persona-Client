"use client";

import {
    Activity,
    ScanFace,
    FileVideo,
    Users,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    Upload,
} from "lucide-react";
import { useGetMediaQuery } from "@/store/api/mediaApi";
import Link from "next/link";

interface StatCardProps {
    title: string;
    value: number;
    sub: string;
    icon: React.ElementType;
    iconColor: string;
    isLoading: boolean;
    isError: boolean;
}

function StatCard({ title, value, sub, icon: Icon, iconColor, isLoading, isError }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {title}
                </span>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div>
                <p className="text-5xl font-black tabular-nums leading-none">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : isError ? (
                        <span className="text-muted-foreground">—</span>
                    ) : (
                        value
                    )}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    {isError ? "Backend offline" : sub}
                </p>
            </div>
        </div>
    );
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="h-3 w-3 text-success" />;
        case "processing":
            return <Loader2 className="h-3 w-3 text-primary animate-spin" />;
        case "failed":
            return <AlertCircle className="h-3 w-3 text-destructive" />;
        default:
            return <Clock className="h-3 w-3 text-warning" />;
    }
};

export default function DashboardView() {
    const { data: media, isLoading, isError } = useGetMediaQuery({});

    const totalMedia = media?.length ?? 0;
    const totalFaces =
        media?.reduce((acc, m) => acc + (m.detectedPersons?.length ?? 0), 0) ?? 0;
    const processingCount =
        media?.filter((m) => m.status === "processing").length ?? 0;
    const enrolledPersons = media
        ? new Set(
              media.flatMap(
                  (m) =>
                      m.detectedPersons
                          ?.filter((p) => p.identity !== "unknown")
                          .map((p) => p.identity) ?? []
              )
          ).size
        : 0;

    const recentMedia = media?.slice(0, 5) ?? [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    AI-powered face identification and media analysis.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Media"
                    icon={FileVideo}
                    iconColor="text-primary"
                    value={totalMedia}
                    sub="Uploaded files"
                    isLoading={isLoading}
                    isError={isError}
                />
                <StatCard
                    title="Faces Detected"
                    icon={ScanFace}
                    iconColor="text-primary"
                    value={totalFaces}
                    sub="Across all media"
                    isLoading={isLoading}
                    isError={isError}
                />
                <StatCard
                    title="Processing"
                    icon={Activity}
                    iconColor="text-warning"
                    value={processingCount}
                    sub="Active tasks"
                    isLoading={isLoading}
                    isError={isError}
                />
                <StatCard
                    title="Enrolled"
                    icon={Users}
                    iconColor="text-success"
                    value={enrolledPersons}
                    sub="Known persons"
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>

            {/* Main content */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* Recent Media */}
                <div className="lg:col-span-4 rounded-xl border border-border bg-card">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Recent Media
                        </h2>
                    </div>
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                                <AlertCircle className="h-7 w-7 text-destructive" />
                                <p className="text-sm font-semibold">Backend offline</p>
                                <p className="text-xs text-muted-foreground">
                                    Start the Persona Server to see data
                                </p>
                            </div>
                        ) : recentMedia.length > 0 ? (
                            <div className="space-y-1">
                                {recentMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <FileVideo className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {item.fileName}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {getStatusIcon(item.status)}
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 px-3">
                                    <Link
                                        href="/media"
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        View all media →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">No media yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Upload a video, audio, or image to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Activity */}
                <div className="lg:col-span-3 rounded-xl border border-border bg-card">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            AI Activity
                        </h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {isError ? (
                            <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-destructive shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Backend unreachable</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Start the server at localhost:8000
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {isLoading ? "Connecting..." : "System connected"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isLoading
                                                ? "Fetching media list"
                                                : `${totalMedia} files · ${totalFaces} faces detected`}
                                        </p>
                                    </div>
                                </div>
                                {processingCount > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1.5 h-2 w-2 rounded-full bg-warning shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {processingCount} task{processingCount > 1 ? "s" : ""} running
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Check Processing page for details
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-border shrink-0" />
                            <p className="text-xs text-muted-foreground">Waiting for activity...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
