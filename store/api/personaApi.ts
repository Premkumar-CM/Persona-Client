import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants";

export interface EnrollResponse {
    status: string;
    message: string;
}

export interface SearchTextResponse {
    media: {
        id: string;
        filename: string;
        status: string;
        progress: number;
        uploaded_at: string;
        task_id: string;
    }[];
}

export interface SearchImageResponse {
    status: string;
    person: string;
    confidence: number;
    media: {
        id: string;
        filename: string;
        status: string;
        uploaded_at: string;
    }[];
}

export interface YouTubeDownloadResponse {
    success: boolean;
    message: string;
    task_id: string;
}

export interface TaskStatusResponse {
    state: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "REVOKED";
    results?: Record<string, unknown>;
}

export interface StopRestartResponse {
    success: boolean;
    message?: string;
    task_id?: string;
}

export const personaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Enrollment
        enrollPerson: builder.mutation<EnrollResponse, FormData>({
            query: (formData) => ({
                url: ENDPOINTS.ENROLLMENT.ENROLL,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Enrollment", id: "LIST" }],
        }),

        // Search by text
        searchMedia: builder.query<SearchTextResponse, string>({
            query: (q) => `${ENDPOINTS.SEARCH.TEXT}?q=${encodeURIComponent(q)}`,
        }),

        // Search by image
        searchByImage: builder.mutation<SearchImageResponse, FormData>({
            query: (formData) => ({
                url: ENDPOINTS.SEARCH.IMAGE,
                method: "POST",
                body: formData,
            }),
        }),

        // YouTube download
        downloadYoutube: builder.mutation<
            YouTubeDownloadResponse,
            { youtube_url: string; video_name: string }
        >({
            query: (body) => ({
                url: ENDPOINTS.YOUTUBE.DOWNLOAD,
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Media", id: "LIST" }],
        }),

        // Task status
        getTaskStatus: builder.query<TaskStatusResponse, string>({
            query: (id) => ENDPOINTS.TASKS.STATUS(id),
            providesTags: (_result, _error, id) => [{ type: "Task", id }],
        }),

        // Stop processing
        stopProcessing: builder.mutation<StopRestartResponse, string>({
            query: (id) => ({
                url: ENDPOINTS.TASKS.STOP(id),
                method: "POST",
            }),
            invalidatesTags: [{ type: "Media", id: "LIST" }],
        }),

        // Restart processing
        restartProcessing: builder.mutation<StopRestartResponse, string>({
            query: (id) => ({
                url: ENDPOINTS.TASKS.RESTART(id),
                method: "POST",
            }),
            invalidatesTags: [{ type: "Media", id: "LIST" }],
        }),
    }),
});

export const {
    useEnrollPersonMutation,
    useSearchMediaQuery,
    useLazySearchMediaQuery,
    useSearchByImageMutation,
    useDownloadYoutubeMutation,
    useGetTaskStatusQuery,
    useStopProcessingMutation,
    useRestartProcessingMutation,
} = personaApi;
