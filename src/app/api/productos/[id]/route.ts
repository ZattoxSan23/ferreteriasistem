import type { NextRequest } from "next/server";
import { actualizarProducto, obtenerProducto } from "@/server/productos";
import { productoUpdateSchema } from "@/lib/validaciones";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const producto = await obtenerProducto(Number(id));
  if (!producto) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return Response.json(producto);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const producto = await actualizarProducto(Number(id), parsed.data);
    return Response.json(producto);
  } catch {
    return Response.json({ error: "No se pudo actualizar el producto." }, { status: 400 });
  }
}
