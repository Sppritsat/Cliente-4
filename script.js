// ============================================================
// Núñez y Asociados
// Seguimiento de documentos
// Cliente 4 — Sprint de calentamiento
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  initListaClientes();
  initMarcarDocumento();
  initAgregarDocumento();

});


// ============================================================
// Datos iniciales
// ============================================================

const CLIENTES_INICIALES = [
  {
    cliente: "Comercializadora Alfa",
    documento: "Factura electrónica",
    estado: "Entregado"
  },
  {
    cliente: "Servicios Rivera",
    documento: "Nómina mensual",
    estado: "Entregado"
  },
  {
    cliente: "Grupo Horizonte",
    documento: "Facturas de venta",
    estado: "Pendiente"
  },
  {
    cliente: "Estudio Norte",
    documento: "Comprobantes de gastos",
    estado: "Entregado"
  }
];


// ============================================================
// Storage
// ============================================================

const STORAGE_KEY = "documentosRequeridosPorCliente";


function cargarDatos() {

  const guardado = localStorage.getItem(STORAGE_KEY);

  return guardado
    ? JSON.parse(guardado)
    : {};

}


function guardarDatos(datos) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(datos)
  );

}


// ============================================================
// CAL-1
// Consultar estado de documentos de clientes
// ============================================================

function initListaClientes() {

  const panelLista = document.querySelector(
    '[data-feature="lista-clientes"]'
  );

  if (!panelLista) return;


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


  CLIENTES_INICIALES.forEach((cliente) => {

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


  panelLista.appendChild(tabla);

}


// ============================================================
// CAL-2
// Marcar documento como recibido
// ============================================================

function initMarcarDocumento() {

  const tabla = document.getElementById(
    "tabla-marcar-documentos"
  );

  if (!tabla) return;


  const tbody = tabla.querySelector("tbody");

  const mensaje = document.getElementById(
    "mensaje-marcar-documento"
  );

  const sinDatos = document.getElementById(
    "marcar-sin-datos"
  );


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


    Object.entries(datos).forEach(
      ([cliente, documentos]) => {

        documentos.forEach(
          (documento, indice) => {

            filas.push({
              cliente,
              indice,
              ...documento
            });

          }
        );

      }
    );


    if (filas.length === 0) {

      tabla.hidden = true;

      sinDatos.hidden = false;

      return;

    }


    tabla.hidden = false;

    sinDatos.hidden = true;


    filas
      .sort((a, b) => {

        if (
          Boolean(a.recibido) !==
          Boolean(b.recibido)
        ) {

          return a.recibido ? 1 : -1;

        }


        return new Date(b.agregadoEl)
          - new Date(a.agregadoEl);

      })


      .forEach((fila) => {

        const tr = document.createElement("tr");


        const claseEstado =
          fila.recibido
            ? "status-entregado"
            : "status-pendiente";


        const textoEstado =
          fila.recibido
            ? "Entregado"
            : "Pendiente";


        tr.innerHTML = `
          <td>${fila.cliente}</td>

          <td>${fila.nombre}</td>

          <td class="${claseEstado}">
            ${textoEstado}
          </td>

          <td></td>
        `;


        const celdaAccion =
          tr.querySelector("td:last-child");


        if (!fila.recibido) {

          const boton =
            document.createElement("button");


          boton.className =
            "btn btn-small";


          boton.textContent =
            "Marcar como recibido";


          boton.addEventListener(
            "click",
            () => {

              marcarComoRecibido(
                fila.cliente,
                fila.indice
              );

            }
          );


          celdaAccion.appendChild(boton);

        }


        tbody.appendChild(tr);

      });

  }


  function marcarComoRecibido(
    cliente,
    indice
  ) {

    const datos = cargarDatos();


    const documento =
      datos[cliente]?.[indice];


    if (!documento) {

      mostrarMensaje(
        "No se encontró ese documento. Intenta de nuevo.",
        true
      );

      return;

    }


    documento.recibido = true;

    documento.recibidoEl =
      new Date().toISOString();


    guardarDatos(datos);


    renderizarTabla();


    mostrarMensaje(
      `Se marcó "${documento.nombre}" de ${cliente} como recibido.`
    );

  }


  renderizarTabla();


  window.addEventListener(
    "storage",
    (evento) => {

      if (evento.key === STORAGE_KEY) {

        renderizarTabla();

      }

    }
  );

}


// ============================================================
// CAL-3
// Agregar documento requerido
// ============================================================

function initAgregarDocumento() {

  const form =
    document.getElementById(
      "form-agregar-documento"
    );


  if (!form) return;


  const inputCliente =
    document.getElementById(
      "input-cliente"
    );


  const inputDocumento =
    document.getElementById(
      "input-documento"
    );


  const mensaje =
    document.getElementById(
      "mensaje-agregar-documento"
    );


  const tabla =
    document.getElementById(
      "tabla-documentos-agregados"
    );


  const tbody =
    tabla.querySelector("tbody");


  const datalist =
    document.getElementById(
      "lista-clientes-datalist"
    );


  function actualizarDatalist(datos) {

    datalist.innerHTML = "";


    const clientes = new Set([
      ...Object.keys(datos),

      ...CLIENTES_INICIALES.map(
        (cliente) => cliente.cliente
      )
    ]);


    clientes.forEach((cliente) => {

      const option =
        document.createElement("option");


      option.value = cliente;


      datalist.appendChild(option);

    });

  }


  function renderizarTabla(datos) {

    tbody.innerHTML = "";


    const filas = [];


    Object.entries(datos).forEach(
      ([cliente, documentos]) => {

        documentos.forEach(
          (documento) => {

            filas.push({
              cliente,
              ...documento
            });

          }
        );

      }
    );


    if (filas.length === 0) {

      tabla.hidden = true;

      return;

    }


    filas
      .sort(
        (a, b) =>
          new Date(b.agregadoEl)
          -
          new Date(a.agregadoEl)
      )


      .forEach((fila) => {

        const tr =
          document.createElement("tr");


        tr.innerHTML = `
          <td>${fila.cliente}</td>

          <td>${fila.nombre}</td>

          <td>
            ${new Date(
          fila.agregadoEl
        ).toLocaleDateString("es-MX")}
          </td>
        `;


        tbody.appendChild(tr);

      });


    tabla.hidden = false;

  }


  function mostrarMensaje(
    texto,
    esError = false
  ) {

    mensaje.textContent = texto;


    mensaje.className =
      esError
        ? "form-mensaje form-mensaje--error"
        : "form-mensaje form-mensaje--ok";


    setTimeout(() => {

      mensaje.textContent = "";

      mensaje.className =
        "form-mensaje";

    }, 3000);

  }


  let datos = cargarDatos();


  actualizarDatalist(datos);

  renderizarTabla(datos);


  form.addEventListener(
    "submit",
    (evento) => {

      evento.preventDefault();


      const cliente =
        inputCliente.value.trim();


      const documento =
        inputDocumento.value.trim();


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


      const yaExiste =
        datos[cliente].some(
          (doc) =>
            doc.nombre.toLowerCase()
            ===
            documento.toLowerCase()
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

        agregadoEl:
          new Date().toISOString(),

        recibido: false

      });


      guardarDatos(datos);


      actualizarDatalist(datos);

      renderizarTabla(datos);


      mostrarMensaje(
        `Se agregó "${documento}" a ${cliente}.`
      );


      form.reset();

      inputCliente.focus();

    }
  );

}