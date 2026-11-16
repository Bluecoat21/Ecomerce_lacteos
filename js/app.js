// ============ CONFIGURACIÓN ============
const TIENDA = "Quesos & Tradición Arequipeña";
const WHATSAPP = "51999999999"; // cambia por tu número
const ENVIO_GRATIS = 99;        // envío gratis desde este monto
const COSTO_ENVIO = 8;

// ============ ALMACENAMIENTO ============
function leer(clave, defecto) {
  try {
    const v = JSON.parse(localStorage.getItem(clave));
    return v ?? defecto;
  } catch (e) {
    return defecto;
  }
}
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
}

// ============ CARRITO: { idProducto: cantidad } ============
function getCart() { return leer("cart", {}); }
function saveCart(cart) { guardar("cart", cart); updateCartCount(); }
function cartCount() { return Object.values(getCart()).reduce((a, b) => a + b, 0); }
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cartCount();
}
function agregarAlCarrito(id, cant = 1) {
  const c = getCart();
  c[id] = (c[id] || 0) + cant;
  saveCart(c);
}
function cambiarCantidad(id, delta) {
  const c = getCart();
  c[id] = (c[id] || 0) + delta;
  if (c[id] <= 0) delete c[id];
  saveCart(c);
}
function quitarDelCarrito(id) {
  const c = getCart();
  delete c[id];
  saveCart(c);
}
function vaciarCarrito() { saveCart({}); }

// Líneas del carrito con los datos completos del producto
function lineasCarrito() {
  const c = getCart();
  return Object.keys(c)
    .map(id => {
      const p = PRODUCTOS.find(x => x.id === Number(id));
      return p ? { p, cant: c[id] } : null;
    })
    .filter(Boolean);
}
function totales(lineas) {
  const subtotal = lineas.reduce((s, l) => s + l.p.precio * l.cant, 0);
  const envio = lineas.length === 0 || subtotal >= ENVIO_GRATIS ? 0 : COSTO_ENVIO;
  return { subtotal, envio, total: subtotal + envio };
}

// ============ FAVORITOS ============
function getFavs() { return leer("favs", []); }
function esFav(id) { return getFavs().includes(id); }
function toggleFav(id) {
  let f = getFavs();
  const activo = !f.includes(id);
  f = activo ? [...f, id] : f.filter(x => x !== id);
  guardar("favs", f);
  return activo;
}

// ============ AVISO EMERGENTE ============
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 1800);
}

// ============ PRODUCTOS ============
let PRODUCTOS = [];

async function cargarProductos() {
  if (PRODUCTOS.length) return PRODUCTOS;
  const res = await fetch("data/productos.json");
  PRODUCTOS = await res.json();
  return PRODUCTOS;
}
function dinero(n) { return "S/ " + n.toFixed(2); }
function descuento(p) {
  if (!p.precioAntes) return 0;
  return Math.round((1 - p.precio / p.precioAntes) * 100);
}

// Tarjeta reutilizable (inicio, catálogo, relacionados)
function tarjetaHTML(p) {
  const d = descuento(p);
  const fav = esFav(p.id);
  const visual = p.imagen
    ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.outerHTML='<span class=\\'emoji\\'>${p.emoji}</span>'">`
    : `<span class="emoji">${p.emoji}</span>`;

  return `
    <article class="card">
      <button class="fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-label="Favorito">${fav ? "♥" : "♡"}</button>
      <a class="pic" href="producto.html?id=${p.id}">
        ${d ? `<span class="tag">-${d}%</span>` : ""}
        ${visual}
      </a>
      <div class="info">
        <span class="marca">${p.marca}</span>
        <a href="producto.html?id=${p.id}"><h3>${p.nombre}</h3></a>
        <div class="precio">
          <b>${dinero(p.precio)}</b>
          ${p.precioAntes ? `<s>${dinero(p.precioAntes)}</s>` : ""}
        </div>
        <button class="btn" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>`;
}

// Un solo "oyente" para todos los botones Agregar y Favorito del sitio
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) {
    agregarAlCarrito(Number(add.dataset.add));
    toast("Agregado al carrito");
    return;
  }
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    const activo = toggleFav(Number(fav.dataset.fav));
    fav.classList.toggle("on", activo);
    fav.textContent = activo ? "♥" : "♡";
    if (typeof alCambiarFavs === "function") alCambiarFavs();
  }
});

// ============ HEADER ============
function renderHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  const esHome = document.body.classList.contains("home");

  if (esHome) {
    header.innerHTML = `
      <header class="header-transparent" id="main-nav">
        <div class="container header-overlay-inner">
          <a class="logo-pill" href="index.html">
            <small>Quesos</small>
            <strong>& Tradición Arequipeña </strong>
          </a>

          <nav class="nav-overlay">
            <a href="#tienda">NOSOTROS</a>
            <a href="productos.html">PRODUCTOS</a>
            <a href="contacto.html">CONTACTO</a>
          </nav>

          <div class="overlay-actions">
            <form class="search-mini" action="productos.html" method="get">
              <input type="search" name="q" placeholder="Buscar..." aria-label="Buscar">
              <button type="submit">🔍</button>
            </form>
            <a class="icon-circle" href="productos.html?fav=1" title="Favoritos">♡</a>
            <a class="icon-circle cart-pill" href="carrito.html" title="Carrito">
              🛒 <span id="cart-count">0</span>
            </a>
          </div>
        </div>
      </header>`;
  } else {
    header.innerHTML = `
      <div class="promo">Envío gratis en Arequipa por compras desde S/ ${ENVIO_GRATIS}</div>
      <div class="header">
        <div class="header-top">
          <a class="logo" href="index.html">${TIENDA}</a>
          <form class="search" action="productos.html" method="get">
            <input type="search" name="q" placeholder="¿Qué estás buscando?" aria-label="Buscar productos">
            <button type="submit">Buscar</button>
          </form>
          <div class="actions">
            <a href="productos.html?fav=1"><span class="icon">♡</span>Favoritos</a>
            <a href="contacto.html"><span class="icon">☺</span>Contacto</a>
            <a href="carrito.html">
              <span class="icon">🛒</span>Carrito
              <span class="badge" id="cart-count">0</span>
            </a>
          </div>
        </div>
      </div>
      <nav class="nav">
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="productos.html">Todos</a></li>
          <li><a href="productos.html?cat=Leche">Leche</a></li>
          <li><a href="productos.html?cat=Quesos">Quesos</a></li>
          <li><a href="productos.html?cat=Yogur">Yogur</a></li>
          <li><a href="productos.html?cat=Mantequilla">Mantequilla</a></li>
          <li><a href="productos.html?oferta=1">Ofertas</a></li>
        </ul>
      </nav>`;
  }
  updateCartCount();
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("main-nav");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
});

// ============ QUITAR FONDO BLANCO EXTERIOR DE LA MASCOTA ============
function quitarFondoBlancoExterior(imgEl) {
  const procesar = () => {
    try {
      const w = imgEl.naturalWidth;
      const h = imgEl.naturalHeight;
      if (!w || !h) return;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgEl, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const visitado = new Uint8Array(w * h);
      const cola = [];

      const esBlanco = (idx) => {
        const p = idx * 4;
        return data[p] > 235 && data[p + 1] > 235 && data[p + 2] > 235;
      };

      // Empezar desde los 4 bordes de la imagen (sin tocar el interior de la vaquita)
      for (let x = 0; x < w; x++) {
        cola.push(x, (h - 1) * w + x);
      }
      for (let y = 0; y < h; y++) {
        cola.push(y * w, y * w + (w - 1));
      }

      while (cola.length > 0) {
        const idx = cola.pop();
        if (visitado[idx]) continue;
        visitado[idx] = 1;

        if (!esBlanco(idx)) continue;
        data[idx * 4 + 3] = 0; // Hacer transparente solo el fondo exterior

        const x = idx % w;
        const y = (idx - x) / w;
        if (x > 0) cola.push(idx - 1);
        if (x < w - 1) cola.push(idx + 1);
        if (y > 0) cola.push(idx - w);
        if (y < h - 1) cola.push(idx + w);
      }

      ctx.putImageData(imgData, 0, 0);
      imgEl.src = canvas.toDataURL("image/png");
    } catch (e) {
      // Si el navegador bloquea canvas en local, mantiene la imagen original sin romper nada
    }
  };

  if (imgEl.complete) procesar();
  else imgEl.addEventListener("load", procesar, { once: true });
}

// ============ FOOTER ============
function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>${TIENDA}</h4>
            <p>Leche, queso y yogur de productores locales de Arequipa, frescos cada mañana.</p>
          </div>
          <div>
            <h4>Tienda</h4>
            <ul>
              <li><a href="productos.html">Todos los productos</a></li>
              <li><a href="productos.html?oferta=1">Ofertas</a></li>
              <li><a href="carrito.html">Mi carrito</a></li>
            </ul>
          </div>
          <div>
            <h4>Ayuda</h4>
            <ul>
              <li><a href="contacto.html">Contacto</a></li>
              <li><a href="checkout.html">Finalizar compra</a></li>
            </ul>
          </div>
        </div>
        <div class="copy">© ${new Date().getFullYear()} ${TIENDA}. Proyecto académico.</div>
      </div>
    </div>

    <!-- Mascota animada lateral -->
    <div class="mascota-box" id="mascota-box" title="¡Hazme clic!">
      <div class="mascota-globo" id="mascota-globo">¡Muuu! Envío gratis desde S/ ${ENVIO_GRATIS} 🥛</div>
      <img class="mascota-img" id="mascota-img" src="img/vaquita.jpg" alt="Vaquita Lácteos del Misti">
    </div>

    <a class="wa-float" href="https://wa.me/${WHATSAPP}" target="_blank" aria-label="Escribir por WhatsApp">💬</a>`;

  const imgVaquita = document.getElementById("mascota-img");
  if (imgVaquita) quitarFondoBlancoExterior(imgVaquita);

  const frases = [
    `¡Muuu! Envío gratis desde S/ ${ENVIO_GRATIS} 🥛`,
    "¡Leche fresca de ordeño del día! 🌞",
    "¿Ya probaste nuestro Queso Paria? 🧀",
    "Pide fácil por WhatsApp y paga con Yape 📱"
  ];
  let idx = 0;
  const box = document.getElementById("mascota-box");
  const globo = document.getElementById("mascota-globo");
  if (box && globo) {
    box.addEventListener("click", () => {
      idx = (idx + 1) % frases.length;
      globo.textContent = frases[idx];
      globo.classList.add("visible");
    });
  }
}

// ============ INICIO ============
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});