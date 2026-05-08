import { NextResponse } from "next/server";
import { incrementProductView } from "@/lib/catalog-data";

type ProductViewRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, { params }: ProductViewRouteProps) {
  const { slug } = await params;
  const tracked = await incrementProductView(slug);

  return NextResponse.json(
    { tracked },
    {
      status: tracked ? 200 : 202
    }
  );
}
