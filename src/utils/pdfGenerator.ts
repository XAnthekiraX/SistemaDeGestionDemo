import html2pdf from "html2pdf.js";

interface ShipmentItem {
    product_id: string;
    quantity: number;
    name?: string;
}

interface ShipmentData {
    id: string;
    destination: string;
    items: ShipmentItem[];
    status: string;
    created_at: string;
    notes?: string;
}

const cssStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ui-sans-serif, system-ui, sans-serif; }
  .container { padding: 40px; background: white; min-height: 100vh; }
  .card { border: 1px solid #ddd; border-radius: 16px; }
  .header { background: #492360; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100px; border-radius: 16px 16px 0 0; }
  .logo-text { color: white; font-size: 24px; font-weight: bold; }
  .info-row { display: flex; justify-content: space-around; padding: 20px; font-size: 14px; color: #6b7280; }
  .info-item { text-align: center; }
  .info-label { display: block; margin-bottom: 4px; }
  .info-value { color: black; font-weight: bold; }
  .table-section { padding: 0 40px 60px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #e5e7eb; padding: 12px; text-align: left; font-weight: 600; }
  td { padding: 12px; border-bottom: 1px solid #ddd; }
  .qty-col { text-align: right; font-weight: bold; }
  .total-row { padding: 10px 0; text-align: right; font-size: 14px; }
  .total-row strong { margin-left: 8px; }
`;

export const generateShipmentPDF = async (shipment: ShipmentData) => {
    const totalQty = shipment.items.reduce((sum, item) => sum + item.quantity, 0);
    const formattedDate = new Date(shipment.created_at).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const itemsHtml = shipment.items
        .map(
            (item, index) => `
    <tr><td>${index + 1}</td><td>${item.name || "Producto"}</td><td class="qty-col">${item.quantity}</td></tr>
  `,
        )
        .join("");

    const htmlContent = `
    <!DOCTYPE html><html><head><style>${cssStyles}</style></head><body>
    <div class="container"><div class="card">
      <div class="header"><span class="logo-text">SDG - Sistema de Gestión</span></div>
      <div class="info-row">
        <div class="info-item"><span class="info-label">Cliente</span><strong class="info-value">${shipment.destination}</strong></div>
        <div class="info-item"><span class="info-label">Fecha</span><strong class="info-value">${formattedDate}</strong></div>
      </div>
      <div class="table-section">
        <table><thead><tr><th>#</th><th>Producto</th><th style="text-align:right">Cantidad</th></tr></thead>
        <tbody>${itemsHtml}</tbody></table>
        <div class="total-row"><span>TOTAL UNIDADES </span><strong>${totalQty}</strong></div>
      </div>
    </div></div></body></html>
  `;

    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    await html2pdf()
        .set({
            margin: 10,
            filename: `pedido-${shipment.id.substring(0, 8)}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, allowTaint: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save();

    document.body.removeChild(container);
};
