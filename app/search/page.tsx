"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Image,
    FileText,
    Upload,
    Loader2,
    AlertCircle,
    FileVideo,
    Clock,
    Play
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useLazySearchMediaQuery, useSearchByImageMutation } from "@/store/api/personaApi";
import { useRouter } from "next/navigation";

type TabType = "text" | "image";

export default function SearchPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("text");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchMedia, { data: textSearchResults, isLoading: isTextSearching, isError: textSearchError, reset: resetTextSearch }] =
        useLazySearchMediaQuery();

    const [searchByImage, { data: imageSearchResults, isLoading: isImageSearching, isError: imageSearchError, reset: resetImageSearch }] =
        useSearchByImageMutation();

    // Reset search state when component unmounts (navigating away)
    useEffect(() => {
        return () => {
            setSearchQuery("");
            setSelectedImage(null);
            setImagePreview(null);
            resetTextSearch();
            resetImageSearch();
        };
    }, [resetTextSearch, resetImageSearch]);

    const handleTextSearch = async () => {
        if (!searchQuery.trim()) return;
        await searchMedia(searchQuery);
    };

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleImageSearch = async () => {
        if (!selectedImage) return;
        const formData = new FormData();
        formData.append("file", selectedImage);
        await searchByImage(formData);
    };

    const clearImageSearch = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatTimestamp = (seconds: number) => {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Search Media</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Search by video name, person name, transcript, or face image.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-border">
                <button
                    onClick={() => setActiveTab("text")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "text"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Search className="h-4 w-4" />
                    Video Name, Person & Transcript
                </button>
                <button
                    onClick={() => setActiveTab("image")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "image"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Image className="h-4 w-4" />
                    Image Search
                </button>
            </div>

            {/* Tab Content */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Text Search Tab */}
                {activeTab === "text" && (
                    <div className="p-6 space-y-6">
                        <div className="max-w-2xl mx-auto w-full space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Search Everything
                            </h2>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter video name, person name, or transcript keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleTextSearch()}
                                    className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                                <Button onClick={handleTextSearch} disabled={isTextSearching || !searchQuery.trim()}>
                                    {isTextSearching ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Search
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Results */}
                        {textSearchError && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-3">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm">Search failed. Please try again.</p>
                            </div>
                        )}

                        {textSearchResults && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Found {textSearchResults.media.length} result{textSearchResults.media.length !== 1 ? "s" : ""}
                                </p>
                                {textSearchResults.media.length > 0 ? (
                                    <div className="space-y-4">
                                        {textSearchResults.media.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-border bg-background overflow-hidden hover:border-primary/50 transition-colors"
                                            >
                                                <div
                                                    className="flex items-center gap-4 px-4 py-3 bg-muted/20 cursor-pointer"
                                                    onClick={() => router.push(`/media/${item.id}`)}
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                                                        <FileVideo className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.filename}</p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(item.uploaded_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                • {item.status}
                                                            </span>
                                                            {item.matching_segments && item.matching_segments.length > 0 && (
                                                                <span className="text-xs text-primary font-medium">
                                                                    • {item.matching_segments.length} transcript match{item.matching_segments.length !== 1 ? 'es' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="shrink-0 bg-primary/5 text-primary">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Transcript Matches if present */}
                                                {item.matching_segments && item.matching_segments.length > 0 && (
                                                    <div className="p-4 space-y-2 max-h-64 overflow-y-auto border-t border-border/50 bg-background">
                                                        {item.matching_segments.map((segment, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
                                                                onClick={() => router.push(`/media/${item.id}?t=${segment.start}&tab=transcript`)}
                                                            >
                                                                <div className="text-xs text-primary font-mono mb-1.5">
                                                                    {formatTimestamp(segment.start)} → {formatTimestamp(segment.end)}
                                                                </div>
                                                                <p className="text-sm text-foreground leading-relaxed">
                                                                    {segment.text}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm font-semibold">No results found</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Try searching with different keywords
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Image Search Tab */}
                {activeTab === "image" && (
                    <div className="p-6 space-y-6">
                        <div className="max-w-2xl mx-auto w-full space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Search by Face Image
                            </h2>
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageSelect}
                                    />
                                    {imagePreview ? (
                                        <div className="space-y-4">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded-lg"
                                            />
                                            <p className="text-sm text-muted-foreground">{selectedImage?.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto">
                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-semibold">Upload face image</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Click to browse or drag and drop
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleImageSearch}
                                        disabled={!selectedImage || isImageSearching}
                                        className="flex-1"
                                    >
                                        {isImageSearching ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Search
                                            </>
                                        )}
                                    </Button>
                                    {selectedImage && (
                                        <Button variant="outline" onClick={clearImageSearch}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        {imageSearchError && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-3">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm">Image search failed. Please try again.</p>
                            </div>
                        )}

                        {imageSearchResults && (
                            <div className="space-y-3">
                                {imageSearchResults.status === "success" ? (
                                    <>
                                        <div className="rounded-lg bg-success/10 text-success px-4 py-3">
                                            <p className="text-sm font-semibold">Match Found!</p>
                                            <p className="text-xs mt-1">
                                                Person: {imageSearchResults.person} • Confidence: {(imageSearchResults.confidence * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Found {imageSearchResults.media.length} video{imageSearchResults.media.length !== 1 ? "s" : ""}
                                        </p>
                                        <div className="space-y-2">
                                            {imageSearchResults.media.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 rounded-lg px-4 py-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/media/${item.id}`)}
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                                                        <FileVideo className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.filename}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(item.uploaded_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                • {item.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="shrink-0">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm font-semibold">No match found</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {imageSearchResults.message || "Face not recognized in any video"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
}
