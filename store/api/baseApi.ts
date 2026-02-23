import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        // Use empty string — API calls go to /api/* on the same origin,
        // and Next.js rewrites proxy them to the backend.
        baseUrl: "",
        prepareHeaders: (headers) => {
            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Media", "Task", "Settings", "Enrollment"],
    endpoints: () => ({}),
});
