export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ENDPOINTS = {
    MEDIA: {
        GET_ALL: "/api/media/",
        GET_ONE: (id: string) => `/api/media/${id}`,
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
        DOWNLOAD: "/api/download-youtube/",
    },
    TASKS: {
        STATUS: (id: string) => `/api/task-status/${id}`,
        STOP: (id: string) => `/api/stop-processing/${id}`,
        RESTART: (id: string) => `/api/restart-processing/${id}`,
    },
};
