"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Upload,
    FileVideo,
    FileAudio,
    Image,
    Youtube,
    CloudUpload,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useUploadMediaMutation } from "@/store/api/mediaApi";
import { useDownloadYoutubeMutation } from "@/store/api/personaApi";

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoName, setVideoName] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadMedia, { isLoading: isUploading, isSuccess: uploadSuccess, isError: uploadError }] =
        useUploadMediaMutation();
    const [downloadYoutube, { isLoading: isDownloading, isSuccess: downloadSuccess, isError: downloadError }] =
        useDownloadYoutubeMutation();

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
        } catch (err) {
            console.error("YouTube download failed:", err);
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

            <div className="grid gap-6 md:grid-cols-2">
                {/* File Upload */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                        <CloudUpload className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            File Upload
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer ${
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/60 hover:bg-muted/30"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="video/*,audio/*,image/*"
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
                                    <Image className="h-3 w-3" /> Image
                                </span>
                            </div>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Selected ({selectedFiles.length})
                                </p>
                                {selectedFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                                    >
                                        <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate flex-1">{file.name}</span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    </div>
                                ))}
                                <Button onClick={handleUpload} disabled={isUploading} className="w-full">
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

                {/* YouTube Download */}
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
            </div>
        </div>
    );
}
