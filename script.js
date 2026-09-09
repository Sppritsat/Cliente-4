// ============================================================
<<<<<<< HEAD
// Núñez y Asociados — Consulta de documentos
// CAL-1: Consultar estado de documentos de clientes
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // Obtener el panel correspondiente a CAL-1
  const panelLista = document.querySelector(
    '[data-feature="lista-clientes"]'
  );

  // Datos de ejemplo de los clientes
  if (panelLista) {
    const clientes = [
      {
        cliente: "Juan Pérez",
        documento: "Factura mensual",
        estado: "Entregado"
      },
      {
        cliente: "María López",
        documento: "Comprobante fiscal",
        estado: "Pendiente"
      },
      {
        cliente: "Carlos García",
        documento: "Factura mensual",
        estado: "Entregado"
      },
      {
        cliente: "Ana Martínez",
        documento: "Declaración mensual",
        estado: "Pendiente"
      }
    ];

    // Crear la tabla
    const tabla = document.createElement("table");

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Documento</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const cuerpoTabla = tabla.querySelector("tbody");

    // Agregar cada cliente a la tabla
    clientes.forEach(cliente => {

      const fila = document.createElement("tr");

      const claseEstado =
        cliente.estado === "Entregado"
          ? "status-entregado"
          : "status-pendiente";

      fila.innerHTML = `
        <td>${cliente.cliente}</td>
        <td>${cliente.documento}</td>
        <td class="${claseEstado}">
          ${cliente.estado}
        </td>
      `;

      cuerpoTabla.appendChild(fila);
    });

    // Mostrar la tabla en el panel de CAL-1
    panelLista.appendChild(tabla);
  }
=======
// Núñez y Asociados — punto de entrada
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Historia: lista-clientes (CAL-1 — pendiente de fusionar)
  // const panelLista = document.querySelector('[data-feature="lista-clientes"]');

  // Historia: marcar-documento (CAL-2)
  initMarcarDocumento();
>>>>>>> origin/main

  // Historia: agregar-documento (CAL-3)
  initAgregarDocumento();
});

// ------------------------------------------------------------
// Storage compartido entre CAL-2 y CAL-3
// { "Cliente X": [{ nombre, agregadoEl, recibido, recibidoEl }, ...] }
// ------------------------------------------------------------
const STORAGE_KEY = "documentosRequeridosPorCliente";

function cargarDatos() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  return guardado ? JSON.parse(guardado) : {};
}

function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

// ------------------------------------------------------------
// CAL-2 — Marcar documento como recibido
// ------------------------------------------------------------
function initMarcarDocumento() {
  const tabla = document.getElementById("tabla-marcar-documentos");
  if (!tabla) return; // esta sección no está en esta página

  const tbody = tabla.querySelector("tbody");
  const mensaje = document.getElementById("mensaje-marcar-documento");
  const sinDatos = document.getElementById("marcar-sin-datos");

  function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.className = esError
      ? "form-mensaje form-mensaje--error"
      : "form-mensaje form-mensaje--ok";
    setTimeout(() => {
      mensaje.textContent = "";
      mensaje.className = "form-mensaje";
    }, 3000);
  }

  function renderizarTabla() {
    const datos = cargarDatos();
    tbody.innerHTML = "";
    const filas = [];

    Object.entries(datos).forEach(([cliente, documentos]) => {
      documentos.forEach((doc, indice) => filas.push({ cliente, indice, ...doc }));
    });

    if (filas.length === 0) {
      tabla.hidden = true;
      sinDatos.hidden = false;
      return;
    }

    tabla.hidden = false;
    sinDatos.hidden = true;

    filas
      .sort((a, b) => {
        // pendientes primero, luego por fecha de agregado
        if (Boolean(a.recibido) !== Boolean(b.recibido)) {
          return a.recibido ? 1 : -1;
        }
        return new Date(b.agregadoEl) - new Date(a.agregadoEl);
      })
      .forEach((fila) => {
        const tr = document.createElement("tr");
        const claseEstado = fila.recibido ? "status-entregado" : "status-pendiente";
        const textoEstado = fila.recibido ? "Entregado" : "Pendiente";

        tr.innerHTML = `
          <td>${fila.cliente}</td>
          <td>${fila.nombre}</td>
          <td class="${claseEstado}">${textoEstado}</td>
          <td></td>
        `;

        const celdaAccion = tr.querySelector("td:last-child");

        if (!fila.recibido) {
          const boton = document.createElement("button");
          boton.className = "btn btn-small";
          boton.textContent = "Marcar como recibido";
          boton.addEventListener("click", () => {
            marcarComoRecibido(fila.cliente, fila.indice);
          });
          celdaAccion.appendChild(boton);
        }

        tbody.appendChild(tr);
      });
  }

  function marcarComoRecibido(cliente, indice) {
    const datos = cargarDatos();
    const documento = datos[cliente]?.[indice];

    if (!documento) {
      mostrarMensaje("No se encontró ese documento, intenta de nuevo.", true);
      return;
    }

    documento.recibido = true;
    documento.recibidoEl = new Date().toISOString();

    guardarDatos(datos);
    renderizarTabla();
    mostrarMensaje(`Se marcó "${documento.nombre}" de ${cliente} como recibido.`);
  }

  renderizarTabla();

  // Vuelve a dibujar la tabla si CAL-3 agrega un documento nuevo en la misma sesión
  window.addEventListener("storage", (evento) => {
    if (evento.key === STORAGE_KEY) renderizarTabla();
  });
}

// ------------------------------------------------------------
// CAL-3 — Agregar documento requerido a un cliente
// ------------------------------------------------------------
function initAgregarDocumento() {
  const form = document.getElementById("form-agregar-documento");
  if (!form) return;

  const inputCliente = document.getElementById("input-cliente");
  const inputDocumento = document.getElementById("input-documento");
  const mensaje = document.getElementById("mensaje-agregar-documento");
  const tabla = document.getElementById("tabla-documentos-agregados");
  const tbody = tabla.querySelector("tbody");
  const datalist = document.getElementById("lista-clientes-datalist");

  function actualizarDatalist(datos) {
    datalist.innerHTML = "";
    Object.keys(datos).forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente;
      datalist.appendChild(option);
    });
  }

  function renderizarTabla(datos) {
    tbody.innerHTML = "";
    const filas = [];

    Object.entries(datos).forEach(([cliente, documentos]) => {
      documentos.forEach((doc) => filas.push({ cliente, ...doc }));
    });

    if (filas.length === 0) {
      tabla.hidden = true;
      return;
    }

    filas
      .sort((a, b) => new Date(b.agregadoEl) - new Date(a.agregadoEl))
      .forEach((fila) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${fila.cliente}</td>
          <td>${fila.nombre}</td>
          <td>${new Date(fila.agregadoEl).toLocaleDateString("es-MX")}</td>
        `;
        tbody.appendChild(tr);
      });

    tabla.hidden = false;
  }

  function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.className = esError
      ? "form-mensaje form-mensaje--error"
      : "form-mensaje form-mensaje--ok";

    setTimeout(() => {
      mensaje.textContent = "";
      mensaje.className = "form-mensaje";
    }, 3000);
  }

  let datos = cargarDatos();
  actualizarDatalist(datos);
  renderizarTabla(datos);

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cliente = inputCliente.value.trim();
    const documento = inputDocumento.value.trim();

    if (!cliente || !documento) {
      mostrarMensaje(
        "Escribe el cliente y el documento antes de agregar.",
        true
      );
      return;
    }

    if (!datos[cliente]) {
      datos[cliente] = [];
    }

    const yaExiste = datos[cliente].some(
      (doc) => doc.nombre.toLowerCase() === documento.toLowerCase()
    );

    if (yaExiste) {
      mostrarMensaje(
        `${cliente} ya tiene "${documento}" en su lista.`,
        true
      );
      return;
    }

    datos[cliente].push({
      nombre: documento,
      agregadoEl: new Date().toISOString(),
      recibido: false,
    });

    guardarDatos(datos);
    actualizarDatalist(datos);
    renderizarTabla(datos);

    mostrarMensaje(`Se agregó "${documento}" a ${cliente}.`);
    form.reset();
    inputCliente.focus();
  });
}