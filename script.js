/**
 * script.js — Tienda Virtual · Carbón ECO
 * Carrito de pedidos · WhatsApp dinámico · Modal Vista Rápida
 * Tarjetas clickables · Animaciones de entrada
 */

"use strict";

/* ============================================================
   ⚙️ CONFIGURACIÓN GLOBAL
   ============================================================ */
const WHATSAPP_NUMERO = "59176908555";
const NOMBRE_TIENDA = "Tienda Virtual Carbones DARK";

/* ============================================================
   🛒 ESTADO DEL CARRITO
   ============================================================ */
const carrito = {
  cantidad: 0,
  items: [],
};

/* ============================================================
   UTILIDADES — WHATSAPP
   ============================================================ */
function parsearPrecio(precioStr) {
  return parseFloat(precioStr) || 0;
}

function calcularTotal() {
  return carrito.items.reduce(
    (sum, item) => sum + parsearPrecio(item.precio) * item.qty,
    0,
  );
}

function construirUrlWhatsapp() {
  let mensaje;

  if (carrito.cantidad === 0) {
    mensaje =
      `¡Hola ${NOMBRE_TIENDA}! 👋 Me gustaría consultar la ` +
      `disponibilidad de los productos del catálogo (bolsas, papel y gangocho). ` +
      `¡Muchas gracias!`;
  } else {
    const detalle = carrito.items
      .map((item) => {
        const sub = (parsearPrecio(item.precio) * item.qty).toFixed(2);
        return `  • ${item.nombre} x${item.qty} — ${item.precio}/u = ${sub} Bs`;
      })
      .join("\n");

    const total = calcularTotal().toFixed(2);

    mensaje =
      `¡Hola ${NOMBRE_TIENDA}! 🛒 Quiero coordinar mi pedido:\n\n` +
      `${detalle}\n\n` +
      `*Total a pagar: ${total} Bs*\n\n` +
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

  const totalEl = document.getElementById("panel-total-pagar");
  if (totalEl) totalEl.textContent = calcularTotal().toFixed(2) + " Bs";

  if (panelLista) {
    panelLista.innerHTML = carrito.items
      .map((item) => {
        const precioNum = parsearPrecio(item.precio);
        const subtotal = (precioNum * item.qty).toFixed(2);
        const imgHtml = item.img
          ? `<img src="${item.img}" alt="${item.nombre}" loading="lazy"
                 onerror="this.src='https://placehold.co/54x54/2e2a42/40ffbf?text=📦'">`
          : `<img src="https://placehold.co/54x54/2e2a42/40ffbf?text=📦" alt="${item.nombre}">`;
        return `
      <li class="panel-item" data-nombre="${item.nombre}" data-precio="${precioNum}">
        <div class="panel-item-img">${imgHtml}</div>
        <div class="panel-item-info">
          <span class="panel-item-nombre">${item.nombre}</span>
          <span class="panel-item-precio-unit">${item.precio} / unidad</span>
          <div class="panel-item-controles">
            <button class="panel-btn-menos" data-nombre="${item.nombre}" aria-label="Quitar uno">−</button>
            <span class="panel-item-qty">${item.qty}</span>
            <button class="panel-btn-mas"  data-nombre="${item.nombre}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div class="panel-item-subtotal-wrap">
          <span class="panel-item-subtotal-label">subtotal</span>
          <span class="panel-item-subtotal">${subtotal} Bs</span>
        </div>
      </li>`;
      })
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

function agregarAlCarrito(nombre, precio, imgSrc = "") {
  const existente = carrito.items.find((i) => i.nombre === nombre);
  if (existente) {
    existente.qty += 1;
  } else {
    carrito.items.push({ nombre, precio, qty: 1, img: imgSrc });
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
   1. BADGE DEL CARRITO
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
      const imgSrc = tarjeta?.querySelector(".producto-img img")?.src || "";

      agregarAlCarrito(nombre, precio, imgSrc);

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
  // Evitar duplicar el panel si ya existe en el HTML
  if (document.getElementById("panel-carrito")) return;

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

      <div class="panel-qr-wrap">
        <p class="panel-qr-label">Pago rápido · Escanea el QR</p>
        <div class="panel-qr-frame">
          <img src="img/qr.jpeg" alt="Código QR de pago WhatsApp" onerror="this.style.display='none'" />
          <span class="qr-c tl"></span>
          <span class="qr-c tr"></span>
          <span class="qr-c bl"></span>
          <span class="qr-c br"></span>
        </div>
      </div>

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

      <div class="panel-seguir-wrap">
        <button class="btn-seguir-pidiendo" id="btn-seguir-pidiendo" onclick="cerrarPanelCarrito()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          SEGUIR PIDIENDO
        </button>
      </div>

      <footer class="panel-footer">
        <div class="panel-resumen">
          <div class="panel-resumen-fila">
            <span>Total de artículos:</span>
            <strong id="panel-count-footer">0</strong>
          </div>
          <div class="panel-resumen-fila panel-resumen-total">
            <span>Total a pagar:</span>
            <strong id="panel-total-pagar">0.00 Bs</strong>
          </div>
        </div>
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
  if (window.innerWidth < 1024) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
}

function cerrarPanelCarrito() {
  document.getElementById("panel-carrito")?.classList.remove("panel-abierto");
  if (
    !document
      .getElementById("modal-vista-rapida")
      ?.classList.contains("modal-abierto")
  ) {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
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
   ============================================================ */
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

function abrirModalVistaRapida(tarjeta) {
  const imgEl = tarjeta.querySelector(".producto-img img");
  const titulo =
    tarjeta.querySelector(".card-title")?.textContent?.trim() || "Producto";
  const precio = tarjeta.querySelector(".precio")?.textContent?.trim() || "";
  const categoria =
    tarjeta.querySelector(".card-category")?.textContent?.trim() || "";
  const badgeEl = tarjeta.querySelector(".card-badge");
  const badgeTxt = badgeEl?.textContent?.trim() || "";
  const esEco = badgeEl?.classList.contains("eco") || false;

  const modalImg = document.getElementById("modal-img");
  if (!modalImg) return;

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

  const badgeImgEl = document.getElementById("modal-badge-img");
  if (badgeImgEl) {
    if (badgeTxt) {
      badgeImgEl.textContent = badgeTxt;
      badgeImgEl.className =
        "modal-badge-img visible" +
        (esEco ? " badge-eco" : badgeTxt === "Oferta" ? " badge-oferta" : "");
    } else {
      badgeImgEl.className = "modal-badge-img";
    }
  }

  if (document.getElementById("modal-categoria"))
    document.getElementById("modal-categoria").textContent = categoria;
  if (document.getElementById("modal-titulo"))
    document.getElementById("modal-titulo").textContent = titulo;
  if (document.getElementById("modal-precio"))
    document.getElementById("modal-precio").textContent = precio;
  if (document.getElementById("modal-desc"))
    document.getElementById("modal-desc").textContent =
      DESCRIPCIONES_PRODUCTO[titulo] ||
      "Producto artesanal de alta calidad, elaborado con materiales 100 % ecológicos.";
  if (document.getElementById("modal-rating-val"))
    document.getElementById("modal-rating-val").textContent = (
      RATINGS_PRODUCTO[titulo] || 4.7
    ).toFixed(1);

  const thumbsCont = document.getElementById("modal-thumbs");
  if (thumbsCont) {
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
  }

  modalCantidad = 1;
  if (document.getElementById("modal-qty-display"))
    document.getElementById("modal-qty-display").textContent = "1";
  modalProductoActivo = { nombre: titulo, precio };

  const msgWA = encodeURIComponent(
    `¡Hola ${NOMBRE_TIENDA}! 👋 Me interesa el producto: *${titulo}* (${precio}). ¿Está disponible?`,
  );
  const btnModalWA = document.getElementById("modal-btn-wa");
  if (btnModalWA) {
    btnModalWA.onclick = () =>
      window.open(
        `https://wa.me/${WHATSAPP_NUMERO}?text=${msgWA}`,
        "_blank",
        "noopener,noreferrer",
      );
  }

  const overlay = document.getElementById("modal-vista-rapida");
  if (overlay) {
    overlay.classList.add("modal-abierto");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  setTimeout(() => document.getElementById("modal-cerrar")?.focus(), 50);
}

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

function iniciarModalVistaRapida() {
  document.querySelectorAll(".overlay-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const tarjeta = btn.closest(".card-producto");
      if (tarjeta) abrirModalVistaRapida(tarjeta);
    });
  });

  document
    .getElementById("modal-cerrar")
    ?.addEventListener("click", cerrarModalVistaRapida);
  document
    .getElementById("modal-backdrop")
    ?.addEventListener("click", cerrarModalVistaRapida);

  document.getElementById("modal-qty-minus")?.addEventListener("click", () => {
    if (modalCantidad <= 1) return;
    modalCantidad--;
    if (document.getElementById("modal-qty-display"))
      document.getElementById("modal-qty-display").textContent = modalCantidad;
  });
}

/* ============================================================
   🚀 INICIALIZACIÓN AUTOMÁTICA AL CARGAR LA PÁGINA
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  crearPanelCarrito(); // Crea la estructura HTML del panel invisible
  iniciarBadgeCarrito(); // Setea el contador en 0
  iniciarBotonesAgregar(); // Activa los clicks en "Agregar al Carrito"
  iniciarBotonHeaderCarrito(); // Activa el icono de bolsa del menú para ver el pedido
  iniciarBotonWhatsapp(); // Configura el botón verde de abajo
  iniciarTarjetasClickables();
  iniciarChipsCategorias();
  iniciarAnimacionEntrada();
  iniciarModalVistaRapida();
  actualizarUICarrito(); // Refresca el estado inicial
});
