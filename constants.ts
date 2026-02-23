export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ENDPOINTS = {
    MEDIA: {
        GET_ALL: "/api/media/",
        GET_ONE: (id: string) => `/api/media/${id}`,
        GET_TRANSCRIPT: (id: string) => `/api/media/${id}/transcript`,
        GET_FILE: (id: string) => `/api/media/${id}/file`,
        DELETE: (id: string) => `/api/media/${id}`,
        UPLOAD: "/api/upload-media/",
        UPLOAD_AUDIO: "/api/upload-audio/",
        ANNOTATE: (id: string) => `/api/media/${id}/annotate`,
    },
    SEARCH: {
        TEXT: "/api/search-media/",
        IMAGE: "/api/search-by-image/",
    },
    ENROLLMENT: {
        ENROLL: "/api/enroll/",
    },
    YOUTUBE: {
        DOWNLOAD: "/api/download-video",
        DOWNLOAD_PLAYLIST: "/api/download-playlist",
    },
    TASKS: {
        STATUS: (id: string) => `/api/task-status/${id}`,
        STOP: (id: string) => `/api/stop-processing/${id}`,
        RESTART: (id: string) => `/api/restart-processing/${id}`,
    },
};
