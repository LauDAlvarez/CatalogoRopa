import { DeferredContactForm } from "@/components/deferred-contact-form";
import { ProductSection } from "@/components/product-section";
import { Carousel } from "@/components/carousel";
import { LazyHomeCarousel } from "@/components/lazy-home-carousel";
import { LazyHomeProductSection } from "@/components/lazy-home-product-section";
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
          <div>
            <p className="eyebrow">Contacto</p>
            <h2>¿Tenés alguna duda?</h2>
            <p>
              Completá el formulario y te respondemos lo más rápido posible.
            </p>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3347.9365041456485!2d-60.64796552302165!3d-32.95268577219593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7ab11825f1465%3A0xdc8a5e0dcf6b92ea!2sParaguay%201381%2C%20S2000%20Rosario%2C%20Santa%20Fe!5e0!3m2!1ses-419!2sar!4v1778645866181!5m2!1ses-419!2sar" width={600} height={450} style={{ border: "0" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <DeferredContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      </section>
    </main>
  );
}
