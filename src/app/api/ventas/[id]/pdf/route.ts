import type { NextRequest } from "next/server";
import { obtenerConfiguracion, obtenerVenta } from "@/server/ventas";
import { generarBoletaPdf } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venta = await obtenerVenta(Number(id));
  if (!venta) {
    return Response.json({ error: "Venta no encontrada" }, { status: 404 });
  }
  const config = await obtenerConfiguracion();
  if (!config) {
    return Response.json({ error: "Configuración no encontrada" }, { status: 500 });
  }

  const pdf = await generarBoletaPdf(venta, config);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="boleta-${venta.correlativo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
