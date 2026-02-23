"use client";

import { Activity, CheckCircle, Clock, XCircle, FileVideo, Loader2, Play, Pause, Trash2 } from "lucide-react";
import { useGetMediaQuery, useDeleteMediaMutation } from "@/store/api/mediaApi";
import { useStopProcessingMutation, useRestartProcessingMutation } from "@/store/api/personaApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProcessingPage() {
    const router = useRouter();

    // We can use polling here too so it updates dynamically
    const { data: media, isLoading, isError } = useGetMediaQuery({}, { pollingInterval: 3000 });

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

    const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
    };

    const activeTasks: any[] = [];

    if (media) {
        media.forEach(item => {
            if (item.status === "pending") stats.pending++;
            else if (item.status === "processing") {
                stats.processing++;
                activeTasks.push(item);
            }
            else if (item.status === "completed" || item.status === "ready") stats.completed++;
            else if (item.status === "failed" || item.status === "stopped") stats.failed++;

            // Pending items also go into active queue visually
            if (item.status === "pending") {
                activeTasks.push(item);
            }
        });
    }

    const statCards = [
        { label: "Pending", icon: Clock, iconColor: "text-warning", bg: "bg-warning/10", value: stats.pending },
        { label: "In Progress", icon: Activity, iconColor: "text-primary", bg: "bg-primary/10", value: stats.processing },
        { label: "Completed", icon: CheckCircle, iconColor: "text-success", bg: "bg-success/10", value: stats.completed },
        { label: "Failed", icon: XCircle, iconColor: "text-destructive", bg: "bg-destructive/10", value: stats.failed },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Processing</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Monitor background tasks — transcription, face detection, and recognition.
                </p>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, icon: Icon, iconColor, bg, value }) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-black tabular-nums leading-none">
                                {isLoading ? "-" : value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Task Queue
                    </h2>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            <p className="text-sm font-semibold">Loading tasks...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                            <p className="text-sm font-semibold">Failed to load tasks</p>
                        </div>
                    ) : activeTasks.length > 0 ? (
                        <div className="space-y-1">
                            {activeTasks.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-lg px-3 py-3 border border-transparent bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.push(`/media/${item.id}`)}
                                >
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        {item.status === "processing" ? (
                                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-warning" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.fileName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
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
                                <Activity className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold">No active tasks</p>
                            <p className="text-xs text-muted-foreground">
                                Upload media to trigger processing pipelines
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
