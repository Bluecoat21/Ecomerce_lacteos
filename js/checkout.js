async function iniciar() {
  await cargarProductos();
  const cont = document.getElementById("checkout");
  const lineas = lineasCarrito();

  if (!lineas.length) {
    cont.innerHTML = `
      <div class="vacio">
        <p>No tienes productos en el carrito.</p>
        <a class="btn" href="productos.html">Ver productos</a>
      </div>`;
    return;
  }

  const t = totales(lineas);

  cont.innerHTML = `
    <div class="checkout">
      <form class="form-box" id="form">
        <h3 style="margin-bottom:1rem">Datos de entrega</h3>

        <div class="dos">
          <div class="campo">
            <label for="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" required>
          </div>
          <div class="campo">
            <label for="telefono">Celular</label>
            <input id="telefono" name="telefono" type="tel" pattern="[0-9]{9}" placeholder="9 dígitos" required>
          </div>
        </div>

        <div class="campo">
          <label for="direccion">Dirección</label>
          <input id="direccion" name="direccion" required>
        </div>

        <div class="dos">
          <div class="campo">
            <label for="distrito">Distrito</label>
            <select id="distrito" name="distrito" required>
              <option value="">Elige uno</option>
              <option>Arequipa (Cercado)</option>
              <option>Cayma</option>
              <option>Cerro Colorado</option>
              <option>José Luis Bustamante y Rivero</option>
              <option>Miraflores</option>
              <option>Paucarpata</option>
              <option>Sachaca</option>
              <option>Yanahuara</option>
            </select>
          </div>
          <div class="campo">
            <label for="pago">Forma de pago</label>
            <select id="pago" name="pago" required>
              <option>Yape / Plin</option>
              <option>Efectivo contra entrega</option>
              <option>Transferencia bancaria</option>
            </select>
          </div>
        </div>

        <div class="campo">
          <label for="referencia">Referencia (opcional)</label>
          <input id="referencia" name="referencia" placeholder="Ej: frente al parque">
        </div>

        <button class="btn btn-wa" type="submit">Enviar pedido por WhatsApp</button>
      </form>

      <aside class="resumen">
        <h3>Tu pedido</h3>
        ${lineas.map(({ p, cant }) => `
          <div class="fila"><span>${cant} × ${p.nombre}</span><span>${dinero(p.precio * cant)}</span></div>
        `).join("")}
        <div class="fila" style="margin-top:.6rem"><span>Subtotal</span><span>${dinero(t.subtotal)}</span></div>
        <div class="fila"><span>Envío</span><span>${t.envio ? dinero(t.envio) : "Gratis"}</span></div>
        <div class="fila total"><span>Total</span><span>${dinero(t.total)}</span></div>
      </aside>
    </div>`;

  document.getElementById("form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);

    const detalle = lineas
      .map(({ p, cant }) => `• ${cant} x ${p.nombre} = ${dinero(p.precio * cant)}`)
      .join("\n");

    const mensaje = [
      `*Nuevo pedido - ${TIENDA}*`,
      ``,
      `Cliente: ${f.get("nombre")}`,
      `Celular: ${f.get("telefono")}`,
      `Dirección: ${f.get("direccion")}, ${f.get("distrito")}`,
      f.get("referencia") ? `Referencia: ${f.get("referencia")}` : null,
      `Pago: ${f.get("pago")}`,
      ``,
      `*Productos*`,
      detalle,
      ``,
      `Subtotal: ${dinero(t.subtotal)}`,
      `Envío: ${t.envio ? dinero(t.envio) : "Gratis"}`,
      `*Total: ${dinero(t.total)}*`
    ].filter(x => x !== null).join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`, "_blank");
    vaciarCarrito();

    cont.innerHTML = `
      <div class="vacio">
        <h2>¡Tu pedido está listo!</h2>
        <p>Se abrió WhatsApp con el detalle. Envía el mensaje para confirmarlo y te responderemos con el horario de entrega.</p>
        <a class="btn" href="index.html">Volver al inicio</a>
      </div>`;
  });
}

iniciar();