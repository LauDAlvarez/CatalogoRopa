import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${siteConfig.brandName} inicio`}>
          <span className="brand-mark">{siteConfig.brandName.slice(0, 1)}</span>
          <span>{siteConfig.brandName}</span>
        </Link>
        <nav className="main-nav" aria-label="Navegacion principal">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

