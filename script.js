// ============================================================
// Núñez y Asociados — Control de documentación
// Cliente 4 · Sprint 01
//
// Historias:
// CAL-1 — Consultar estado de documentos
// CAL-2 — Marcar documento como recibido
// CAL-3 — Agregar documento requerido
// ============================================================

const STORAGE_KEY = "documentosRequeridosPorCliente_v2";

const CLIENTES_INICIALES = [
  {
    cliente: "Comercializadora Alfa",
    documentos: [
      { nombre: "Factura electrónica", recibido: true },
      { nombre: "Estado de cuenta", recibido: true },
      { nombre: "Identificación fiscal", recibido: true }
    ]
  },
  {
    cliente: "Servicios Rivera",
    documentos: [
      { nombre: "Nómina mensual", recibido: true },
      { nombre: "Comprobantes fiscales", recibido: true },
      { nombre: "Estado de cuenta", recibido: false }
    ]
  },
  {
    cliente: "Grupo Horizonte",
    documentos: [
      { nombre: "Facturas de venta", recibido: true },
      { nombre: "Estado de cuenta", recibido: false },
      { nombre: "Declaración mensual", recibido: false }
    ]
  },
  {
    cliente: "Estudio Norte",
    documentos: [
      { nombre: "Comprobantes de gastos", recibido: true },
      { nombre: "Factura electrónica", recibido: true },
      { nombre: "Declaración mensual", recibido: true }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  inicializarDatos();
  inicializarFecha();
  inicializarDatalist();
  inicializarEventos();
  renderizarTodo();
});


// ============================================================
// Datos
// ============================================================

function inicializarDatos() {
  const guardado = localStorage.getItem(STORAGE_KEY);

  if (!guardado) {
    const datos = {};

    CLIENTES_INICIALES.forEach((cliente) => {
      datos[cliente.cliente] = cliente.documentos.map((documento) => ({
        nombre: documento.nombre,
        recibido: documento.recibido,
        agregadoEl: null,
        recibidoEl: documento.recibido ? new Date().toISOString() : null,
        inicial: true
      }));
    });

    guardarDatos(datos);
    return;
  }

  // Si ya existe información de una versión anterior,
  // se conserva y se agregan los clientes base que aún no existan.
  const datos = JSON.parse(guardado);
  let huboCambios = false;

  CLIENTES_INICIALES.forEach((cliente) => {
    if (!datos[cliente.cliente]) {
      datos[cliente.cliente] = cliente.documentos.map((documento) => ({
        nombre: documento.nombre,
        recibido: documento.recibido,
        agregadoEl: null,
        recibidoEl: documento.recibido ? new Date().toISOString() : null,
        inicial: true
      }));

      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarDatos(datos);
  }
}

function cargarDatos() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  return guardado ? JSON.parse(guardado) : {};
}

function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}


// ============================================================
// Inicialización visual
// ============================================================

function inicializarFecha() {
  const elemento = document.getElementById("fecha-resumen");

  if (!elemento) return;

  elemento.textContent = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric"
  }).format(new Date());
}

function inicializarDatalist() {
  const datalist = document.getElementById("lista-clientes-datalist");

  if (!datalist) return;

  datalist.innerHTML = "";

  Object.keys(cargarDatos())
    .sort()
    .forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente;
      datalist.appendChild(option);
    });
}

function inicializarEventos() {
  const formulario = document.getElementById("form-agregar-documento");
  const cerrarDetalle = document.getElementById("cerrar-detalle");

  if (formulario) {
    formulario.addEventListener("submit", agregarDocumento);
  }

  if (cerrarDetalle) {
    cerrarDetalle.addEventListener("click", cerrarDetalleCliente);
  }
}


// ============================================================
// Render general
// ============================================================

function renderizarTodo() {
  renderizarResumen();
  renderizarClientes();
  renderizarPendientes();
  renderizarDocumentosAgregados();
  inicializarDatalist();
}


// ============================================================
// RESUMEN
// ============================================================

function obtenerEstadisticas(datos) {
  const clientes = Object.entries(datos);

  let totalDocumentos = 0;
  let totalEntregados = 0;

  clientes.forEach(([, documentos]) => {
    totalDocumentos += documentos.length;
    totalEntregados += documentos.filter(
      (documento) => documento.recibido
    ).length;
  });

  return {
    clientes: clientes.length,
    documentos: totalDocumentos,
    entregados: totalEntregados,
    pendientes: totalDocumentos - totalEntregados
  };
}

function renderizarResumen() {
  const estadisticas = obtenerEstadisticas(cargarDatos());

  document.getElementById("total-clientes").textContent =
    estadisticas.clientes;

  document.getElementById("total-documentos").textContent =
    estadisticas.documentos;

  document.getElementById("total-entregados").textContent =
    estadisticas.entregados;

  document.getElementById("total-pendientes").textContent =
    estadisticas.pendientes;
}


// ============================================================
// CAL-1 — Consulta de clientes
// ============================================================

function renderizarClientes() {
  const tabla = document.getElementById("tabla-clientes");
  const tbody = tabla.querySelector("tbody");
  const datos = cargarDatos();

  tbody.innerHTML = "";

  Object.entries(datos)
    .sort(([clienteA], [clienteB]) =>
      clienteA.localeCompare(clienteB, "es")
    )
    .forEach(([cliente, documentos]) => {
      const total = documentos.length;
      const entregados = documentos.filter(
        (documento) => documento.recibido
      ).length;

      const porcentaje = total
        ? Math.round((entregados / total) * 100)
        : 0;

      const estado = obtenerEstado(porcentaje);

      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>
          <span class="client-name">${escapeHTML(cliente)}</span>
        </td>

        <td>
          <span class="documents-count">
            ${entregados} de ${total}
          </span>
        </td>

        <td class="progress-cell">
          <div class="progress-info">
            <span>${porcentaje}%</span>
            <span>${entregados}/${total}</span>
          </div>

          <div
            class="progress-track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${porcentaje}"
            aria-label="Progreso de ${escapeHTML(cliente)}"
          >
            <div
              class="progress-bar"
              style="width: ${porcentaje}%"
            ></div>
          </div>
        </td>

        <td>
          <span class="status ${estado.clase}">
            ${estado.texto}
          </span>
        </td>

        <td class="column-action">
          <button
            class="btn btn-secondary btn-small"
            type="button"
            data-cliente="${escapeHTML(cliente)}"
          >
            Ver documentos
          </button>
        </td>
      `;

      fila
        .querySelector("button")
        .addEventListener("click", () => {
          mostrarDetalleCliente(cliente);
        });

      tbody.appendChild(fila);
    });
}

function obtenerEstado(porcentaje) {
  if (porcentaje === 100) {
    return {
      texto: "Completo",
      clase: "status-completo"
    };
  }

  if (porcentaje > 0) {
    return {
      texto: "Parcial",
      clase: "status-parcial"
    };
  }

  return {
    texto: "Pendiente",
    clase: "status-pendiente"
  };
}

function mostrarDetalleCliente(cliente) {
  const datos = cargarDatos();
  const documentos = datos[cliente] || [];

  const detalle = document.getElementById("detalle-cliente");
  const nombre = document.getElementById("detalle-cliente-nombre");
  const contenedor = document.getElementById("detalle-documentos");

  nombre.textContent = cliente;
  contenedor.innerHTML = "";

  documentos.forEach((documento) => {
    const item = document.createElement("div");
    item.className = "document-item";

    const fecha = documento.recibidoEl
      ? formatearFecha(documento.recibidoEl)
      : "Pendiente de recepción";

    item.innerHTML = `
      <div>
        <span class="document-name">
          ${escapeHTML(documento.nombre)}
        </span>
      </div>

      <div>
        <span class="status ${documento.recibido
        ? "status-entregado"
        : "status-pendiente"
      }">
          ${documento.recibido ? "Recibido" : "Pendiente"}
        </span>
        <div class="document-date">${fecha}</div>
      </div>
    `;

    contenedor.appendChild(item);
  });

  detalle.hidden = false;
  detalle.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function cerrarDetalleCliente() {
  document.getElementById("detalle-cliente").hidden = true;
}


// ============================================================
// CAL-2 — Marcar documento como recibido
// ============================================================

function renderizarPendientes() {
  const tabla = document.getElementById("tabla-marcar-documentos");
  const tbody = tabla.querySelector("tbody");
  const vacio = document.getElementById("pendientes-vacio");
  const datos = cargarDatos();

  const pendientes = [];

  Object.entries(datos).forEach(([cliente, documentos]) => {
    documentos.forEach((documento, indice) => {
      if (!documento.recibido) {
        pendientes.push({
          cliente,
          indice,
          documento
        });
      }
    });
  });

  tbody.innerHTML = "";

  if (pendientes.length === 0) {
    tabla.hidden = true;
    vacio.hidden = false;
    return;
  }

  tabla.hidden = false;
  vacio.hidden = true;

  pendientes.forEach(({ cliente, indice, documento }) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        <span class="client-name">${escapeHTML(cliente)}</span>
      </td>

      <td>${escapeHTML(documento.nombre)}</td>

      <td>
        <span class="status status-pendiente">
          Pendiente
        </span>
      </td>

      <td class="column-action">
        <button
          class="btn btn-small"
          type="button"
        >
          Marcar como recibido
        </button>
      </td>
    `;

    fila
      .querySelector("button")
      .addEventListener("click", () => {
        marcarComoRecibido(cliente, indice);
      });

    tbody.appendChild(fila);
  });
}

function marcarComoRecibido(cliente, indice) {
  const datos = cargarDatos();
  const documento = datos[cliente]?.[indice];

  if (!documento) {
    mostrarMensaje(
      "mensaje-marcar-documento",
      "No se encontró el documento. Intenta de nuevo.",
      true
    );
    return;
  }

  documento.recibido = true;
  documento.recibidoEl = new Date().toISOString();

  guardarDatos(datos);

  renderizarTodo();

  mostrarMensaje(
    "mensaje-marcar-documento",
    `Se marcó "${documento.nombre}" de ${cliente} como recibido.`
  );
}


// ============================================================
// CAL-3 — Agregar documento
// ============================================================

function agregarDocumento(evento) {
  evento.preventDefault();

  const inputCliente = document.getElementById("input-cliente");
  const inputDocumento = document.getElementById("input-documento");

  const cliente = inputCliente.value.trim();
  const documento = inputDocumento.value.trim();

  if (!cliente || !documento) {
    mostrarMensaje(
      "mensaje-agregar-documento",
      "Escribe el cliente y el documento antes de agregar.",
      true
    );
    return;
  }

  const datos = cargarDatos();

  if (!datos[cliente]) {
    mostrarMensaje(
      "mensaje-agregar-documento",
      "Selecciona uno de los clientes registrados.",
      true
    );
    return;
  }

  const yaExiste = datos[cliente].some(
    (item) =>
      item.nombre.toLowerCase() === documento.toLowerCase()
  );

  if (yaExiste) {
    mostrarMensaje(
      "mensaje-agregar-documento",
      `${cliente} ya tiene "${documento}" registrado.`,
      true
    );
    return;
  }

  datos[cliente].push({
    nombre: documento,
    agregadoEl: new Date().toISOString(),
    recibido: false,
    recibidoEl: null,
    inicial: false
  });

  guardarDatos(datos);

  renderizarTodo();

  mostrarMensaje(
    "mensaje-agregar-documento",
    `Se agregó "${documento}" a ${cliente}.`
  );

  document.getElementById("form-agregar-documento").reset();
  inputCliente.focus();
}

function renderizarDocumentosAgregados() {
  const tabla = document.getElementById("tabla-documentos-agregados");
  const tbody = tabla.querySelector("tbody");
  const vacio = document.getElementById("agregados-vacio");
  const datos = cargarDatos();

  const documentos = [];

  Object.entries(datos).forEach(([cliente, lista]) => {
    lista.forEach((documento) => {
      if (!documento.inicial && documento.agregadoEl) {
        documentos.push({
          cliente,
          ...documento
        });
      }
    });
  });

  documentos.sort(
    (a, b) =>
      new Date(b.agregadoEl) -
      new Date(a.agregadoEl)
  );

  tbody.innerHTML = "";

  if (documentos.length === 0) {
    tabla.hidden = true;
    vacio.hidden = false;
    return;
  }

  tabla.hidden = false;
  vacio.hidden = true;

  documentos.slice(0, 8).forEach((documento) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${escapeHTML(documento.cliente)}</td>
      <td>${escapeHTML(documento.nombre)}</td>
      <td>${formatearFecha(documento.agregadoEl)}</td>
    `;

    tbody.appendChild(fila);
  });
}


// ============================================================
// Mensajes y utilidades
// ============================================================

function mostrarMensaje(id, texto, esError = false) {
  const mensaje = document.getElementById(id);

  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.className = esError
    ? "form-mensaje form-mensaje--error"
    : "form-mensaje form-mensaje--ok";

  window.clearTimeout(mensaje._timeout);

  mensaje._timeout = window.setTimeout(() => {
    mensaje.textContent = "";
    mensaje.className = "form-mensaje";
  }, 3500);
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(fecha));
}

function escapeHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
