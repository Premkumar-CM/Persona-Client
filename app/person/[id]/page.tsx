"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSearchMediaQuery, useGetEnrolledPersonsQuery } from "@/store/api/personaApi";
import { ArrowLeft, User, Video, Calendar, AlignLeft, AlertCircle, Loader2 } from "lucide-react";

export default function PersonProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = decodeURIComponent(params.id as string);

    const { data: enrolledPersons, isLoading: loadingEnrolled } = useGetEnrolledPersonsQuery();
    const { data: searchResults, isLoading: searchLoading, isError: searchError } = useSearchMediaQuery(id);

    // Try to find the person's exact details if they are formally enrolled
    const personDetails = enrolledPersons?.find(p => p.name === id);

    const isLoading = loadingEnrolled || searchLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] w-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-[1400px] mx-auto w-full gap-6 pb-8">
            {/* Header section with back button */}
            <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        Person Profile
                    </h1>
                </div>
            </div>

            {/* Profile Hero section */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="relative h-32 md:h-40 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent">
                    {/* Abstract background graphics could go here */}
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row gap-6 relative -mt-16 sm:-mt-20 z-10">
                        {/* Profile Image (Enrolled vs Thumbnail) */}
                        <div className="shrink-0">
                            {personDetails ? (
                                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-xl border-4 border-card bg-muted overflow-hidden shadow-lg relative">
                                    <img
                                        src={personDetails.thumbnail_base64 || ''}
                                        alt={id}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                            (e.target as HTMLImageElement).className = "h-full w-full object-contain p-6 opacity-30";
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                        ENROLLED
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-xl border-4 border-card bg-muted overflow-hidden shadow-lg relative flex items-center justify-center">
                                    <User className="h-16 w-16 text-muted-foreground/30" />
                                    <div className="absolute top-2 right-2 bg-muted-foreground/20 text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                        DETECTED
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 flex flex-col justify-end pt-2 sm:pt-0">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{id}</h2>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                                {personDetails && (
                                    <>
                                        {personDetails.age && (
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                                                Age: {personDetails.age}
                                            </span>
                                        )}
                                        {personDetails.description && (
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <AlignLeft className="h-4 w-4 shrink-0 text-primary" />
                                                {personDetails.description}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Appearances */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Media Appearances</h3>
                    {searchResults?.media && searchResults.media.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                            {searchResults.media.length} videos
                        </span>
                    )}
                </div>

                {searchError ? (
                    <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center gap-3">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div>
                            <p className="text-base font-bold">Failed to load associated media</p>
                            <p className="text-sm text-muted-foreground mt-1">There was a problem querying the backend database.</p>
                        </div>
                    </div>
                ) : searchResults?.media && searchResults.media.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.media.map(media => (
                            <div
                                key={media.id}
                                onClick={() => router.push(`/media/${media.id}`)}
                                className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
                            >
                                <div className="aspect-video bg-black relative flex items-center justify-center shrink-0">
                                    {media.status === 'ready' || media.status === 'completed' ? (
                                        <>
                                            <video
                                                src={`/api/media/${media.id}/file`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </>
                                    ) : (
                                        <div className="text-muted-foreground/30 flex flex-col items-center justify-center gap-2">
                                            <Video className="h-8 w-8" />
                                            <span className="text-xs font-medium uppercase tracking-widest">{media.status}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col gap-1 min-h-0">
                                    <h4 className="font-bold text-sm truncate" title={media.filename}>{media.filename}</h4>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <span>{new Date(media.uploaded_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-1">
                            <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base font-bold">No exact media matches found</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-balance">
                                This person may be enrolled without having appeared in any successfully processed videos yet.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
