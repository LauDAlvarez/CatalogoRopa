import { NextResponse } from "next/server";
import {
  getHomeMostConsultedProducts,
  getHomeMostViewedProducts,
  getHomeSecondaryBanners
} from "@/lib/catalog-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (section === "secondary-banners") {
    return NextResponse.json({
      banners: await getHomeSecondaryBanners()
    });
  }

  if (section === "most-consulted") {
    return NextResponse.json({
      products: await getHomeMostConsultedProducts()
    });
  }

  if (section === "most-viewed") {
    return NextResponse.json({
      products: await getHomeMostViewedProducts()
    });
  }

  return NextResponse.json(
    {
      message: "Seccion no soportada."
    },
    { status: 400 }
  );
}
