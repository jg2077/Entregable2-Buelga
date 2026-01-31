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

// Evento para mostrar/ocultar el carrito al hacer clic en el logo
carritoLogo.addEventListener('click', () => {
  carritoContainer.style.display =
    carritoContainer.style.display === 'none' ? 'block' : 'none';
});

// Detectar ruta correcta del JSON según la ubicación del HTML
const rutaJSON = window.location.pathname.includes('/pages/')
  ? '../productos.json'
  : './productos.json';

// Cargar productos desde el JSON
fetch(rutaJSON)
  .then(res => res.json())
  .then(data => {
    // Combinar todas las categorías en un solo array
    const productos = [
      ...data["ofertas-destacados"],
      ...data.guitarras,
      ...data.bajos,
      ...data.accesorios,
    ];

    // Seleccionar todos los botones
    const botones = document.querySelectorAll('.boton');

    botones.forEach(boton => {
      const id = parseInt(boton.dataset.id, 10);
      const producto = productos.find(p => p.id === id);

      if (producto) {
        // Mostrar precio en el botón
        boton.textContent = `Comprar $${producto.precio}`;

        // Evento click para agregar al carrito
        boton.addEventListener('click', () => agregarAlCarrito(producto));
      }
    });

    // Al cargar la página, actualizamos el carrito en pantalla
    actualizarCarrito();
  })
  .catch(error => console.error('Error cargando productos:', error));


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
