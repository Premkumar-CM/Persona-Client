import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants";

// Types
export interface DetectedPersonTimestamp {
    startTime: number;
    endTime: number;
    detected_personId: string;
    id: string;
}

export interface DetectedPerson {
    identity: string;
    confidence: number;
    face_thumbnailPath: string;
    thumbnail_base64?: string;
    id: string;
    timestamps: DetectedPersonTimestamp[];
}

export interface Transcript {
    fullText: string;
    id: string;
    createdAt: string;
}

export interface MediaFile {
    fileName: string;
    status: "pending" | "processing" | "completed" | "failed" | "stopped" | "ready";
    progress: number;
    filePath?: string;
    videoPath?: string;
    id: string;
    taskId: string;
    annotated_videoPath?: string;
    uploadedAt: string;
    updatedAt: string;
    transcript?: Transcript;
    detectedPersons?: DetectedPerson[];
}

export interface UploadResponse {
    success: boolean;
    media_file_id: string;
    task_id: string;
    message?: string;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

export interface AnnotateResponse {
    success: boolean;
    annotated_video_path: string;
}

export interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

export interface TranscriptResponse {
    transcript: string;
    transcript_segments: TranscriptSegment[];
}

export interface ThumbnailPerson {
    identity: string;
    thumbnail_id: string;
    thumbnail_base64: string;
    total_detections: number;
}

export const mediaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET all media
        getMedia: builder.query<MediaFile[], { skip?: number; limit?: number }>({
            query: ({ skip = 0, limit = 100 } = {}) =>
                `${ENDPOINTS.MEDIA.GET_ALL}?skip=${skip}&limit=${limit}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Media" as const, id })),
                        { type: "Media", id: "LIST" },
                    ]
                    : [{ type: "Media", id: "LIST" }],
        }),

        // GET single media
        getMediaById: builder.query<MediaFile, string>({
            query: (id) => ENDPOINTS.MEDIA.GET_ONE(id),
            providesTags: (_result, _error, id) => [{ type: "Media", id }],
        }),

        // POST upload media (file)
        uploadMedia: builder.mutation<UploadResponse, FormData>({
            query: (formData) => ({
                url: ENDPOINTS.MEDIA.UPLOAD,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Media", id: "LIST" }],
        }),

        // POST upload audio
        uploadAudio: builder.mutation<UploadResponse, FormData>({
            query: (formData) => ({
                url: ENDPOINTS.MEDIA.UPLOAD_AUDIO,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Media", id: "LIST" }],
        }),

        // DELETE media
        deleteMedia: builder.mutation<DeleteResponse, string>({
            query: (id) => ({
                url: ENDPOINTS.MEDIA.DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Media", id },
                { type: "Media", id: "LIST" },
            ],
        }),

        // GET annotated video
        annotateMedia: builder.mutation<AnnotateResponse, string>({
            query: (id) => ({
                url: ENDPOINTS.MEDIA.ANNOTATE(id),
                method: "GET",
            }),
        }),

        // GET transcript with segments
        getTranscript: builder.query<TranscriptResponse, string>({
            query: (id) => ENDPOINTS.MEDIA.GET_TRANSCRIPT(id),
            providesTags: (_result, _error, id) => [{ type: "Media", id }],
        }),

        // GET original media file (stream)
        getMediaFile: builder.query<Blob, string>({
            query: (id) => ({
                url: ENDPOINTS.MEDIA.GET_FILE(id),
                responseHandler: (response) => response.blob(),
            }),
            providesTags: (_result, _error, id) => [{ type: "Media", id }],
        }),

        // GET media clip (stream)
        getMediaClip: builder.query<Blob, { id: string; start: number; end: number }>({
            query: ({ id, start, end }) => ({
                url: `${ENDPOINTS.MEDIA.GET_CLIP(id)}?start=${start}&end=${end}`,
                responseHandler: (response) => response.blob(),
            }),
        }),

        // GET unique identities with thumbnails
        getThumbnailList: builder.query<ThumbnailPerson[], void>({
            query: () => ENDPOINTS.MEDIA.THUMBNAIL_LIST,
        }),
    }),
});

export const {
    useGetMediaQuery,
    useGetMediaByIdQuery,
    useUploadMediaMutation,
    useUploadAudioMutation,
    useDeleteMediaMutation,
    useAnnotateMediaMutation,
    useGetTranscriptQuery,
    useGetMediaFileQuery,
    useGetMediaClipQuery,
    useGetThumbnailListQuery,
} = mediaApi;
