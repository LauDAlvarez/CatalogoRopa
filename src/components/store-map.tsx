"use client";

import { useState } from "react";

const STORE_ADDRESS = "Paraguay 1381, Rosario, Santa Fe";
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3347.9365041456485!2d-60.64796552302165!3d-32.95268577219593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7ab11825f1465%3A0xdc8a5e0dcf6b92ea!2sParaguay%201381%2C%20S2000%20Rosario%2C%20Santa%20Fe!5e0!3m2!1ses-419!2sar!4v1778645866181!5m2!1ses-419!2sar";
const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=Paraguay+1381,+Rosario,+Santa+Fe";

export function StoreMap() {
  const [isMapVisible, setIsMapVisible] = useState(false);

  return (
    <div className="store-map">
      {isMapVisible ? (
        <div className="store-map-frame">
          <iframe
            src={MAP_EMBED_URL}
            title="Ubicacion del local en Google Maps"
            style={{ border: "0" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="store-map-placeholder">
          <p className="store-map-label">Local</p>
          <strong>{STORE_ADDRESS}</strong>
          <p>El mapa se carga solo si queres verlo, para no frenar la carga inicial del sitio.</p>
          <div className="store-map-actions">
            <button type="button" className="button" onClick={() => setIsMapVisible(true)}>
              Cargar mapa
            </button>
            <a className="button button-light" href={MAPS_LINK} target="_blank" rel="noreferrer">
              Abrir en Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
