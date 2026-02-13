function restaurarPagina() {
  // Recargar la página para restaurar el idioma original
  window.location.reload();
}
// Carrito de compras
// Al iniciar, intentamos recuperar el carrito guardado en localStorage
// Usamos try/catch para evitar que el carrito se rompa si el JSON está mal formado
let carrito = [];
try {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    if (!Array.isArray(carrito)) throw new Error('El carrito no es un array');
  }
} catch (e) {
  carrito = [];
  // Mostrar mensaje temporal si hay error de formato en el carrito
  if (typeof mostrarMensajeTemporal === 'function') {
    mostrarMensajeTemporal('Error en los datos del carrito. Se ha reiniciado.', 3500);
  } else {
    alert('Error en los datos del carrito. Se ha reiniciado.');
  }
}

// Seleccionar elementos del DOM
const carritoContainer = document.getElementById('carrito-container');
const carritoLista = document.getElementById('carrito-lista');
const carritoTotal = document.getElementById('carrito-total');
const carritoCount = document.getElementById('carrito-count');
const carritoTotalNavbar = document.getElementById('carrito-total-navbar');
const carritoLogoBtn = document.getElementById('carrito-logo-btn');
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

// Modal carrito
const carritoModal = document.getElementById('carrito-modal');
const cerrarCarritoModal = document.getElementById('cerrar-carrito-modal');

// Mostrar modal al clickear el logo del carrito o su botón
if (carritoLogoBtn) {
  carritoLogoBtn.addEventListener('click', () => {
    carritoModal.style.display = 'block';
    actualizarCarrito();
  });
  // Accesibilidad: abrir con Enter o Space
  carritoLogoBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carritoModal.style.display = 'block';
      actualizarCarrito();
    }
  });
}

// Cerrar modal al clickear la X
cerrarCarritoModal.addEventListener('click', () => {
  carritoModal.style.display = 'none';
});

// Cerrar modal al clickear fuera del contenido
window.addEventListener('click', (e) => {
  if (e.target === carritoModal) {
    carritoModal.style.display = 'none';
  }
});


// Detectar ruta correcta del JSON según la ubicación del HTML
const rutaJSON = window.location.pathname.includes('/pages/')
  ? '../productos.json'
  : './productos.json';



// --- ASINCRONISMO: Cargar productos usando async/await (VERSIÓN ANTERIOR, AHORA COMENTADA) ---
/*
async function cargarProductos() {
  try {
    // Esperamos la respuesta del fetch
    const res = await fetch(rutaJSON);
    let data;
    try {
      // Convertimos la respuesta a JSON, puede lanzar error si el formato es inválido
      data = await res.json();
    } catch (jsonError) {
      // Error de formato en el JSON de productos
      mostrarMensajeTemporal('Error de formato en productos.json', 3500);
      throw jsonError;
    }

    // Unimos todas las categorías en un solo array para facilitar la búsqueda
    const productos = [
      ...data["ofertas-destacados"] || [],
      ...data.guitarras || [],
      ...data.bajos || [],
      ...data.accesorios || [],
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
    // Si ocurre un error, lo mostramos en consola y avisamos al usuario
    console.error('Error cargando productos:', error);
    mostrarMensajeTemporal('No se pudieron cargar los productos.', 3500);
  }
}
*/

// --- ASINCRONISMO: Cargar productos usando promesas (then/catch) ---
// MODIFICACIÓN: Ahora se usa la sintaxis de promesas explícitas (then/catch) en vez de async/await.
function cargarProductos() {
  fetch(rutaJSON)
    .then(res => res.json()) // Esto también devuelve una promesa
    .then(data => {
      // Unimos todas las categorías en un solo array para facilitar la búsqueda
      const productos = [
        ...(data["ofertas-destacados"] || []),
        ...(data.guitarras || []),
        ...(data.bajos || []),
        ...(data.accesorios || []),
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
    })
    .catch(error => {
      // Si ocurre un error, lo mostramos en consola y avisamos al usuario
      mostrarMensajeTemporal('No se pudieron cargar los productos.', 3500);
      console.error('Error cargando productos:', error);
    });
}

// Llamamos a la función para cargar los productos al iniciar la página
cargarProductos();



// Función para mostrar un mensaje temporal en pantalla
// Utiliza setTimeout para ocultar el mensaje después de unos segundos
function mostrarMensajeTemporal(mensaje, duracion = 2000) {
  const mensajeDiv = document.getElementById('mensaje-temporal');
  if (!mensajeDiv) return;
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = 'block';
  // Oculta el mensaje después de 'duracion' milisegundos
  setTimeout(() => {
    mensajeDiv.style.display = 'none';
  }, duracion);
}

// Función para agregar productos al carrito
function agregarAlCarrito(producto) {
  try {
    const item = carrito.find(p => p.id === producto.id);

    if (item) {
      item.cantidad++;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();   // Guardar en localStorage
    actualizarCarrito();
    // Mostrar mensaje temporal usando temporizador
    mostrarMensajeTemporal('Producto agregado al carrito');
  } catch (error) {
    // Captura errores inesperados en la operación crítica
    console.error('Error al agregar producto al carrito:', error);
    mostrarMensajeTemporal('Error al agregar producto al carrito.', 3500);
  }
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
    li.innerHTML = `<span>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</span>`;

    // Botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarDelCarrito(item.id));

    li.appendChild(btnEliminar);
    carritoLista.appendChild(li);
  });

  carritoTotal.textContent = `Total: $${total}`;
  if (carritoCount) carritoCount.textContent = `${count}`;
  if (carritoTotalNavbar) carritoTotalNavbar.textContent = `$${total}`;
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(id) {
  try {
    carrito = carrito.filter(p => p.id !== id);
    guardarCarrito();  
    actualizarCarrito();
    mostrarMensajeTemporal('Producto eliminado del carrito', 2000);
  } catch (error) {
    // Captura errores inesperados en la operación crítica
    console.error('Error al eliminar producto del carrito:', error);
    mostrarMensajeTemporal('Error al eliminar producto del carrito.', 3500);
  }
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
