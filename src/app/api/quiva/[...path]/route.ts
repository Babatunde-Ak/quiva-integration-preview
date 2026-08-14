import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE =
  process.env.QUIVA_BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "https://quiva-marketplace-backend.onrender.com/api";

// Keep the proxy constrained to API groups used by this frontend. This includes
// the dashboard and waitlist calls that already share the central Axios client.
const APPROVED_PATH_GROUPS = new Set([
  "activity",
  "auth",
  "checkin",
  "collections",
  "comic_chapter",
  "comic_page",
  "comics",
  "creators",
  "leaderboard",
  "like",
  "nfts",
  "referrals",
  "transactions",
  "usertasks",
  "view",
  "waitlist",
]);
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: {
    path?: string[];
  };
};

function buildAllowHeader() {
  return "GET, POST, PUT, PATCH, DELETE, OPTIONS";
}

function createSafeError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      status,
      message,
    },
    { status }
  );
}

function getValidatedPath(pathSegments?: string[]) {
  if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
    return null;
  }

  const decodedSegments: string[] = [];

  for (const segment of pathSegments) {
    if (!segment) {
      return null;
    }

    let decodedSegment = segment;

    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      return null;
    }

    if (
      !decodedSegment ||
      decodedSegment.includes("..") ||
      decodedSegment.includes("/") ||
      decodedSegment.includes("\\")
    ) {
      return null;
    }

    decodedSegments.push(decodedSegment);
  }

  if (!APPROVED_PATH_GROUPS.has(decodedSegments[0])) {
    return null;
  }

  return decodedSegments.map((segment) => encodeURIComponent(segment)).join("/");
}

function getBackendUrl(request: NextRequest, validatedPath: string) {
  const base = BACKEND_API_BASE.replace(/\/+$/, "");
  return `${base}/${validatedPath}${request.nextUrl.search}`;
}

function getForwardHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  return headers;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const validatedPath = getValidatedPath(context.params.path);

  if (!validatedPath) {
    return createSafeError("Invalid Quiva API path.", 400);
  }

  const method = request.method.toUpperCase();

  if (!["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(method)) {
    return createSafeError("Method not allowed.", 405);
  }

  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        Allow: buildAllowHeader(),
      },
    });
  }

  const init: RequestInit = {
    method,
    headers: getForwardHeaders(request),
    cache: "no-store",
  };

  if (BODY_METHODS.has(method)) {
    const body = await request.arrayBuffer();

    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  try {
    const backendResponse = await fetch(getBackendUrl(request, validatedPath), init);
    const contentType = backendResponse.headers.get("content-type") || "application/json";

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: backendResponse.status,
          message: "Quiva API request failed.",
        },
        { status: backendResponse.status }
      );
    }

    const responseBody = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();

    responseHeaders.set("content-type", contentType);

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        message: "Unable to reach Quiva API.",
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
