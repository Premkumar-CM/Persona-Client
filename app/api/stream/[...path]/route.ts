import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Streaming proxy — passes binary responses (video, audio, images)
 * directly from the backend to the client, preserving Content-Type,
 * Content-Length, and range-request headers for seeking support.
 *
 * Auth: video elements can't send custom headers, so the token is
 * accepted via a ?token= query param and forwarded as Bearer auth.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join("/");
    const url = `${BACKEND_URL}/api/${pathStr}`;

    try {
        const upstreamHeaders = new Headers();

        // Range header for video seeking
        const rangeHeader = request.headers.get("range");
        if (rangeHeader) upstreamHeaders.set("range", rangeHeader);

        // Auth — prefer incoming Authorization header, fall back to ?token= query param
        // (video elements can't set custom headers, so token is passed in query string)
        const authHeader = request.headers.get("authorization");
        if (authHeader) {
            upstreamHeaders.set("authorization", authHeader);
        } else {
            const token = request.nextUrl.searchParams.get("token");
            if (token) upstreamHeaders.set("authorization", `Bearer ${token}`);
        }

        const res = await fetch(url, { headers: upstreamHeaders });

        const responseHeaders = new Headers();
        const contentType = res.headers.get("content-type");
        const contentLength = res.headers.get("content-length");
        const contentRange = res.headers.get("content-range");
        const acceptRanges = res.headers.get("accept-ranges");

        if (contentType) responseHeaders.set("content-type", contentType);
        if (contentLength) responseHeaders.set("content-length", contentLength);
        if (contentRange) responseHeaders.set("content-range", contentRange);
        if (acceptRanges) responseHeaders.set("accept-ranges", acceptRanges);

        return new NextResponse(res.body, {
            status: res.status,
            headers: responseHeaders,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Backend unreachable", detail: String(err) },
            { status: 503 }
        );
    }
}
