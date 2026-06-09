import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://backend.glasstronictech.org";

async function handleProxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  const hasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // @ts-expect-error - duplex is required when sending stream body in fetch
      duplex: hasBody ? "half" : undefined,
    });

    const responseBody = await response.text();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Avoid forwarding content-encoding and transfer-encoding to prevent compression/chunking issues
      const k = key.toLowerCase();
      if (k !== "content-encoding" && k !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Dev Proxy error:", error);
    return NextResponse.json({ detail: "Proxy failed" }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
