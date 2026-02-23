"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanFace, Upload, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEnrollPersonMutation, useGetEnrolledPersonsQuery, EnrolledPerson } from "@/store/api/personaApi";

export default function EnrollmentPage() {
    const router = useRouter();
    const [personId, setPersonId] = useState("");
    const [age, setAge] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState<{ file: File; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [enrollPerson, { isLoading, isSuccess, isError }] = useEnrollPersonMutation();
    const { data: enrolledPersons, isLoading: loadingEnrolled, isError: errorEnrolled, refetch } = useGetEnrolledPersonsQuery();

    // Cleanup object URLs to avoid memory leaks
    const imagesRef = useRef(selectedImages);
    useEffect(() => {
        imagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        return () => {
            imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
        };
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setSelectedImages((prev) => [...prev, ...newImages]);
        // Reset input value so the same file can be selected again if needed
        if (e.target) {
            e.target.value = "";
        }
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        // Skip if pasting into an input or textarea
        const target = e.target as HTMLElement;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            return;
        }

        const items = Array.from(e.clipboardData?.items || []);
        const imageFiles: File[] = [];

        items.forEach((item) => {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    // Create a proper filename with timestamp
                    const timestamp = Date.now();
                    const ext = item.type.split('/')[1] || 'png';
                    const renamedFile = new File([file], `pasted-image-${timestamp}.${ext}`, {
                        type: item.type
                    });
                    imageFiles.push(renamedFile);
                }
            }
        });

        if (imageFiles.length > 0) {
            e.preventDefault();
            const newImages = imageFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));
            setSelectedImages((prev) => [...prev, ...newImages]);
        }
    }, []);

    // Attach/detach paste event listener
    useEffect(() => {
        document.addEventListener('paste', handlePaste as EventListener);
        return () => document.removeEventListener('paste', handlePaste as EventListener);
    }, [handlePaste]);

    const handleEnroll = async () => {
        if (!personId || !age || selectedImages.length === 0) return;
        const formData = new FormData();
        formData.append("person_id", personId);
        formData.append("age", age);
        if (description) formData.append("description", description);
        selectedImages.forEach((img) => formData.append("face_image", img.file));
        try {
            await enrollPerson(formData).unwrap();
            refetch();
            setPersonId("");
            setAge("");
            setDescription("");
            setSelectedImages([]);
        } catch (err) {
            console.error("Enrollment failed:", err);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Enrollment</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Enroll new persons into the AI face recognition system.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Enrollment Form */}
                <div className="md:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                        <ScanFace className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Enroll New Person
                        </h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Person ID / Name
                                </label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={personId}
                                    onChange={(e) => setPersonId(e.target.value)}
                                    className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Age
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 30"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Description (optional)
                            </label>
                            <Input
                                placeholder="Brief description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                            />
                        </div>

                        {/* Face Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Face Images
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:border-primary/60 hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                />
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">Upload face images</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Multiple images recommended for accuracy
                                </p>
                            </div>
                        </div>

                        {selectedImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Selected Images ({selectedImages.length})
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedImages([])}
                                        className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {selectedImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted flex flex-col items-center justify-center"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.file.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            {/* Overlay Gradient for readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                <p className="text-[10px] font-medium text-white truncate w-full" title={img.file.name}>{img.file.name}</p>
                                            </div>
                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
                                                    URL.revokeObjectURL(img.url);
                                                }}
                                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 hover:bg-destructive text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                                title="Remove file"
                                            >
                                                <span className="text-xs leading-none">&times;</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={!personId || !age || selectedImages.length === 0 || isLoading}
                            onClick={handleEnroll}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enrolling...
                                </>
                            ) : (
                                <>
                                    <ScanFace className="mr-2 h-4 w-4" />
                                    Enroll Person
                                </>
                            )}
                        </Button>

                        {isSuccess && (
                            <div className="flex items-center gap-2 rounded-lg bg-success/10 text-success px-3 py-2 text-sm">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                Person enrolled successfully! Re-ID task started.
                            </div>
                        )}
                        {isError && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                Enrollment failed. Check the backend.
                            </div>
                        )}
                    </div>
                </div>

                {/* Enrolled Persons */}
                <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-[600px] md:h-auto">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Enrolled Directory
                            </h2>
                        </div>
                        {enrolledPersons && enrolledPersons.length > 0 && (
                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {enrolledPersons.length}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
                        {loadingEnrolled ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 m-auto">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Loading directory...</p>
                            </div>
                        ) : errorEnrolled ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 m-auto">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                                <p className="text-sm font-semibold">Failed to load enrolled persons</p>
                                <p className="text-xs text-muted-foreground">Please check the backend connection</p>
                            </div>
                        ) : enrolledPersons && enrolledPersons.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 content-start pb-4">
                                {enrolledPersons.map((person) => (
                                    <div
                                        key={person.id}
                                        onClick={() => router.push(`/person/${encodeURIComponent(person.name)}`)}
                                        className="group relative rounded-xl border border-border bg-background overflow-hidden hover:border-primary/50 cursor-pointer transition-all hover:shadow-sm"
                                    >
                                        <div className="aspect-square w-full bg-muted relative">
                                            <img
                                                src={person.thumbnail_base64 || ''}
                                                alt={person.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null; // prevent infinite loop
                                                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                                    target.className = "absolute inset-0 w-full h-full object-contain p-4 opacity-50";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col">
                                                <p className="text-sm font-bold text-white truncate drop-shadow-md">
                                                    {person.name}
                                                </p>
                                                <p className="text-[10px] text-white/80 font-medium truncate">
                                                    Age {person.age} {person.description && `• ${person.description}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 m-auto">
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">No persons enrolled</p>
                                <p className="text-xs text-muted-foreground text-balance">
                                    Enroll your first person to start recognition
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
