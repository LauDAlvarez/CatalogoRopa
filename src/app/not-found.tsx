import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="container empty-state">
        <h1>No encontramos esa pagina.</h1>
        <p>Puede que el producto ya no este disponible o que el enlace haya cambiado.</p>
        <Link href="/catalogo" className="button">
          Ver catalogo
        </Link>
      </div>
    </main>
  );
}

