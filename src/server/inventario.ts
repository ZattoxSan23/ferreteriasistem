import { prisma } from "@/lib/prisma";

export async function listarMovimientos(opciones?: {
  productoId?: number;
  take?: number;
}) {
  return prisma.movimientoInventario.findMany({
    where: opciones?.productoId ? { productoId: opciones.productoId } : undefined,
    include: { producto: true, venta: true },
    orderBy: { createdAt: "desc" },
    take: opciones?.take ?? 60,
  });
}

export type MovimientoInput = {
  productoId: number;
  tipo: "ENTRADA" | "AJUSTE";
  cantidad: number;
  motivo?: string;
};

export async function registrarMovimiento(input: MovimientoInput) {
  if (!Number.isInteger(input.cantidad)) {
    throw new Error("La cantidad debe ser un número entero.");
  }

  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({
      where: { id: input.productoId },
    });
    if (!producto) throw new Error("Producto no encontrado.");

    let nuevoStock: number;
    let cantidadMovimiento: number;

    if (input.tipo === "ENTRADA") {
      if (input.cantidad <= 0) throw new Error("La cantidad a ingresar debe ser mayor a cero.");
      cantidadMovimiento = input.cantidad;
      nuevoStock = producto.stock + input.cantidad;
    } else {
      if (input.cantidad < 0) throw new Error("El stock ajustado no puede ser negativo.");
      nuevoStock = input.cantidad;
      cantidadMovimiento = nuevoStock - producto.stock;
    }

    const actualizado = await tx.producto.update({
      where: { id: producto.id },
      data: { stock: nuevoStock },
    });

    const movimiento = await tx.movimientoInventario.create({
      data: {
        productoId: producto.id,
        tipo: input.tipo,
        cantidad: cantidadMovimiento,
        stockResultante: nuevoStock,
        motivo: input.motivo?.trim() || (input.tipo === "ENTRADA" ? "Ingreso de mercadería" : "Ajuste de inventario"),
      },
    });

    return { movimiento, producto: actualizado };
  });
}
