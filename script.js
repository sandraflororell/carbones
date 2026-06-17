/**
 * script.js — Tienda Virtual · Carbón ECO
 * Carrito de pedidos · WhatsApp dinámico · Modal Vista Rápida
 * Tarjetas clickables · Animaciones de entrada
 */

"use strict";

/* ============================================================
   ⚙️  CONFIGURACIÓN GLOBAL
   ============================================================ */

const WHATSAPP_NUMERO = "59176908555";
const NOMBRE_TIENDA = "Tienda Virtual Carbones DARK";

/* ============================================================
   🛒  ESTADO DEL CARRITO
   ============================================================ */

const carrito = {
  cantidad: 0,
  items: [],
};

/* ============================================================
   UTILIDADES — WHATSAPP
   ============================================================ */

function construirUrlWhatsapp() {
  let mensaje;

  if (carrito.cantidad === 0) {
    mensaje =
      `¡Hola ${NOMBRE_TIENDA}! 👋 Me gustaría consultar la ` +
      `disponibilidad de los productos del catálogo (bolsas, papel y gangocho). ` +
      `¡Muchas gracias!`;
  } else {
    const detalle = carrito.items
      .map((item) => `  • ${item.nombre} x${item.qty} — ${item.precio}`)
      .join("\n");

    mensaje =
      `¡Hola ${NOMBRE_TIENDA}! 🛒 Quiero coordinar mi pedido de ` +
      `*${carrito.cantidad} artículo${carrito.cantidad !== 1 ? "s" : ""}* ` +
      `surtidos que agregué al carrito:\n\n${detalle}\n\n` +
      `Por favor, indíquenme disponibilidad y cómo proceder. ¡Gracias!`;
  }

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

/* ============================================================
   UTILIDADES — CARRITO UI
   ============================================================ */

function actualizarUICarrito() {
  const badge = document.getElementById("cart-badge-count");
  if (badge) {
    badge.textContent = carrito.cantidad;
    badge.style.display = carrito.cantidad > 0 ? "grid" : "none";
    badge.classList.remove("badge-bounce");
    void badge.offsetWidth;
    badge.classList.add("badge-bounce");
  }

  const panelContador = document.getElementById("panel-count");
  const panelLista = document.getElementById("panel-lista");
  const panelVacio = document.getElementById("panel-vacio");
  const btnFinalizar = document.getElementById("btn-finalizar-pedido");

  if (panelContador) panelContador.textContent = carrito.cantidad;

  if (panelLista) {
    panelLista.innerHTML = carrito.items
      .map(
        (item) => `
      <li class="panel-item">
        <span class="panel-item-nombre">${item.nombre}</span>
        <span class="panel-item-meta">${item.precio}</span>
        <div class="panel-item-controles">
          <button class="panel-btn-menos" data-nombre="${item.nombre}" aria-label="Quitar uno">−</button>
          <span class="panel-item-qty">${item.qty}</span>
          <button class="panel-btn-mas"  data-nombre="${item.nombre}" aria-label="Agregar uno">+</button>
        </div>
      </li>
    `,
      )
      .join("");

    panelLista.querySelectorAll(".panel-btn-menos").forEach((btn) => {
      btn.addEventListener("click", () =>
        modificarCantidad(btn.dataset.nombre, -1),
      );
    });
    panelLista.querySelectorAll(".panel-btn-mas").forEach((btn) => {
      btn.addEventListener("click", () =>
        modificarCantidad(btn.dataset.nombre, +1),
      );
    });
  }

  if (panelVacio) {
    panelVacio.style.display = carrito.cantidad === 0 ? "flex" : "none";
  }

  if (btnFinalizar) {
    btnFinalizar.disabled = carrito.cantidad === 0;
  }

  const btnWA = document.getElementById("btn-whatsapp");
  if (btnWA) btnWA.href = construirUrlWhatsapp();
}

function agregarAlCarrito(nombre, precio) {
  const existente = carrito.items.find((i) => i.nombre === nombre);
  if (existente) {
    existente.qty += 1;
  } else {
    carrito.items.push({ nombre, precio, qty: 1 });
  }
  carrito.cantidad += 1;
  actualizarUICarrito();
}

function modificarCantidad(nombre, delta) {
  const item = carrito.items.find((i) => i.nombre === nombre);
  if (!item) return;

  item.qty += delta;
  carrito.cantidad += delta;

  if (item.qty <= 0) {
    carrito.items = carrito.items.filter((i) => i.nombre !== nombre);
  }
  if (carrito.cantidad < 0) carrito.cantidad = 0;

  actualizarUICarrito();
}

/* ============================================================
   1. BADGE DEL CARRITO (inicia en 0)
   ============================================================ */

function iniciarBadgeCarrito() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;

  badge.id = "cart-badge-count";
  badge.textContent = "0";
  badge.style.display = "none";
}

/* ============================================================
   2. BOTONES "AGREGAR AL CARRITO" (.btn-add)
   ============================================================ */

function iniciarBotonesAgregar() {
  document.querySelectorAll(".btn-add").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const tarjeta = boton.closest(".card-producto");
      const nombre =
        tarjeta?.querySelector(".card-title")?.textContent?.trim() ||
        "Producto";
      const precio =
        tarjeta?.querySelector(".precio")?.textContent?.trim() || "";

      agregarAlCarrito(nombre, precio);

      boton.classList.add("btn-add--activo");
      setTimeout(() => boton.classList.remove("btn-add--activo"), 380);

      abrirPanelCarrito();
    });
  });
}

/* ============================================================
   3. PANEL LATERAL DEL CARRITO
   ============================================================ */

function crearPanelCarrito() {
  const panel = document.createElement("aside");
  panel.id = "panel-carrito";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Carrito de pedidos");

  panel.innerHTML = `
    <div class="panel-overlay" id="panel-overlay"></div>
    <div class="panel-drawer">
      <header class="panel-header">
        <h2 class="panel-titulo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Mi Pedido
          <span class="panel-badge" id="panel-count">0</span>
        </h2>
        <button class="panel-cerrar" id="panel-cerrar" aria-label="Cerrar carrito">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div class="panel-cuerpo">
        <div class="panel-vacio" id="panel-vacio">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>Tu carrito está vacío.</p>
          <span>Agrega productos del catálogo ↗</span>
        </div>
        <ul class="panel-lista" id="panel-lista"></ul>
      </div>

      <footer class="panel-footer">
        <p class="panel-resumen">
          Total de artículos: <strong id="panel-count-footer">0</strong>
        </p>
        <button class="btn-finalizar" id="btn-finalizar-pedido" disabled>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.347.614 4.553 1.686 6.467L2.667 29.333l7.067-1.653A13.26 13.26 0 0016.003 29.333c7.364 0 13.33-5.97 13.33-13.333S23.367 2.667 16.003 2.667zm6.14 18.293c-.337-.167-1.99-.98-2.3-1.093-.31-.113-.533-.167-.757.167-.22.333-.863 1.093-1.057 1.317-.193.22-.39.247-.727.08-.337-.167-1.42-.523-2.703-1.667-1-.89-1.673-1.99-1.87-2.327-.196-.337-.02-.52.147-.687.153-.153.337-.4.503-.6.167-.2.223-.333.333-.557.113-.22.057-.413-.027-.58-.083-.167-.757-1.82-1.037-2.493-.273-.653-.55-.563-.757-.573-.193-.01-.413-.013-.633-.013s-.58.08-.883.4c-.303.32-1.16 1.133-1.16 2.76s1.187 3.2 1.353 3.42c.167.22 2.337 3.567 5.66 5.003.793.34 1.41.543 1.89.697.793.253 1.517.217 2.087.133.637-.093 1.99-.813 2.27-1.597.28-.783.28-1.453.197-1.593-.08-.143-.3-.223-.633-.387z"/>
          </svg>
          Finalizar pedido por WhatsApp
        </button>
      </footer>
    </div>
  `;

  document.body.appendChild(panel);

  document
    .getElementById("panel-overlay")
    .addEventListener("click", cerrarPanelCarrito);
  document
    .getElementById("panel-cerrar")
    .addEventListener("click", cerrarPanelCarrito);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarPanelCarrito();
      cerrarModalVistaRapida();
    }
  });

  document
    .getElementById("btn-finalizar-pedido")
    .addEventListener("click", () => {
      if (carrito.cantidad === 0) return;
      window.open(construirUrlWhatsapp(), "_blank", "noopener,noreferrer");
    });

  const panelCount = document.getElementById("panel-count");
  new MutationObserver(() => {
    const footer = document.getElementById("panel-count-footer");
    if (footer && panelCount) footer.textContent = panelCount.textContent;
  }).observe(panelCount, { childList: true });
}

function abrirPanelCarrito() {
  document.getElementById("panel-carrito")?.classList.add("panel-abierto");
  document.body.style.overflow = "hidden";
}

function cerrarPanelCarrito() {
  document.getElementById("panel-carrito")?.classList.remove("panel-abierto");
  if (
    !document
      .getElementById("modal-vista-rapida")
      ?.classList.contains("modal-abierto")
  ) {
    document.body.style.overflow = "";
  }
}

function iniciarBotonHeaderCarrito() {
  const btn = document.querySelector('.icon-btn[aria-label="Carrito"]');
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    abrirPanelCarrito();
  });
}

/* ============================================================
   4. BOTÓN FLOTANTE WHATSAPP
   ============================================================ */

function iniciarBotonWhatsapp() {
  const btn = document.getElementById("btn-whatsapp");
  if (!btn) return;

  btn.target = "_blank";
  btn.rel = "noopener noreferrer";

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(construirUrlWhatsapp(), "_blank", "noopener,noreferrer");
  });

  btn.href = construirUrlWhatsapp();
}

/* ============================================================
   5. TARJETAS CLICKABLES
   ============================================================ */

function iniciarTarjetasClickables() {
  document.querySelectorAll(".card-link .card-producto").forEach((tarjeta) => {
    tarjeta.style.cursor = "pointer";

    tarjeta.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;

      const url = tarjeta.closest(".card-link")?.getAttribute("href");
      if (url && url !== "#") window.location.href = url;
    });
  });
}

/* ============================================================
   6. CHIPS DE CATEGORÍA
   ============================================================ */

function iniciarChipsCategorias() {
  const chips = document.querySelectorAll(".cat-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
}

/* ============================================================
   7. ANIMACIÓN DE ENTRADA — Intersection Observer
   ============================================================ */

function iniciarAnimacionEntrada() {
  const elementos = document.querySelectorAll(
    ".card-link, .value-item, .hero-stats .stat",
  );

  elementos.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
  });

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada, i) => {
        if (entrada.isIntersecting) {
          setTimeout(() => {
            entrada.target.style.opacity = "1";
            entrada.target.style.transform = "translateY(0)";
          }, i * 60);
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  elementos.forEach((el) => observer.observe(el));
}

/* ============================================================
   8. MODAL — VISTA RÁPIDA
   Captura datos de la tarjeta y los muestra en el modal
   con transición fade. Cierra con X, backdrop o Escape.
   ============================================================ */

/** Descripciones enriquecidas por producto */
const DESCRIPCIONES_PRODUCTO = {
  "En Gangocho Vegetal":
    "Carbón vegetal de alta pureza envasado en gangocho artesanal. Quema limpia, larga duración y sin humo excesivo. Ideal para asados, hornos y uso profesional.",
  "En Gangocho Ecológico":
    "Variante ecológica certificada, elaborada sin químicos ni aditivos. Empaque en gangocho biodegradable. La opción más responsable del catálogo.",
  "Papel Mediano Vegetal":
    "Carbón en papel mediano de origen 100 % vegetal. Encendido rápido y temperatura estable. Perfecto para parrillas domésticas y braseros.",
  "Papel Mediano Ecológico":
    "Versión ecológica del papel mediano. Fabricación artesanal que respeta el medioambiente. Certificado libre de tóxicos y aditivos artificiales.",
  "Papel Pequeño":
    "Presentación compacta en papel. Precio económico con la misma calidad artesanal. Ideal para uso personal, camping o muestras de producto.",
  "En Bolsa":
    "Carbón en bolsa resistente para fácil transporte y almacenamiento. Presentación estándar apta para todo tipo de uso doméstico e industrial.",
};

/** Ratings por producto */
const RATINGS_PRODUCTO = {
  "En Gangocho Vegetal": 4.9,
  "En Gangocho Ecológico": 4.8,
  "Papel Mediano Vegetal": 4.7,
  "Papel Mediano Ecológico": 4.8,
  "Papel Pequeño": 4.6,
  "En Bolsa": 4.7,
};

let modalCantidad = 1;
let modalProductoActivo = { nombre: "", precio: "" };

/**
 * Rellena el modal con los datos de la tarjeta clicada y lo muestra.
 * @param {HTMLElement} tarjeta - .card-producto del producto
 */
function abrirModalVistaRapida(tarjeta) {
  // Extraer datos de la tarjeta
  const imgEl = tarjeta.querySelector(".producto-img img");
  const titulo =
    tarjeta.querySelector(".card-title")?.textContent?.trim() || "Producto";
  const precio = tarjeta.querySelector(".precio")?.textContent?.trim() || "";
  const categoria =
    tarjeta.querySelector(".card-category")?.textContent?.trim() || "";
  const badgeEl = tarjeta.querySelector(".card-badge");
  const badgeTxt = badgeEl?.textContent?.trim() || "";
  const esEco = badgeEl?.classList.contains("eco") || false;

  // Imagen con fade
  const modalImg = document.getElementById("modal-img");
  modalImg.classList.remove("img-fade-in");
  modalImg.classList.add("img-fade-out");

  setTimeout(() => {
    modalImg.src = imgEl?.src || "";
    modalImg.alt = titulo;
    modalImg.onerror = () => {
      modalImg.src = `https://placehold.co/400x400/262336/40ffbf?text=${encodeURIComponent(titulo)}`;
    };
    modalImg.classList.remove("img-fade-out");
    modalImg.classList.add("img-fade-in");
  }, 160);

  // Badge de la imagen
  const badgeImgEl = document.getElementById("modal-badge-img");
  if (badgeTxt) {
    badgeImgEl.textContent = badgeTxt;
    badgeImgEl.className =
      "modal-badge-img visible" +
      (esEco ? " badge-eco" : badgeTxt === "Oferta" ? " badge-oferta" : "");
  } else {
    badgeImgEl.className = "modal-badge-img";
  }

  // Textos
  document.getElementById("modal-categoria").textContent = categoria;
  document.getElementById("modal-titulo").textContent = titulo;
  document.getElementById("modal-precio").textContent = precio;
  document.getElementById("modal-desc").textContent =
    DESCRIPCIONES_PRODUCTO[titulo] ||
    "Producto artesanal de alta calidad, elaborado con materiales 100 % ecológicos.";
  document.getElementById("modal-rating-val").textContent = (
    RATINGS_PRODUCTO[titulo] || 4.7
  ).toFixed(1);

  // Miniaturas (3 vistas simuladas con la misma imagen)
  const thumbsCont = document.getElementById("modal-thumbs");
  thumbsCont.innerHTML = "";
  [imgEl?.src, imgEl?.src, imgEl?.src].forEach((src, i) => {
    if (!src) return;
    const btn = document.createElement("button");
    btn.className = "modal-thumb" + (i === 0 ? " thumb-activa" : "");
    btn.setAttribute("aria-label", `Vista ${i + 1}`);
    btn.innerHTML = `<img src="${src}" alt="Vista ${i + 1}" />`;
    btn.addEventListener("click", () => {
      thumbsCont
        .querySelectorAll(".modal-thumb")
        .forEach((t) => t.classList.remove("thumb-activa"));
      btn.classList.add("thumb-activa");
      modalImg.classList.add("img-fade-out");
      setTimeout(() => {
        modalImg.src = src;
        modalImg.classList.remove("img-fade-out");
        modalImg.classList.add("img-fade-in");
      }, 150);
    });
    thumbsCont.appendChild(btn);
  });

  // Resetear cantidad
  modalCantidad = 1;
  document.getElementById("modal-qty-display").textContent = "1";

  // Guardar producto activo
  modalProductoActivo = { nombre: titulo, precio };

  // URL personalizada del botón WhatsApp del modal
  const msgWA = encodeURIComponent(
    `¡Hola ${NOMBRE_TIENDA}! 👋 Me interesa el producto: *${titulo}* (${precio}). ¿Está disponible?`,
  );
  document.getElementById("modal-btn-wa").onclick = () =>
    window.open(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${msgWA}`,
      "_blank",
      "noopener,noreferrer",
    );

  // Mostrar modal
  const overlay = document.getElementById("modal-vista-rapida");
  overlay.classList.add("modal-abierto");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Foco accesible
  setTimeout(() => document.getElementById("modal-cerrar")?.focus(), 50);
}

/** Cierra el modal con animación de salida */
function cerrarModalVistaRapida() {
  const overlay = document.getElementById("modal-vista-rapida");
  if (!overlay) return;
  overlay.classList.remove("modal-abierto");
  overlay.setAttribute("aria-hidden", "true");
  if (
    !document
      .getElementById("panel-carrito")
      ?.classList.contains("panel-abierto")
  ) {
    document.body.style.overflow = "";
  }
}

/** Registra todos los listeners del modal */
function iniciarModalVistaRapida() {
  // Botones "Vista Rápida" en las tarjetas
  document.querySelectorAll(".overlay-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const tarjeta = btn.closest(".card-producto");
      if (tarjeta) abrirModalVistaRapida(tarjeta);
    });
  });

  // Botón X
  document
    .getElementById("modal-cerrar")
    ?.addEventListener("click", cerrarModalVistaRapida);

  // Clic en el backdrop
  document
    .getElementById("modal-backdrop")
    ?.addEventListener("click", cerrarModalVistaRapida);

  // Selector de cantidad
  document.getElementById("modal-qty-minus")?.addEventListener("click", () => {
    if (modalCantidad <= 1) return;
    modalCantidad--;
    document.getElementById("modal-qty-display").textContent = modalCantidad;
  });

  document.getElementById("modal-qty-plus")?.addEventListener("click", () => {
    modalCantidad++;
    document.getElementById("modal-qty-display").textContent = modalCantidad;
  });

  // Botón "Agregar al Carrito" del modal
  document
    .getElementById("modal-btn-agregar")
    ?.addEventListener("click", () => {
      const { nombre, precio } = modalProductoActivo;
      if (!nombre) return;

      for (let i = 0; i < modalCantidad; i++) {
        agregarAlCarrito(nombre, precio);
      }

      // Feedback visual en el botón
      const btn = document.getElementById("modal-btn-agregar");
      const orig = btn.innerHTML;
      btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M5 12l5 5L20 7"/>
      </svg>
      ¡Agregado!
    `;
      btn.style.background = "#1ebe5a";

      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = "";
        cerrarModalVistaRapida();
      }, 1400);
    });
}

/* ============================================================
   🚀  INICIALIZACIÓN
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  iniciarBadgeCarrito(); // Badge dinámico que comienza en 0
  crearPanelCarrito(); // Inyecta el drawer lateral en el DOM
  iniciarBotonesAgregar(); // Captura clics en .btn-add
  iniciarBotonHeaderCarrito(); // Botón carrito del header abre el panel
  iniciarBotonWhatsapp(); // Botón flotante con URL dinámica
  iniciarTarjetasClickables(); // Toda la tarjeta es clicable
  iniciarChipsCategorias(); // Filtros de categoría
  iniciarAnimacionEntrada(); // Fade-in al hacer scroll
  iniciarModalVistaRapida(); // Modal de Vista Rápida

  actualizarUICarrito(); // Estado inicial de la UI
});
