import type { NextRequest } from "next/server";
import { crearProducto, listarProductos } from "@/server/productos";
import { productoSchema } from "@/lib/validaciones";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const productos = await listarProductos(q ?? undefined);
  return Response.json(productos);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const producto = await crearProducto(parsed.data);
    return Response.json(producto, { status: 201 });
  } catch (error) {
    const mensaje =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe un producto con ese SKU."
        : "No se pudo crear el producto.";
    return Response.json({ error: mensaje }, { status: 400 });
  }
}
