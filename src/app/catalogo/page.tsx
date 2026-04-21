import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import type { CatalogFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Prendas disponibles filtradas por tipo, genero, talle y color."
};

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    q: getSingleParam(params.q),
    type: getSingleParam(params.type),
    gender: getSingleParam(params.gender),
    size: getSingleParam(params.size),
    color: getSingleParam(params.color)
  };

  const { products, facets } = await getCatalogProducts(filters);

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

      <section className="catalog-layout container">
        <form className="filters-panel" action="/catalogo">
          <label>
            <span>Buscar</span>
            <input name="q" type="search" defaultValue={filters.q} placeholder="Camisa, jean..." />
          </label>
          <label>
            <span>Tipo</span>
            <select name="type" defaultValue={filters.type || ""}>
              <option value="">Todos</option>
              {facets.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Genero</span>
            <select name="gender" defaultValue={filters.gender || ""}>
              <option value="">Todos</option>
              {facets.genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Talle</span>
            <select name="size" defaultValue={filters.size || ""}>
              <option value="">Todos</option>
              {facets.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Color</span>
            <select name="color" defaultValue={filters.color || ""}>
              <option value="">Todos</option>
              {facets.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
          <div className="filter-actions">
            <button className="button" type="submit">
              Aplicar
            </button>
            <Link className="text-link" href="/catalogo">
              Limpiar
            </Link>
          </div>
        </form>

        <div className="catalog-results">
          <div className="catalog-results-heading">
            <p>{products.length} productos encontrados</p>
          </div>
          {products.length ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No encontramos productos con esos filtros.</h2>
              <p>Proba quitando un filtro o envia una consulta desde contacto.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
