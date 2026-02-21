"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanFace, Upload, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useEnrollPersonMutation } from "@/store/api/personaApi";

export default function EnrollmentPage() {
    const [personId, setPersonId] = useState("");
    const [age, setAge] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [enrollPerson, { isLoading, isSuccess, isError }] = useEnrollPersonMutation();

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const handleEnroll = async () => {
        if (!personId || !age || selectedImages.length === 0) return;
        const formData = new FormData();
        formData.append("person_id", personId);
        formData.append("age", age);
        if (description) formData.append("description", description);
        selectedImages.forEach((img) => formData.append("face_image", img));
        try {
            await enrollPerson(formData).unwrap();
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
                            <div className="flex flex-wrap gap-2">
                                {selectedImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs"
                                    >
                                        <ScanFace className="h-3 w-3 text-primary" />
                                        <span className="truncate max-w-[120px]">{img.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
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
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Enrolled
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold">No persons enrolled</p>
                            <p className="text-xs text-muted-foreground">
                                Enroll your first person to start recognition
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
