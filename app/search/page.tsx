"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search as SearchIcon,
    ScanFace,
    Upload,
    Loader2,
    FileVideo,
    Play,
} from "lucide-react";
import { useState, useRef } from "react";
import {
    useLazySearchMediaQuery,
    useSearchByImageMutation,
} from "@/store/api/personaApi";
import { VideoPlayerModal } from "@/components/media/VideoPlayerModal";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [playing, setPlaying] = useState<{ id: string; filename: string } | null>(null);

    const [triggerSearch, { data: textResults, isLoading: isSearching, isError: searchError }] =
        useLazySearchMediaQuery();
    const [searchByImage, { data: imageResults, isLoading: isImageSearching, isError: imageSearchError }] =
        useSearchByImageMutation();

    const handleTextSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        triggerSearch(query.trim());
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            await searchByImage(formData).unwrap();
        } catch (err) {
            console.error("Image search failed:", JSON.stringify(err));
        }
    };

    return (
        <>
            {playing && (
                <VideoPlayerModal
                    id={playing.id}
                    filename={playing.filename}
                    onClose={() => setPlaying(null)}
                />
            )}

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Search</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Find media by content or identify a person by their face.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Text Search */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                            <SearchIcon className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Text Search
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Search media by person name, transcript content, or keywords.
                            </p>
                            <form onSubmit={handleTextSearch} className="flex gap-2">
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder='e.g. "John" or "quarterly report"'
                                    className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                                <Button type="submit" disabled={isSearching} size="icon">
                                    {isSearching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <SearchIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>

                            <div className="border-t border-border" />

                            {textResults && textResults.media.length > 0 ? (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        {textResults.media.length} result{textResults.media.length > 1 ? "s" : ""}
                                    </p>
                                    {textResults.media.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 hover:bg-accent transition-colors"
                                        >
                                            <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.filename}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                                            </div>
                                            {item.status !== "failed" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                                                    onClick={() => setPlaying({ id: item.id, filename: item.filename })}
                                                    title="Play video"
                                                >
                                                    <Play className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : textResults ? (
                                <p className="py-4 text-center text-xs text-muted-foreground">No results found</p>
                            ) : (
                                <p className="py-4 text-center text-xs text-muted-foreground">
                                    Enter a search query above
                                </p>
                            )}
                            {searchError && (
                                <p className="text-xs text-destructive">Search failed. Check if the backend is running.</p>
                            )}
                        </div>
                    </div>

                    {/* Face Lookup */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                            <ScanFace className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Face Lookup
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Upload a face image to find which media files contain this person.
                            </p>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:border-primary/60 hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {isImageSearching ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                ) : (
                                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <p className="text-sm font-semibold">
                                    {isImageSearching ? "Analyzing..." : "Upload a face image"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG — Max 10MB</p>
                            </div>

                            {imageResults && (
                                <div className="space-y-2">
                                    <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                                        <p className="text-sm font-semibold text-primary">{imageResults.person}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Confidence: {(imageResults.confidence * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    {imageResults.media?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 hover:bg-accent transition-colors"
                                        >
                                            <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <p className="text-sm font-medium truncate flex-1">{item.filename}</p>
                                            {item.status !== "failed" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                                                    onClick={() => setPlaying({ id: item.id, filename: item.filename })}
                                                    title="Play video"
                                                >
                                                    <Play className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {imageSearchError && (
                                <p className="text-xs text-destructive">Face lookup failed. Check the backend.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
