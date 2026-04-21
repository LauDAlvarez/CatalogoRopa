import { Carousel } from "@/components/carousel";
import { ContactForm } from "@/components/contact-form";
import { ProductSection } from "@/components/product-section";
import { getHomeData } from "@/lib/catalog-data";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    heroBanners,
    secondaryBanners,
    recentProducts,
    mostConsultedProducts,
    mostViewedProducts
  } = await getHomeData();

  return (
    <main>
      <Carousel banners={heroBanners} label="Promociones principales" />

      <section id="nosotros" className="intro-section">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">Nosotros</p>
            <h2>Prendas faciles de consultar, elegir y combinar.</h2>
          </div>
          <p>
            {siteConfig.brandName} organiza su catalogo para que puedas revisar modelos,
            talles y colores sin perder tiempo. Cada producto muestra la informacion
            principal y deja la consulta abierta para confirmar disponibilidad.
          </p>
        </div>
      </section>

      <ProductSection
        eyebrow="Novedades"
        title="Productos recientemente agregados"
        products={recentProducts}
      />
      <ProductSection
        eyebrow="Consultas"
        title="Productos mas consultados"
        products={mostConsultedProducts}
      />
      <ProductSection
        eyebrow="Interes"
        title="Productos mas vistos"
        products={mostViewedProducts}
      />

      <div className="section section-secondary-slider">
        <Carousel banners={secondaryBanners} variant="secondary" label="Banners secundarios" />
      </div>

      <section id="faqs" className="faq-section">
        <div className="container">
          <p className="eyebrow">Faqs</p>
          <h2>Preguntas frecuentes</h2>
          <div className="faq-grid">
            <article>
              <h3>Como confirmo disponibilidad?</h3>
              <p>
                Envianos una consulta con el producto, talle y color. Te respondemos con
                el stock actualizado.
              </p>
            </article>
            <article>
              <h3>Los precios pueden cambiar?</h3>
              <p>
                Si. El catalogo ayuda a consultar rapido, pero la confirmacion final se
                hace al momento de la compra.
              </p>
            </article>
            <article>
              <h3>Puedo pedir otro talle o color?</h3>
              <p>
                Si el modelo tiene variantes, podemos indicarte las opciones disponibles
                por mensaje.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2>Dejanos tu consulta</h2>
            <p>
              Completa tus datos y contanos que prenda te interesa. El formulario incluye
              controles anti-spam y puede reforzarse con Cloudflare Turnstile desde las
              variables de entorno.
            </p>
          </div>
          <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      </section>
    </main>
  );
}
