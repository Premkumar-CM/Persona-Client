"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CloudUpload,
    FileAudio,
    FileVideo,
    Image as ImageIcon, // Alias Image to ImageIcon to avoid conflict with HTML Image element
    Loader2,
    Upload,
    Youtube,
    CheckCircle,
    AlertCircle,
    X, // Added X icon for removing individual files
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react"; // Added useEffect and useCallback
import { useUploadMediaMutation } from "@/store/api/mediaApi";
import { useDownloadYoutubeMutation, useDownloadPlaylistMutation } from "@/store/api/personaApi";

// Define an interface for files with their object URLs
interface SelectedFileWithUrl {
    file: File;
    url: string;
}

export default function UploadPage() {
    const [activeTab, setActiveTab] = useState<"file" | "youtube">("file");
    const [isDragging, setIsDragging] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoName, setVideoName] = useState("");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadMedia, { isLoading: isUploading, isSuccess: uploadSuccess, isError: uploadError }] =
        useUploadMediaMutation();
    const [downloadYoutube, { isLoading: isDownloading, isSuccess: downloadSuccess, isError: downloadError }] =
        useDownloadYoutubeMutation();
    const [downloadPlaylist, {
        isLoading: isPlaylistLoading,
        isSuccess: playlistSuccess,
        isError: playlistError,
        data: playlistData
    }] = useDownloadPlaylistMutation();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) setSelectedFiles(files);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 0) setSelectedFiles(files);
    }, []);

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append("media_file", file);
            formData.append("media_name", file.name);
            try {
                await uploadMedia(formData).unwrap();
            } catch (err) {
                console.error("Upload failed:", JSON.stringify(err));
            }
        }
        setSelectedFiles([]);
    };

    const handleYoutubeDownload = async () => {
        if (!youtubeUrl) return;
        try {
            await downloadYoutube({
                youtube_url: youtubeUrl,
                video_name: videoName || "YouTube Video",
            }).unwrap();
            setYoutubeUrl("");
            setVideoName("");
        } catch (err: any) {
            console.error("YouTube download failed:", {
                error: err,
                status: err?.status,
                data: err?.data,
                message: err?.message,
                stringified: JSON.stringify(err)
            });
        }
    };

    const handlePlaylistDownload = async () => {
        if (!playlistUrl) return;
        try {
            await downloadPlaylist({
                playlist_url: playlistUrl,
            }).unwrap();
            setPlaylistUrl("");
        } catch (err: any) {
            console.error("Playlist download failed:", {
                error: err,
                status: err?.status,
                data: err?.data,
                message: err?.message,
                stringified: JSON.stringify(err)
            });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Upload Media</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload videos, audio, or images for AI analysis.
                </p>
            </div>

            <div className="flex items-center border-b border-border">
                <button
                    onClick={() => setActiveTab("file")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "file"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <CloudUpload className="h-4 w-4" />
                    File Upload
                </button>
                <button
                    onClick={() => setActiveTab("youtube")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "youtube"
                        ? "border-primary text-destructive"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Youtube className="h-4 w-4" />
                    YouTube Download
                </button>
            </div>

            <div className="max-w-3xl">
                {/* File Upload */}
                {activeTab === "file" && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                            <CloudUpload className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Upload Media Files
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer ${isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/60 hover:bg-muted/30"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".mp4,.avi,.mov,.mkv,.webm,.mp3,.wav,.flac,.m4a,.ogg,.aac,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">Drop files here</p>
                                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <FileVideo className="h-3 w-3" /> Video
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <FileAudio className="h-3 w-3" /> Audio
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <ImageIcon className="h-3 w-3" /> Image
                                    </span>
                                </div>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="space-y-4 mt-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Selected files ({selectedFiles.length})
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedFiles([])}
                                            className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                        >
                                            Clear all
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {selectedFiles.map((file, i) => {
                                            const fileUrl = URL.createObjectURL(file);
                                            const isImage = file.type.startsWith("image/");
                                            const isVideo = file.type.startsWith("video/");
                                            const isAudio = file.type.startsWith("audio/");

                                            return (
                                                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted flex flex-col items-center justify-center">
                                                    {/* File Preview */}
                                                    {isImage && (
                                                        <img src={fileUrl} alt={file.name} className="absolute inset-0 h-full w-full object-cover" />
                                                    )}
                                                    {isVideo && (
                                                        <video src={fileUrl} controls className="absolute inset-0 h-full w-full object-cover" />
                                                    )}
                                                    {isAudio && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 p-2 gap-3">
                                                            <FileAudio className="h-10 w-10 text-muted-foreground" />
                                                            <audio src={fileUrl} controls className="w-full h-8" />
                                                        </div>
                                                    )}
                                                    {(!isImage && !isVideo && !isAudio) && (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <FileVideo className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}

                                                    {/* Overlay Gradient for readability */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                        <p className="text-xs font-medium text-white truncate w-full" title={file.name}>{file.name}</p>
                                                        <p className="text-[10px] text-white/70">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedFiles(prev => prev.filter((_, idx) => idx !== i));
                                                        }}
                                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Button onClick={handleUpload} disabled={isUploading} className="w-full mt-4">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="flex items-center gap-2 rounded-lg bg-success/10 text-success px-3 py-2 text-sm">
                                    <CheckCircle className="h-4 w-4 shrink-0" />
                                    Upload successful! Processing started.
                                </div>
                            )}
                            {uploadError && (
                                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    Upload failed. Check if the backend is running.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* YouTube Download */}
                {activeTab === "youtube" && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-destructive" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    YouTube Download
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Paste a YouTube URL to download and analyze the video automatically.
                                </p>
                                <div className="space-y-3">
                                    <Input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Video name (optional)"
                                        value={videoName}
                                        onChange={(e) => setVideoName(e.target.value)}
                                        className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <Button
                                        className="w-full"
                                        disabled={!youtubeUrl || isDownloading}
                                        onClick={handleYoutubeDownload}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Youtube className="mr-2 h-4 w-4" />
                                                Download & Process
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {downloadSuccess && (
                                    <div className="flex items-center gap-2 rounded-lg bg-success/10 text-success px-3 py-2 text-sm">
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                        Download started! Check Processing page.
                                    </div>
                                )}
                                {downloadError && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        Download failed. Check the URL and backend.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* YouTube Playlist Download - Full Width */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden mt-6">
                            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-destructive" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    YouTube Playlist Batch Download
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Download and process an entire YouTube playlist automatically. All videos will be processed sequentially.
                                </p>
                                <div className="flex gap-3">
                                    <Input
                                        type="url"
                                        placeholder="https://www.youtube.com/playlist?list=..."
                                        value={playlistUrl}
                                        onChange={(e) => setPlaylistUrl(e.target.value)}
                                        className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <Button
                                        disabled={!playlistUrl || isPlaylistLoading}
                                        onClick={handlePlaylistDownload}
                                    >
                                        {isPlaylistLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Youtube className="mr-2 h-4 w-4" />
                                                Download Playlist
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {playlistSuccess && playlistData && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 rounded-lg bg-success/10 text-success px-3 py-2 text-sm">
                                            <CheckCircle className="h-4 w-4 shrink-0" />
                                            Playlist processing started! Found {playlistData.videos_found} videos.
                                        </div>
                                        {playlistData.available_videos && playlistData.available_videos.length > 0 && (
                                            <div className="rounded-lg bg-muted p-4">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                                    Videos in playlist ({playlistData.available_videos.length})
                                                </p>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {playlistData.available_videos.map((video, idx) => (
                                                        <div
                                                            key={video.id}
                                                            className="flex items-start gap-2 text-xs p-2 rounded bg-background"
                                                        >
                                                            <span className="text-muted-foreground shrink-0 font-mono">
                                                                {(idx + 1).toString().padStart(2, "0")}.
                                                            </span>
                                                            <span className="flex-1 line-clamp-2">{video.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {playlistError && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        Playlist download failed. Check the URL and backend.
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
