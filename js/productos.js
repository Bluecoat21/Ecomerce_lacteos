const params = new URLSearchParams(location.search);

const filtros = {
  q: (params.get("q") || "").toLowerCase().trim(),
  cat: params.get("cat") || "",
  marcas: new Set(),
  max: Infinity,
  oferta: params.get("oferta") === "1",
  fav: params.get("fav") === "1",
  orden: "relevancia"
};

async function iniciar() {
  await cargarProductos();
  pintarFiltros();
  pintar();
}

function pintarFiltros() {
  const cats = [...new Set(PRODUCTOS.map(p => p.categoria))];
  const marcas = [...new Set(PRODUCTOS.map(p => p.marca))];
  const maxPrecio = Math.ceil(Math.max(...PRODUCTOS.map(p => p.precio)));
  filtros.max = maxPrecio;

  document.getElementById("filtros").innerHTML = `
    <h4>Categoría</h4>
    <label><input type="radio" name="cat" value="" ${!filtros.cat ? "checked" : ""}> Todas</label>
    ${cats.map(c => `
      <label><input type="radio" name="cat" value="${c}" ${filtros.cat === c ? "checked" : ""}> ${c}</label>
    `).join("")}

    <h4>Marca</h4>
    ${marcas.map(m => `
      <label><input type="checkbox" name="marca" value="${m}"> ${m}</label>
    `).join("")}

    <h4>Precio máximo: <span id="precio-val">${dinero(maxPrecio)}</span></h4>
    <input type="range" name="precio" min="1" max="${maxPrecio}" value="${maxPrecio}" step="1">

    <h4>Ofertas</h4>
    <label><input type="checkbox" name="oferta" ${filtros.oferta ? "checked" : ""}> Solo con descuento</label>

    <h4></h4>
    <a class="link" href="productos.html">Limpiar filtros</a>
  `;
}

function pintar() {
  let lista = PRODUCTOS.filter(p => {
    if (filtros.q && !(p.nombre + " " + p.marca + " " + p.categoria).toLowerCase().includes(filtros.q)) return false;
    if (filtros.cat && p.categoria !== filtros.cat) return false;
    if (filtros.marcas.size && !filtros.marcas.has(p.marca)) return false;
    if (p.precio > filtros.max) return false;
    if (filtros.oferta && !p.precioAntes) return false;
    if (filtros.fav && !esFav(p.id)) return false;
    return true;
  });

  if (filtros.orden === "menor") lista.sort((a, b) => a.precio - b.precio);
  if (filtros.orden === "mayor") lista.sort((a, b) => b.precio - a.precio);
  if (filtros.orden === "descuento") lista.sort((a, b) => descuento(b) - descuento(a));
  if (filtros.orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

  let titulo = "Todos los productos";
  if (filtros.fav) titulo = "Mis favoritos";
  else if (filtros.q) titulo = "Resultados para “" + filtros.q + "”";
  else if (filtros.cat) titulo = filtros.cat;
  else if (filtros.oferta) titulo = "Ofertas";
  document.getElementById("titulo").textContent = titulo;

  document.getElementById("conteo").textContent =
    lista.length + (lista.length === 1 ? " producto" : " productos");

  document.getElementById("grid").innerHTML = lista.length
    ? lista.map(tarjetaHTML).join("")
    : `<p class="vacio" style="grid-column:1/-1">No encontramos productos con esos filtros. Prueba quitando alguno.</p>`;
}

// Se llama desde app.js cuando se marca/desmarca un favorito
function alCambiarFavs() {
  if (filtros.fav) pintar();
}

// ---- Eventos ----
document.getElementById("filtros").addEventListener("input", e => {
  const t = e.target;
  if (t.name === "cat") filtros.cat = t.value;
  else if (t.name === "marca") t.checked ? filtros.marcas.add(t.value) : filtros.marcas.delete(t.value);
  else if (t.name === "oferta") filtros.oferta = t.checked;
  else if (t.name === "precio") {
    filtros.max = Number(t.value);
    document.getElementById("precio-val").textContent = dinero(filtros.max);
  }
  pintar();
});

document.getElementById("orden").addEventListener("change", e => {
  filtros.orden = e.target.value;
  pintar();
});

document.getElementById("toggle-filtros").addEventListener("click", e => {
  const oculto = document.getElementById("catalogo").classList.toggle("sin-filtros");
  e.target.textContent = oculto ? "Mostrar filtros" : "Ocultar filtros";
});

iniciar();