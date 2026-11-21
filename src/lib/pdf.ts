import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type BoletaItem = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type BoletaVenta = {
  correlativo: string;
  createdAt: Date | string;
  clienteNombre: string | null;
  clienteDoc: string | null;
  clienteTelefono: string | null;
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: string;
  estado: string;
  items: BoletaItem[];
};

export type BoletaConfig = {
  nombreFerreteria: string;
  ruc: string;
  direccion: string;
  telefono: string;
  igvPorcentaje: number;
  serieBoleta: string;
};

function monto(centimos: number): string {
  return `S/ ${(centimos / 100).toFixed(2)}`;
}

function fecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const partes = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(d);
  const hora = new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  }).format(d);
  return `${partes} ${hora}`;
}

function limpiar(texto: string): string {
  return texto
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u00D1\u00F1\u00C9\u00E9\u00C1\u00E1\u00CD\u00ED\u00D3\u00F3\u00DA\u00FA]/g, "");
}

export async function generarBoletaPdf(
  venta: BoletaVenta,
  config: BoletaConfig
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margen = 50;
  const ancho = width - margen * 2;
  const naranja = rgb(0.9, 0.4, 0.05);
  const gris = rgb(0.45, 0.45, 0.45);
  const negro = rgb(0.1, 0.1, 0.1);

  const texto = (
    valor: string,
    x: number,
    y: number,
    tamano = 10,
    fuente: PDFFont = helvetica,
    color = negro
  ) => page.drawText(limpiar(valor), { x, y, size: tamano, font: fuente, color });

  const textoDerecha = (
    valor: string,
    xFin: number,
    y: number,
    tamano = 10,
    fuente: PDFFont = helvetica,
    color = negro
  ) => {
    const limpio = limpiar(valor);
    const anchoTexto = fuente.widthOfTextAtSize(limpio, tamano);
    page.drawText(limpio, { x: xFin - anchoTexto, y, size: tamano, font: fuente, color });
  };

  page.drawRectangle({ x: 0, y: height - 22, width, height: 22, color: naranja });

  let y = height - 60;
  texto(config.nombreFerreteria, margen, y, 18, bold);
  textoDerecha("BOLETA DE VENTA", width - margen, y, 12, bold, naranja);

  y -= 16;
  texto(`RUC: ${config.ruc}`, margen, y, 9, helvetica, gris);
  textoDerecha(`N° ${venta.correlativo}`, width - margen, y, 10, bold);

  y -= 12;
  texto(config.direccion, margen, y, 9, helvetica, gris);
  textoDerecha(fecha(venta.createdAt), width - margen, y, 9, helvetica, gris);

  y -= 12;
  texto(`Tel: ${config.telefono}`, margen, y, 9, helvetica, gris);
  textoDerecha(`Estado: ${venta.estado}`, width - margen, y, 9, helvetica, gris);

  y -= 20;
  page.drawLine({
    start: { x: margen, y },
    end: { x: width - margen, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  y -= 22;
  texto("CLIENTE", margen, y, 9, bold, gris);
  y -= 14;
  texto(venta.clienteNombre || "Cliente varios", margen, y, 11, bold);
  if (venta.clienteDoc) {
    y -= 13;
    texto(`Doc: ${venta.clienteDoc}`, margen, y, 9, helvetica, gris);
  }
  if (venta.clienteTelefono) {
    texto(`Tel: ${venta.clienteTelefono}`, margen + 200, y, 9, helvetica, gris);
  }
  textoDerecha(`Pago: ${venta.metodoPago}`, width - margen, y, 9, helvetica, gris);

  y -= 28;
  const columnas = { desc: margen, cant: margen + 300, unit: margen + 380, subtotal: width - margen };
  page.drawRectangle({
    x: margen,
    y: y - 6,
    width: ancho,
    height: 20,
    color: rgb(0.96, 0.96, 0.96),
  });
  texto("DESCRIPCION", columnas.desc + 6, y, 9, bold, gris);
  texto("CANT.", columnas.cant, y, 9, bold, gris);
  textoDerecha("P. UNIT.", columnas.unit + 55, y, 9, bold, gris);
  textoDerecha("SUBTOTAL", columnas.subtotal - 6, y, 9, bold, gris);

  y -= 22;
  for (const item of venta.items) {
    const descripcion = item.descripcion.length > 44 ? item.descripcion.slice(0, 42) + ".." : item.descripcion;
    texto(descripcion, columnas.desc + 6, y, 9);
    texto(String(item.cantidad), columnas.cant, y, 9);
    textoDerecha(monto(item.precioUnitario), columnas.unit + 55, y, 9);
    textoDerecha(monto(item.subtotal), columnas.subtotal - 6, y, 9);
    y -= 16;
    if (y < 220) break;
  }

  y -= 10;
  page.drawLine({
    start: { x: margen, y },
    end: { x: width - margen, y },
    thickness: 0.8,
    color: rgb(0.88, 0.88, 0.88),
  });

  const xEtiqueta = width - margen - 160;
  const xValor = width - margen - 6;
  y -= 20;
  texto("Subtotal", xEtiqueta, y, 10, helvetica, gris);
  textoDerecha(monto(venta.subtotal), xValor, y, 10);
  y -= 16;
  texto(`IGV (${config.igvPorcentaje}%)`, xEtiqueta, y, 10, helvetica, gris);
  textoDerecha(monto(venta.igv), xValor, y, 10);
  y -= 22;
  page.drawRectangle({
    x: xEtiqueta - 10,
    y: y - 6,
    width: 10 + 6 + (width - margen - xEtiqueta + 10),
    height: 24,
    color: rgb(1, 0.95, 0.88),
  });
  texto("TOTAL", xEtiqueta, y, 12, bold, naranja);
  textoDerecha(monto(venta.total), xValor, y, 13, bold, naranja);

  y -= 44;
  texto("Gracias por su preferencia.", margen, y, 10, bold);
  y -= 14;
  texto(
    "Documento generado electrónicamente.",
    margen,
    y,
    8,
    helvetica,
    gris
  );

  return doc.save();
}
