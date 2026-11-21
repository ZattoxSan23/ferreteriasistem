import type { NextRequest } from "next/server";
import { listarMovimientos, registrarMovimiento } from "@/server/inventario";
import { movimientoSchema } from "@/lib/validaciones";

export async function GET(request: NextRequest) {
  const productoId = request.nextUrl.searchParams.get("productoId");
  const movimientos = await listarMovimientos({
    productoId: productoId ? Number(productoId) : undefined,
  });
  return Response.json(movimientos);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = movimientoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const resultado = await registrarMovimiento(parsed.data);
    return Response.json(resultado, { status: 201 });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "No se pudo registrar el movimiento.";
    return Response.json({ error: mensaje }, { status: 400 });
  }
}
