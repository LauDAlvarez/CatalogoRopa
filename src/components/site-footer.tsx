import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand" aria-label={`${siteConfig.brandName} inicio`}>
            <span className="brand-mark">
              <Image
                src="/asset/logoamericansport-white.png"
                alt=""
                width={512}
                height={512}
              />
            </span>
            <span className="brand-copy">
              <span className="brand-name">{siteConfig.brandName}</span>
            </span>
          </Link>
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
        <span className="fl">
            <b>&lt;</b>beta dev studio<b>&gt;</b>
        </span>
      </div>
    </footer>
  );
}
