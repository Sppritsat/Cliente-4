// ============================================================
// Núñez y Asociados — Consulta de documentos
// CAL-1: Consultar estado de documentos de clientes
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // Obtener el panel correspondiente a CAL-1
  const panelLista = document.querySelector(
    '[data-feature="lista-clientes"]'
  );

  // Datos de ejemplo de los clientes
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
});