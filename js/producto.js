const idProducto = Number(new URLSearchParams(location.search).get("id"));
let cantidad = 1;

async function iniciar() {
  await cargarProductos();
  const p = PRODUCTOS.find(x => x.id === idProducto);
  const cont = document.getElementById("detalle");

  if (!p) {
    cont.innerHTML = `<p class="vacio" style="margin-top:1.5rem">No encontramos este producto.
      <br><a class="btn" href="productos.html">Volver al catálogo</a></p>`;
    return;
  }

  document.title = p.nombre + " | " + TIENDA;
  const d = descuento(p);

  cont.innerHTML = `
    <nav class="migas">
      <a href="index.html">Inicio</a> /
      <a href="productos.html?cat=${p.categoria}">${p.categoria}</a> / ${p.nombre}
    </nav>
    <div class="detalle">
      <div class="detalle-pic">
        ${d ? `<span class="tag">-${d}%</span>` : ""}
        ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : `<span>${p.emoji}</span>`}
      </div>
      <div>
        <span class="marca">${p.marca}</span>
        <h1>${p.nombre}</h1>
        <div class="precio grande">
          <b>${dinero(p.precio)}</b>
          ${p.precioAntes ? `<s>${dinero(p.precioAntes)}</s>` : ""}
        </div>
        <p>${p.descripcion}</p>
        <p class="stock">Disponible: ${p.stock} unidades</p>

        <div class="qty">
          <button id="menos" aria-label="Quitar uno">−</button>
          <span id="cant">1</span>
          <button id="mas" aria-label="Agregar uno">+</button>
        </div>

        <div class="acciones">
          <button class="btn" id="agregar">Agregar al carrito</button>
          <button class="btn btn-outline" id="comprar">Comprar ahora</button>
        </div>
      </div>
    </div>`;

  const num = document.getElementById("cant");
  document.getElementById("menos").onclick = () => {
    cantidad = Math.max(1, cantidad - 1);
    num.textContent = cantidad;
  };
  document.getElementById("mas").onclick = () => {
    cantidad = Math.min(p.stock, cantidad + 1);
    num.textContent = cantidad;
  };
  document.getElementById("agregar").onclick = () => {
    agregarAlCarrito(p.id, cantidad);
    toast("Agregado al carrito");
  };
  document.getElementById("comprar").onclick = () => {
    agregarAlCarrito(p.id, cantidad);
    location.href = "carrito.html";
  };

  // Productos relacionados (misma categoría)
  const rel = PRODUCTOS.filter(x => x.categoria === p.categoria && x.id !== p.id).slice(0, 4);
  if (rel.length) {
    document.getElementById("relacionados").innerHTML = `
      <section class="seccion">
        <div class="seccion-head"><h2>También te puede gustar</h2></div>
        <div class="grid">${rel.map(tarjetaHTML).join("")}</div>
      </section>`;
  }
}

iniciar();