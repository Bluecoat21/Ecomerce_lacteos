async function iniciar() {
  await cargarProductos();
  pintar();
}

function pintar() {
  const cont = document.getElementById("carrito");
  const lineas = lineasCarrito();

  if (!lineas.length) {
    cont.innerHTML = `
      <div class="vacio">
        <p>Tu carrito está vacío. Agrega un producto para empezar.</p>
        <a class="btn" href="productos.html">Ver productos</a>
      </div>`;
    return;
  }

  const t = totales(lineas);
  const falta = ENVIO_GRATIS - t.subtotal;

  cont.innerHTML = `
    <div class="carrito">
      <div>
        ${lineas.map(({ p, cant }) => `
          <div class="linea">
            <a class="mini" href="producto.html?id=${p.id}">
              ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : p.emoji}
            </a>
            <div>
              <a href="producto.html?id=${p.id}"><b>${p.nombre}</b></a><br>
              <small>${p.marca} · ${dinero(p.precio)} c/u</small>
            </div>
            <div class="qty">
              <button data-menos="${p.id}" aria-label="Quitar uno">−</button>
              <span>${cant}</span>
              <button data-mas="${p.id}" aria-label="Agregar uno" ${cant >= p.stock ? "disabled" : ""}>+</button>
            </div>
            <div class="sub">
              <b>${dinero(p.precio * cant)}</b><br>
              <button class="link" data-quitar="${p.id}">Quitar</button>
            </div>
          </div>`).join("")}
      </div>

      <aside class="resumen">
        <h3>Resumen</h3>
        <div class="fila"><span>Subtotal</span><span>${dinero(t.subtotal)}</span></div>
        <div class="fila"><span>Envío</span><span>${t.envio ? dinero(t.envio) : "Gratis"}</span></div>
        ${falta > 0 ? `<div class="aviso">Te faltan ${dinero(falta)} para el envío gratis.</div>` : ""}
        <div class="fila total"><span>Total</span><span>${dinero(t.total)}</span></div>
        <a class="btn btn-block" href="checkout.html" style="margin-top:1rem">Finalizar compra</a>
      </aside>
    </div>`;
}

document.getElementById("carrito").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.mas) cambiarCantidad(Number(b.dataset.mas), 1);
  else if (b.dataset.menos) cambiarCantidad(Number(b.dataset.menos), -1);
  else if (b.dataset.quitar) quitarDelCarrito(Number(b.dataset.quitar));
  else return;
  pintar();
});

iniciar();