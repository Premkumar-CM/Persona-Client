"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FolderKanban,
    Search,
    FileVideo,
    Trash2,
    Loader2,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    Pause,
    PauseCircle,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetMediaQuery, useDeleteMediaMutation } from "@/store/api/mediaApi";
import { useStopProcessingMutation, useRestartProcessingMutation } from "@/store/api/personaApi";
import { API_BASE_URL } from "@/constants";

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="h-4 w-4 text-success" />;
        case "processing":
            return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
        case "stopped":
            return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
        case "failed":
            return <AlertCircle className="h-4 w-4 text-destructive" />;
        default:
            return <Clock className="h-4 w-4 text-warning" />;
    }
};


export default function MediaPage() {
    const router = useRouter();
    // Poll every 3 seconds if any item is processing/pending
    const [pollingInterval, setPollingInterval] = useState<number | undefined>(undefined);

    const { data: media, isLoading, isError, refetch } = useGetMediaQuery({}, {
        pollingInterval
    });

    // Dynamically adjust polling based on data
    if (media) {
        const hasProcessing = media.some(m => m.status === "processing" || m.status === "pending");
        if (hasProcessing && pollingInterval === undefined) {
            setPollingInterval(3000);
        } else if (!hasProcessing && pollingInterval !== undefined) {
            setPollingInterval(undefined);
        }
    }
    const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();
    const [stopProcessing, { isLoading: isPausing }] = useStopProcessingMutation();
    const [restartProcessing, { isLoading: isResuming }] = useRestartProcessingMutation();

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this media file?")) return;
        try {
            await deleteMedia(id).unwrap();
        } catch (err) {
            console.error("Delete failed:", JSON.stringify(err));
        }
    };

    const handlePause = async (id: string) => {
        try {
            await stopProcessing(id).unwrap();
        } catch (err) {
            console.error("Pause failed:", err);
        }
    };

    const handleResume = async (id: string) => {
        try {
            await restartProcessing(id).unwrap();
        } catch (err) {
            console.error("Resume failed:", err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Media Library</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse and manage all uploaded media files.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/upload">Upload New</Link>
                </Button>
            </div>

            {/* Search & Refresh */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or person..."
                        className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        All Media
                    </h2>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading media...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                            <AlertCircle className="h-7 w-7 text-destructive" />
                            <p className="text-sm font-semibold">Failed to load media</p>
                            <p className="text-xs text-muted-foreground">
                                Backend not running at{" "}
                                <code className="bg-muted px-1 py-0.5 rounded text-xs">{API_BASE_URL}</code>
                            </p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : media && media.length > 0 ? (
                        <div className="space-y-1">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-accent transition-colors cursor-pointer"
                                    onClick={() => {
                                        router.push(`/media/${item.id}`);
                                    }}
                                >
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <FileVideo className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.fileName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {getStatusIcon(item.status)}
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {item.status}
                                            </span>
                                            {item.progress > 0 && item.progress < 100 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.progress}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {(item.status === "processing" || item.status === "pending") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-warning"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePause(item.id);
                                                }}
                                                disabled={isPausing}
                                                title="Pause processing"
                                            >
                                                <Pause className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {(item.status === "stopped" || item.status === "failed") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResume(item.id);
                                                }}
                                                disabled={isResuming}
                                                title="Resume processing"
                                            >
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {(item.status === "completed" || item.status === "ready") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/media/${item.id}`);
                                                }}
                                                title="Play video"
                                            >
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            disabled={isDeleting}
                                            title="Delete media"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                                <FolderKanban className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold">No media files found</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Upload videos, audio files, or images to start AI face detection.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
