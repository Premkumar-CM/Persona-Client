"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    FileVideo,
    MessageSquareText,
    AlertCircle,
    Loader2,
    Video,
    CheckCircle
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGetMediaByIdQuery, useGetTranscriptQuery } from "@/store/api/mediaApi";

export default function MediaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const initialTab = searchParams.get("tab") as "annotated" | "transcript" | null;
    const initialTime = searchParams.get("t");

    const [activeTab, setActiveTab] = useState<"annotated" | "transcript">(initialTab || "annotated");
    const [videoError, setVideoError] = useState(false);
    const [currentTime, setCurrentTime] = useState(initialTime ? parseFloat(initialTime) : 0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const pendingSeekTime = useRef<number | null>(initialTime ? parseFloat(initialTime) : null);

    // Poll every 3 seconds if the media item is processing/pending
    const [pollingInterval, setPollingInterval] = useState<number | undefined>(undefined);

    // Fetch basic details
    const { data: media, isLoading: mediaLoading } = useGetMediaByIdQuery(id, {
        pollingInterval
    });

    const isAudio = useMemo(() => {
        if (!media?.fileName) return false;
        const ext = media.fileName.split('.').pop()?.toLowerCase();
        return ext ? ['mp3', 'wav', 'm4a', 'flac', 'aac'].includes(ext) : false;
    }, [media?.fileName]);

    // Sync activeTab when isAudio is determined
    useEffect(() => {
        if (isAudio && !initialTab && activeTab === "annotated") {
            setActiveTab("transcript");
        }
    }, [isAudio, initialTab, activeTab]);

    // Fetch transcript data
    const { data: transcript, isLoading: transcriptLoading, isError: transcriptError } =
        useGetTranscriptQuery(id, {
            pollingInterval
        });

    // Dynamically adjust polling based on data
    if (media) {
        const isProcessing = media.status === "processing" || media.status === "pending";
        if (isProcessing && pollingInterval === undefined) {
            setPollingInterval(10000); // Poll every 10 seconds
        } else if (!isProcessing && pollingInterval !== undefined) {
            setPollingInterval(undefined);
        }
    }

    useEffect(() => {
        const handleTimeUpdate = (e: Event) => {
            setCurrentTime((e.target as HTMLVideoElement).currentTime);
        };

        const annotatedVideo = videoRef.current;
        const originalVideo = originalVideoRef.current;

        if (annotatedVideo) {
            annotatedVideo.addEventListener('timeupdate', handleTimeUpdate);
        }
        if (originalVideo) {
            originalVideo.addEventListener('timeupdate', handleTimeUpdate);
        }

        return () => {
            if (annotatedVideo) {
                annotatedVideo.removeEventListener('timeupdate', handleTimeUpdate);
            }
            if (originalVideo) {
                originalVideo.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, [activeTab]);

    // Auto-scroll to active transcript segment
    useEffect(() => {
        if (!transcript?.transcript_segments || !transcriptContainerRef.current || activeTab !== "transcript") return;

        // Small timeout ensures the DOM has fully rendered the transcript lines
        // especially during the initial deep-linked load
        const timer = setTimeout(() => {
            if (!transcriptContainerRef.current) return;

            const activeIndex = transcript.transcript_segments.findIndex(
                seg => currentTime >= seg.start && currentTime <= seg.end
            );

            if (activeIndex !== -1) {
                const container = transcriptContainerRef.current;
                // The scrollable div has a child div wrapping the buttons
                const wrapper = container.children[0];
                if (wrapper && wrapper.children.length > activeIndex) {
                    const activeElement = wrapper.children[activeIndex] as HTMLElement;
                    if (activeElement) {
                        const containerRect = container.getBoundingClientRect();
                        const elementRect = activeElement.getBoundingClientRect();
                        const isVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;

                        if (!isVisible) {
                            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentTime, transcript, activeTab]);

    useEffect(() => {
        if (activeTab === "annotated") {
            setVideoError(false);
        }
    }, [activeTab]);

    const handleSeekToFace = (face: any) => {
        if (face.identity) {
            router.push(`/person/${encodeURIComponent(face.identity)}`);
        }
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const streamSrc = token
        ? `/api/stream/media/${id}/annotate?token=${encodeURIComponent(token)}`
        : `/api/stream/media/${id}/annotate`;
    const originalSrc = token
        ? `/api/stream/media/${id}/file?token=${encodeURIComponent(token)}`
        : `/api/stream/media/${id}/file`;

    const handleError = (e: React.SyntheticEvent<HTMLMediaElement>) => {
        const mediaError = (e.target as HTMLMediaElement).error;
        console.error("Media playback error:", mediaError?.code, mediaError?.message);
        setVideoError(true);
    };

    const seekToTime = (time: number) => {
        pendingSeekTime.current = time;
        if (activeTab !== "transcript") {
            setActiveTab("transcript");
        } else {
            // Already on transcript tab, seek immediately
            const video = originalVideoRef.current;
            if (video) {
                video.currentTime = time;
                pendingSeekTime.current = null;
            }
        }
    };

    const handleVideoLoadedMetadata = () => {
        // When video metadata loads, check if there's a pending seek
        const video = originalVideoRef.current;
        const time = pendingSeekTime.current;

        if (video && time !== null) {
            video.currentTime = time;
            pendingSeekTime.current = null;
        }
    };

    // Check for pending seek when switching to transcript tab
    // This handles the case where video metadata is already loaded
    useEffect(() => {
        if (activeTab === "transcript" && pendingSeekTime.current !== null) {
            // Small delay to ensure video element ref is populated
            const timer = setTimeout(() => {
                const video = originalVideoRef.current;
                const timeStr = pendingSeekTime.current;
                if (video && timeStr !== null) {
                    // If video metadata is already loaded, seek immediately
                    if (video.readyState >= 1) {
                        video.currentTime = timeStr as number;
                        pendingSeekTime.current = null;
                    }
                    // Otherwise, onLoadedMetadata will handle it
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    // Get active transcript segment for live captions
    const activeTranscriptSegment = useMemo(() => {
        if (!transcript?.transcript_segments) return null;
        return transcript.transcript_segments.find(
            seg => currentTime >= seg.start && currentTime <= seg.end
        );
    }, [transcript, currentTime]);

    if (mediaLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading media details...</p>
            </div>
        );
    }

    if (!media) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-lg font-bold">Media Not Found</p>
            </div>
        );
    }

    // Process faces
    const knownFaces: any[] = [];
    const unknownFaces: any[] = [];
    if (media.detectedPersons && media.detectedPersons.length > 0) {
        media.detectedPersons.forEach(person => {
            if (person.identity.toLowerCase().startsWith("unknown")) {
                unknownFaces.push(person);
            } else {
                knownFaces.push(person);
            }
        });
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] max-w-[1400px] mx-auto w-full gap-3">
            {/* Header - Compact */}
            <div className="flex items-center gap-3 shrink-0">
                <div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                        <FileVideo className="h-5 w-5 text-primary" />
                        {media.fileName}
                    </h1>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>Status:</span>
                        {(media.status === "ready" || media.status === "completed") ? (
                            <span className="font-semibold text-success flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Ready
                            </span>
                        ) : (
                            <span className="font-semibold text-foreground capitalize">{media.status}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-border shrink-0">
                {!isAudio && (
                    <button
                        onClick={() => setActiveTab("annotated")}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "annotated"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Video className="h-4 w-4" />
                        Annotated Video
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("transcript")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "transcript"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <MessageSquareText className="h-4 w-4" />
                    Transcript
                </button>
            </div>

            {/* Tab Content - Flexible Area */}
            <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex min-h-0">

                {/* Annotated Video Tab */}
                {activeTab === "annotated" && (
                    <div className="flex w-full h-full flex-col lg:flex-row">
                        {/* Video Area (Left) */}
                        <div className="flex-1 bg-black flex flex-col min-h-0 relative">
                            {videoError ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                                    <AlertCircle className="h-10 w-10 text-destructive" />
                                    <p className="text-base font-semibold text-white">Video not available</p>
                                    <p className="text-xs text-white/50 max-w-sm">
                                        The annotated stream is not ready. This file may still be processing — check back
                                        once it&apos;s completed.
                                    </p>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        src={streamSrc}
                                        controls
                                        className="w-full h-full object-contain"
                                        onError={handleError}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                        </div>

                        {/* Faces Sidebar (Right) */}
                        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-muted/20 flex flex-col min-h-0 shrink-0">
                            <div className="px-4 py-3 border-b border-border bg-card">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Detected Faces
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Known Faces */}
                                <div>
                                    <h4 className="text-xs font-semibold mb-3 text-foreground border-b border-border/50 pb-1">Known ({knownFaces.length})</h4>
                                    {knownFaces.length > 0 ? (
                                        <div className="space-y-2">
                                            {knownFaces.map((face) => (
                                                <div
                                                    key={face.id}
                                                    className="flex items-center gap-3 bg-background border border-border rounded-lg p-2.5 hover:border-primary/50 transition-colors cursor-pointer"
                                                    onClick={() => handleSeekToFace(face)}
                                                >
                                                    <div className="h-9 w-9 rounded overflow-hidden shrink-0 bg-muted">
                                                        {face.thumbnail_base64 ? (
                                                            <img
                                                                src={face.thumbnail_base64}
                                                                alt={face.identity}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">?</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13px] font-semibold truncate text-foreground">{face.identity}</p>
                                                        <p className="text-[11px] text-muted-foreground">Appears {face.timestamps?.length || 0} times</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground">No known faces detected.</p>
                                    )}
                                </div>

                                {/* Unknown Faces */}
                                <div>
                                    <h4 className="text-xs font-semibold mb-3 text-foreground border-b border-border/50 pb-1">Unknown ({unknownFaces.length})</h4>
                                    {unknownFaces.length > 0 ? (
                                        <div className="space-y-2">
                                            {unknownFaces.map((face) => (
                                                <div
                                                    key={face.id}
                                                    className="flex items-center gap-3 bg-background border border-border rounded-lg p-2.5 hover:border-primary/50 transition-colors cursor-pointer"
                                                    onClick={() => handleSeekToFace(face)}
                                                >
                                                    <div className="h-9 w-9 rounded overflow-hidden shrink-0 bg-muted">
                                                        {face.thumbnail_base64 ? (
                                                            <img
                                                                src={face.thumbnail_base64}
                                                                alt={face.identity}
                                                                className="h-full w-full object-cover grayscale opacity-80"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">?</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13px] font-medium truncate text-muted-foreground">{face.identity}</p>
                                                        <p className="text-[11px] text-muted-foreground">Appears {face.timestamps?.length || 0} times</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground">No unknown faces detected.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transcript Tab */}
                {activeTab === "transcript" && (
                    <div className="flex w-full h-full flex-col lg:flex-row">
                        {/* Original Video Area (Left) */}
                        <div className={`flex-1 ${isAudio ? "bg-muted/5" : "bg-black"} flex flex-col min-h-0 relative`}>
                            <div className="absolute inset-0 flex items-center justify-center p-8 bg-muted/10">
                                {isAudio ? (
                                    <div className="w-full max-w-2xl px-6">
                                        <audio
                                            ref={originalVideoRef as unknown as React.RefObject<HTMLAudioElement>}
                                            src={originalSrc}
                                            controls
                                            className="w-full"
                                            onLoadedMetadata={handleVideoLoadedMetadata}
                                        />
                                    </div>
                                ) : (
                                    <video
                                        ref={originalVideoRef}
                                        src={originalSrc}
                                        controls
                                        className="w-full h-full object-contain"
                                        onLoadedMetadata={handleVideoLoadedMetadata}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {/* Live Caption Overlay */}
                            {activeTranscriptSegment && (
                                <div className={`absolute ${isAudio ? "bottom-8" : "bottom-16"} left-0 right-0 flex justify-center pointer-events-none px-8 md:px-16 z-10 break-words`}>
                                    <div className="bg-black/60 text-white px-4 py-2 rounded font-medium text-sm md:text-[15px] leading-snug text-center shadow-lg backdrop-blur-sm border border-white/10" style={{ textShadow: "1px 1px 2px black" }}>
                                        {activeTranscriptSegment.text}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transcript Segments Sidebar (Right) */}
                        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-muted/20 flex flex-col min-h-0 shrink-0">
                            <div className="px-4 py-3 border-b border-border bg-card">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Transcript
                                </h3>
                            </div>
                            <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-3">
                                {transcriptLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading transcript...</p>
                                    </div>
                                ) : transcriptError ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                        <p className="text-sm font-semibold">Transcript not available</p>
                                        <p className="text-xs text-muted-foreground">The transcription might still be processing.</p>
                                    </div>
                                ) : transcript?.transcript_segments && transcript.transcript_segments.length > 0 ? (
                                    <div className="space-y-2">
                                        {transcript.transcript_segments.map((segment, idx) => {
                                            const isActive = currentTime >= segment.start && currentTime <= segment.end;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => seekToTime(segment.start)}
                                                    className={`w-full text-left rounded-lg p-3 border transition-all ${isActive
                                                        ? "bg-primary/10 border-primary shadow-sm"
                                                        : "bg-background border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="text-xs text-primary font-mono mb-2 flex items-center gap-2">
                                                        <span>{new Date(segment.start * 1000).toISOString().substr(11, 8)}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span>{new Date(segment.end * 1000).toISOString().substr(11, 8)}</span>
                                                    </div>
                                                    <div className={`text-sm leading-relaxed ${isActive ? "text-foreground font-medium" : "text-muted-foreground"
                                                        }`}>
                                                        {segment.text}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                                            <MessageSquareText className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-semibold">No transcript segments found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
