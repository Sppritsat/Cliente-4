// ============================================================
// Núñez y Asociados — punto de entrada
//
// Este archivo es solo el arranque. Cada historia agrega su
// propia lógica dentro de la sección que le corresponde
// (buscar el div con el mismo data-feature que su panel en el HTML).
//
// Sugerencia de estructura al ir creciendo:
//   - un archivo JS por feature (ej. lista-clientes.js) importado aquí,
//     o
//   - una función por feature dentro de este mismo archivo,
// según lo que el equipo decida.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Historia: lista-clientes
  // const panelLista = document.querySelector('[data-feature="lista-clientes"]');

  // Historia: marcar-documento
  // const panelMarcar = document.querySelector('[data-feature="marcar-documento"]');

  // Historia: agregar-documento (CAL-3)
  initAgregarDocumento();
});

// ------------------------------------------------------------
// CAL-3 — Agregar documento requerido a un cliente
// Guarda en localStorage: { "Cliente X": [{nombre, agregadoEl}, ...] }
// ------------------------------------------------------------
function initAgregarDocumento() {
  const STORAGE_KEY = "documentosRequeridosPorCliente";

  const form = document.getElementById("form-agregar-documento");
  if (!form) return; // esta sección no está en esta página

  const inputCliente = document.getElementById("input-cliente");
  const inputDocumento = document.getElementById("input-documento");
  const mensaje = document.getElementById("mensaje-agregar-documento");
  const tabla = document.getElementById("tabla-documentos-agregados");
  const tbody = tabla.querySelector("tbody");
  const datalist = document.getElementById("lista-clientes-datalist");

  function cargarDatos() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : {};
  }

  function guardarDatos(datos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

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
      mostrarMensaje("Escribe el cliente y el documento antes de agregar.", true);
      return;
    }

    if (!datos[cliente]) {
      datos[cliente] = [];
    }

    const yaExiste = datos[cliente].some(
      (doc) => doc.nombre.toLowerCase() === documento.toLowerCase()
    );

    if (yaExiste) {
      mostrarMensaje(`${cliente} ya tiene "${documento}" en su lista.`, true);
      return;
    }

    datos[cliente].push({
      nombre: documento,
      agregadoEl: new Date().toISOString(),
    });

    guardarDatos(datos);
    actualizarDatalist(datos);
    renderizarTabla(datos);

    mostrarMensaje(`Se agregó "${documento}" a ${cliente}.`);
    form.reset();
    inputCliente.focus();
  });
}