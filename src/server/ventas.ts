import { prisma } from "@/lib/prisma";
import { desglosarIgv, formatearCorrelativo } from "@/lib/dinero";

export type VentaItemInput = {
  productoId: number;
  cantidad: number;
};

export type CrearVentaInput = {
  clienteNombre?: string;
  clienteDoc?: string;
  clienteTelefono?: string;
  metodoPago: "EFECTIVO" | "TARJETA" | "YAPE";
  referenciaPago?: string;
  items: VentaItemInput[];
};

export async function crearVenta(input: CrearVentaInput) {
  const agrupados = new Map<number, number>();
  for (const item of input.items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      throw new Error("Las cantidades deben ser enteros mayores a cero.");
    }
    agrupados.set(item.productoId, (agrupados.get(item.productoId) ?? 0) + item.cantidad);
  }
  if (agrupados.size === 0) throw new Error("La venta no tiene productos.");

  const ids = [...agrupados.keys()];

  return prisma.$transaction(async (tx) => {
    const productos = await tx.producto.findMany({ where: { id: { in: ids } } });
    const porId = new Map(productos.map((p) => [p.id, p]));

    const lineas = [];
    let total = 0;
    for (const [productoId, cantidad] of agrupados) {
      const producto = porId.get(productoId);
      if (!producto) throw new Error(`Producto ${productoId} no existe.`);
      if (!producto.activo) throw new Error(`"${producto.nombre}" está inactivo.`);
      if (producto.stock < cantidad) {
        throw new Error(
          `Stock insuficiente de "${producto.nombre}". Disponible: ${producto.stock}.`
        );
      }
      const subtotal = producto.precioVenta * cantidad;
      total += subtotal;
      lineas.push({
        productoId,
        descripcion: producto.nombre,
        cantidad,
        precioUnitario: producto.precioVenta,
        subtotal,
      });
    }

    const config = await tx.configuracion.upsert({
      where: { id: 1 },
      update: { contadorBoleta: { increment: 1 } },
      create: { id: 1, contadorBoleta: 1 },
    });
    const correlativo = formatearCorrelativo(config.serieBoleta, config.contadorBoleta);
    const { subtotal, igv } = desglosarIgv(total, config.igvPorcentaje);

    const venta = await tx.venta.create({
      data: {
        correlativo,
        clienteNombre: input.clienteNombre?.trim() || null,
        clienteDoc: input.clienteDoc?.trim() || null,
        clienteTelefono: input.clienteTelefono?.trim() || null,
        subtotal,
        igv,
        total,
        metodoPago: input.metodoPago,
        estado: "PAGADA",
        referenciaPago: input.referenciaPago ?? null,
        items: { create: lineas },
      },
      include: { items: true },
    });

    for (const linea of lineas) {
      const producto = porId.get(linea.productoId)!;
      const nuevoStock = producto.stock - linea.cantidad;
      await tx.producto.update({
        where: { id: producto.id },
        data: { stock: nuevoStock },
      });
      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: "SALIDA",
          cantidad: linea.cantidad,
          stockResultante: nuevoStock,
          motivo: `Venta ${venta.correlativo}`,
          ventaId: venta.id,
        },
      });
    }

    return venta;
  });
}

export async function listarVentas(busqueda?: string) {
  const q = busqueda?.trim();
  return prisma.venta.findMany({
    where: q
      ? {
          OR: [
            { correlativo: { contains: q } },
            { clienteNombre: { contains: q } },
            { clienteDoc: { contains: q } },
          ],
        }
      : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function obtenerVenta(id: number) {
  return prisma.venta.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function obtenerConfiguracion() {
  return prisma.configuracion.findUnique({ where: { id: 1 } });
}
