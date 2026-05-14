import { NextResponse } from "next/server";
import { incrementProductView } from "@/lib/catalog-data";

type ProductViewRouteProps = {
  params: Promise<{ slug: string }>;
};

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && slug.length <= 120;
}

export async function POST(request: Request, { params }: ProductViewRouteProps) {
  const { slug } = await params;

  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ tracked: false }, { status: 403 });
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ tracked: false }, { status: 400 });
  }

  const tracked = await incrementProductView(slug);

  return NextResponse.json(
    { tracked },
    {
      status: tracked ? 200 : 202
    }
  );
}
