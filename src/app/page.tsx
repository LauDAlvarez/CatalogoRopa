import { DeferredContactForm } from "@/components/deferred-contact-form";
import { ProductSection } from "@/components/product-section";
import { Carousel } from "@/components/carousel";
import { LazyHomeCarousel } from "@/components/lazy-home-carousel";
import { LazyHomeProductSection } from "@/components/lazy-home-product-section";
import { StoreMap } from "@/components/store-map";
import { getHomePrimaryData } from "@/lib/catalog-data";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

export default async function Home() {
  const { heroBanners, recentProducts } = await getHomePrimaryData();

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
            Pendas que te hacen sentir cómodx y con estilo al mismo tiempo. Revisá modelos, talles y colores cuando quieras y escribinos por WhatsApp. Te atendemos de manera personalizada para que te lleves exactamente lo que buscás. 
          </p>
        </div>
      </section>

      <ProductSection
        eyebrow="Novedades"
        title="Productos recientemente agregados"
        products={recentProducts}
      />
      <LazyHomeProductSection
        eyebrow="Consultas"
        title="Productos mas consultados"
        section="most-consulted"
      />
      <LazyHomeProductSection
        eyebrow="Interes"
        title="Productos mas vistos"
        section="most-viewed"
      />

      <div className="section section-secondary-slider">
        <LazyHomeCarousel />
      </div>

      <section id="faqs" className="faq-section">
        <div className="container">
          <p className="eyebrow">Faqs</p>
          <h2>Preguntas frecuentes</h2>
          <div className="faq-grid">
            <article>
              <h3>¿Cómo hago para comprar?</h3>
              <p>
                Encontrás lo que te gusta en el catálogo, hacés clic en "Comprar" y te mandamos directo a WhatsApp. Te atendemos al toque 📲
              </p>
            </article>
            <article>
              <h3>¿Por qué se compra por WhatsApp?</h3>
              <p>
                 Porque nos gusta atenderte bien. Te asesoramos con el talle, el color y las opciones disponibles antes de confirmar tu pedido ✔
              </p>
            </article>
            <article>
              <h3>¿Los precios del catálogo son finales?</h3>
              <p>
                Los precios están siempre actualizados, pero la confirmación final la hacemos por WhatsApp para asegurarnos de darte el mejor dato 🙌🏼
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact-section">
        <div className="container contact-grid">
          <div className="contact-copy">
            <p className="eyebrow">Contacto</p>
            <h2>¿Tenés alguna duda?</h2>
            <p>
              Completá el formulario y te respondemos lo más rápido posible.
            </p>
            <StoreMap />
          </div>
          <DeferredContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      </section>
    </main>
  );
}
