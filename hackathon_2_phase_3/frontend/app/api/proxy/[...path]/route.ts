import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = await params;
  const url = `${backendUrl}/api/${path.join("/")}${request.nextUrl.search}`;

  // Log incoming headers for debugging
  const authHeader = request.headers.get("Authorization");
  console.log("=== PROXY GET ===");
  console.log("Path:", path.join("/"));
  console.log("URL:", url);
  console.log("Authorization header:", authHeader ? `Bearer ${authHeader.substring(0, 20)}...` : "MISSING!");

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text || response.statusText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy GET error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = await params;
  const url = `${backendUrl}/api/${path.join("/")}`;

  try {
    const body = await request.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text || response.statusText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = await params;
  const url = `${backendUrl}/api/${path.join("/")}`;

  try {
    const body = await request.json();

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text || response.statusText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy PATCH error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = await params;
  const url = `${backendUrl}/api/${path.join("/")}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
    });

    return new NextResponse(null, { status: response.status });
  } catch (error) {
    console.error("Proxy DELETE error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = await params;
  const url = `${backendUrl}/api/${path.join("/")}`;

  try {
    const body = await request.json();

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text || response.statusText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy PUT error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
