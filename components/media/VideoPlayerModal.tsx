"use client";

import { FileVideo, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constants";
import { useState } from "react";

interface VideoPlayerModalProps {
    id: string;
    filename: string;
    onClose: () => void;
}

export function VideoPlayerModal({ id, filename, onClose }: VideoPlayerModalProps) {
    const [videoError, setVideoError] = useState(false);

    // Attach auth token as query param — video elements can't send Authorization headers
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const streamSrc = token
        ? `/api/stream/media/${id}/annotate?token=${encodeURIComponent(token)}`
        : `/api/stream/media/${id}/annotate`;

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const mediaError = (e.target as HTMLVideoElement).error;
        console.error("Video playback error:", mediaError?.code, mediaError?.message);
        setVideoError(true);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl rounded-xl border border-border bg-card overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileVideo className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-semibold truncate">{filename}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Video */}
                <div className="bg-black">
                    {videoError ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <p className="text-sm font-semibold text-white">Video not available</p>
                            <p className="text-xs text-white/50 max-w-sm">
                                The annotated stream is not ready. This file may still be processing — check back once it&apos;s completed.
                            </p>
                        </div>
                    ) : (
                        <video
                            src={streamSrc}
                            controls
                            autoPlay
                            className="w-full max-h-[70vh]"
                            onError={handleError}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border flex items-center justify-end">
                    <a
                        href={`${API_BASE_URL}/api/media/${id}/annotate`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        Open in new tab ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
