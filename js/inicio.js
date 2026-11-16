const ICONOS_CAT = {
  Leche: "🥛",
  Quesos: "🧀",
  Yogur: "🍶",
  Mantequilla: "🧈"
};

async function iniciar() {
  await cargarProductos();

  // 1. Categorías
  const cats = [...new Set(PRODUCTOS.map(p => p.categoria))];
  document.getElementById("categorias").innerHTML = cats
    .map(c => `
      <a class="cat" href="productos.html?cat=${encodeURIComponent(c)}">
        <span>${ICONOS_CAT[c] || "🛒"}</span>
        ${c}
      </a>`)
    .join("");

  // 2. Ofertas de la semana (productos con precioAntes, máximo 4)
  const ofertas = PRODUCTOS.filter(p => p.precioAntes).slice(0, 4);
  document.getElementById("ofertas").innerHTML = ofertas.map(tarjetaHTML).join("");

  // 3. Para el desayuno (productos sin oferta o variados, máximo 4)
  const destacados = PRODUCTOS.filter(p => !p.precioAntes).slice(0, 4);
  document.getElementById("destacados").innerHTML = destacados.map(tarjetaHTML).join("");
}

iniciar();