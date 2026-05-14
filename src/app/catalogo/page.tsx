import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { getCatalogDataset } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Prendas disponibles filtradas por tipo, genero, talle y color."
};

export const dynamic = "force-static";
export const revalidate = 300;

export default async function CatalogPage() {
  const { products, facets } = await getCatalogDataset();

  return (
    <main className="catalog-page">
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow">Catalogo</p>
          <h1>Prendas disponibles</h1>
          <p>
            Filtra por tipo, genero, talle o color predominante. Entra a cada producto
            para revisar su detalle y consultar disponibilidad.
          </p>
        </div>
      </section>

      <CatalogBrowser products={products} facets={facets} />
    </main>
  );
}
