import { prisma } from "@/lib/prisma";

export async function listarProductos(busqueda?: string) {
  const q = busqueda?.trim();
  return prisma.producto.findMany({
    where: q
      ? {
          OR: [
            { nombre: { contains: q } },
            { sku: { contains: q } },
          ],
        }
      : undefined,
    include: { categoria: true },
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
  });
}

export async function listarCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
}

export async function obtenerProducto(id: number) {
  return prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
}

export type ProductoInput = {
  sku: string;
  nombre: string;
  categoriaId: number;
  unidad: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
};

export async function crearProducto(data: ProductoInput) {
  const sku = data.sku.trim().toUpperCase();
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.create({
      data: {
        sku,
        nombre: data.nombre.trim(),
        categoriaId: data.categoriaId,
        unidad: data.unidad.trim().toUpperCase() || "UND",
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
      },
    });
    if (data.stock > 0) {
      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: "ENTRADA",
          cantidad: data.stock,
          stockResultante: data.stock,
          motivo: "Stock inicial",
        },
      });
    }
    return producto;
  });
}

export type ProductoUpdate = Partial<Omit<ProductoInput, "stock">> & {
  activo?: boolean;
};

export async function actualizarProducto(id: number, data: ProductoUpdate) {
  return prisma.producto.update({
    where: { id },
    data: {
      ...data,
      ...(data.sku ? { sku: data.sku.trim().toUpperCase() } : {}),
      ...(data.nombre ? { nombre: data.nombre.trim() } : {}),
    },
  });
}
