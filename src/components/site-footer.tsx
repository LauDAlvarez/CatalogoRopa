import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand" aria-label={`${siteConfig.brandName} inicio`}>
            <span className="brand-mark">{siteConfig.brandName.slice(0, 1)}</span>
            <span>{siteConfig.brandName}</span>
          </Link>
          <p className="footer-copy">
            Catalogo minimalista de prendas seleccionadas. Disponibilidad sujeta a stock.
          </p>
        </div>
        <nav className="footer-nav" aria-label="Navegacion de pie de pagina">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container copyright">
        <span>Copyright {year} {siteConfig.brandName}. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}

