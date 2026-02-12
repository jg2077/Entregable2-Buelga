function restaurarPagina() {
  // Recargar la página para restaurar el idioma original
  window.location.reload();
}
// Carrito de compras
// Al iniciar, intentamos recuperar el carrito guardado en localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Seleccionar elementos del DOM
const carritoContainer = document.getElementById('carrito-container');
const carritoLista = document.getElementById('carrito-lista');
const carritoTotal = document.getElementById('carrito-total');
const carritoCount = document.getElementById('carrito-count');
const carritoTotalNavbar = document.getElementById('carrito-total-navbar');
const carritoLogo = document.getElementById('carrito-logo');
const btnVaciar = document.getElementById('vaciar-carrito');

// Theme toggle elements (may not exist on all pages)
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark-theme');
     if (themeIcon) { themeIcon.classList.remove('bi-sun'); themeIcon.classList.add('bi-moon'); }
  } else {
     // treat any non-'dark' as clear-theme
     document.documentElement.setAttribute('data-theme', 'clear');
     document.documentElement.classList.add('clear-theme');
     document.documentElement.classList.remove('dark-theme');
     if (themeIcon) { themeIcon.classList.remove('bi-moon'); themeIcon.classList.add('bi-sun'); }
  }
  localStorage.setItem('theme', theme);
}

// Inicializar tema desde localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme || 'clear');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
      const current = localStorage.getItem('theme') === 'dark' ? 'dark' : 'clear';
      const next = current === 'dark' ? 'clear' : 'dark';
    applyTheme(next);
  });
}

// Evento para mostrar/ocultar el carrito al hacer clic en el logo
carritoLogo.addEventListener('click', () => {
  carritoContainer.style.display =
    carritoContainer.style.display === 'none' ? 'block' : 'none';
});


// Detectar ruta correcta del JSON según la ubicación del HTML
const rutaJSON = window.location.pathname.includes('/pages/')
  ? '../productos.json'
  : './productos.json';

// --- ASINCRONISMO: Cargar productos usando fetch ---
// Usamos fetch para obtener los datos del archivo productos.json de forma asíncrona.
// Esto permite que la página no se bloquee mientras se cargan los datos y mejora la experiencia de usuario.
async function cargarProductos() {
  try {
    // Esperamos la respuesta del fetch
    const res = await fetch(rutaJSON);
    // Convertimos la respuesta a JSON
    const data = await res.json();

    // Unimos todas las categorías en un solo array para facilitar la búsqueda
    const productos = [
      ...data["ofertas-destacados"],
      ...data.guitarras,
      ...data.bajos,
      ...data.accesorios,
    ];

    // Seleccionamos todos los botones de compra
    const botones = document.querySelectorAll('.boton');

    botones.forEach(boton => {
      const id = parseInt(boton.dataset.id, 10);
      // Buscamos el producto correspondiente por id
      const producto = productos.find(p => p.id === id);

      if (producto) {
        // Mostramos el precio en el botón
        boton.textContent = `Comprar $${producto.precio}`;

        // Evento click para agregar al carrito
        boton.addEventListener('click', () => agregarAlCarrito(producto));
      }
    });

    // Al cargar la página, actualizamos el carrito en pantalla
    actualizarCarrito();
  } catch (error) {
    // Si ocurre un error, lo mostramos en consola
    console.error('Error cargando productos:', error);
  }
}

// Llamamos a la función asíncrona para cargar los productos al iniciar la página
cargarProductos();


// Función para agregar productos al carrito
function agregarAlCarrito(producto) {
  const item = carrito.find(p => p.id === producto.id);

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();   // Guardar en localStorage
  actualizarCarrito();
}


// Función para actualizar el carrito en pantalla
function actualizarCarrito() {
  carritoLista.innerHTML = '';
  let total = 0;
  let count = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    count += item.cantidad;

    const li = document.createElement('li');
    li.textContent = `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;

    // Botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarDelCarrito(item.id));

    li.appendChild(btnEliminar);
    carritoLista.appendChild(li);
  });

  carritoTotal.textContent = `Total: $${total}`;
  carritoCount.textContent = `${count} items / $${total}`; // actualizar contador con items y total
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();  
  actualizarCarrito();
}

// Vaciar carrito
btnVaciar.addEventListener('click', () => {
  carrito = [];
  guardarCarrito();  
  actualizarCarrito();
});

// Función para guardar el carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}
