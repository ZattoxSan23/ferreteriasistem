import type { NextRequest } from "next/server";
import { crearVenta, listarVentas } from "@/server/ventas";
import { ventaSchema } from "@/lib/validaciones";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const ventas = await listarVentas(q ?? undefined);
  return Response.json(ventas);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = ventaSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const venta = await crearVenta(parsed.data);
    return Response.json(venta, { status: 201 });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "No se pudo registrar la venta.";
    return Response.json({ error: mensaje }, { status: 400 });
  }
}
