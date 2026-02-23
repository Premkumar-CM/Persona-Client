import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function backendUnreachable(err: unknown) {
    return NextResponse.json(
        { error: "Backend unreachable", detail: String(err) },
        { status: 503 }
    );
}

async function parseJson(res: Response): Promise<NextResponse> {
    try {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { error: "Invalid response from backend", status: res.status },
            { status: res.status }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/api/${pathStr}${searchParams ? `?${searchParams}` : ""}`;

    try {
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json" },
        });

        // Check if response is a video/audio file (binary stream)
        const contentType = res.headers.get("content-type") || "";
        if (contentType.startsWith("video/") || contentType.startsWith("audio/")) {
            // Stream the binary content directly
            const blob = await res.blob();
            return new NextResponse(blob, {
                status: res.status,
                headers: {
                    "Content-Type": contentType,
                    "Content-Disposition": res.headers.get("content-disposition") || "inline",
                },
            });
        }

        return parseJson(res);
    } catch (err) {
        return backendUnreachable(err);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join("/");
    const url = `${BACKEND_URL}/api/${pathStr}/`;

    const contentType = request.headers.get("content-type") || "";

    try {
        let res: Response;
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            res = await fetch(url, {
                method: "POST",
                body: formData,
            });
        } else {
            const body = await request.text();
            res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });
        }
        return parseJson(res);
    } catch (err) {
        return backendUnreachable(err);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join("/");
    const url = `${BACKEND_URL}/api/${pathStr}/`;

    try {
        const res = await fetch(url, { method: "DELETE" });
        return parseJson(res);
    } catch (err) {
        return backendUnreachable(err);
    }
}
