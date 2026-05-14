"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { filterCatalogProducts } from "@/lib/catalog-filters";
import type { CatalogFacets, ProductCardData } from "@/lib/types";

type CatalogBrowserProps = {
  products: ProductCardData[];
  facets: CatalogFacets;
};

type CatalogFormState = {
  q: string;
  type: string;
  gender: string;
  size: string;
  color: string;
};

function buildFormState(searchParams: Pick<URLSearchParams, "get">): CatalogFormState {
  return {
    q: searchParams.get("q") || "",
    type: searchParams.get("type") || "",
    gender: searchParams.get("gender") || "",
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || ""
  };
}

function buildCatalogHref(pathname: string, filters: CatalogFormState) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.set(key, trimmedValue);
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const emptyFormState: CatalogFormState = {
  q: "",
  type: "",
  gender: "",
  size: "",
  color: ""
};

export function CatalogBrowser({ products, facets }: CatalogBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const appliedFormState = buildFormState(searchParams);
  const [formState, setFormState] = useState<CatalogFormState>(appliedFormState);

  useEffect(() => {
    setFormState(appliedFormState);
  }, [
    appliedFormState.color,
    appliedFormState.gender,
    appliedFormState.q,
    appliedFormState.size,
    appliedFormState.type
  ]);

  const filteredProducts = filterCatalogProducts(products, appliedFormState).slice(0, 60);

  function updateField(field: keyof CatalogFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      router.replace(buildCatalogHref(pathname, formState), { scroll: false });
    });
  }

  function clearFilters() {
    setFormState(emptyFormState);

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <section className="catalog-layout container">
      <form className="filters-panel" onSubmit={applyFilters}>
        <label>
          <span>Buscar</span>
          <input
            name="q"
            type="search"
            value={formState.q}
            onChange={(event) => updateField("q", event.target.value)}
            placeholder="Camisa, jean..."
          />
        </label>
        <label>
          <span>Tipo</span>
          <select
            name="type"
            value={formState.type}
            onChange={(event) => updateField("type", event.target.value)}
          >
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
          <select
            name="gender"
            value={formState.gender}
            onChange={(event) => updateField("gender", event.target.value)}
          >
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
          <select
            name="size"
            value={formState.size}
            onChange={(event) => updateField("size", event.target.value)}
          >
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
          <select
            name="color"
            value={formState.color}
            onChange={(event) => updateField("color", event.target.value)}
          >
            <option value="">Todos</option>
            {facets.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Aplicando..." : "Aplicar"}
          </button>
          <button className="text-link" type="button" onClick={clearFilters} disabled={isPending}>
            Limpiar
          </button>
        </div>
      </form>

      <div className="catalog-results">
        <div className="catalog-results-heading">
          <p>{filteredProducts.length} productos encontrados</p>
        </div>
        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
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
  );
}
