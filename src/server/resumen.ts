import { prisma } from "@/lib/prisma";

function inicioDiaLima(): Date {
  const ahora = new Date();
  const lima = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate(), 5, 0, 0)
  );
}

export async function resumenDashboard() {
  const inicioHoy = inicioDiaLima();

  const [ventasHoy, ventasRecientes, todosProductos, ranking] = await Promise.all([
    prisma.venta.findMany({
      where: { createdAt: { gte: inicioHoy } },
      select: { total: true, metodoPago: true },
    }),
    prisma.venta.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
    prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
    }),
    prisma.ventaItem.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    }),
  ]);

  const ingresosHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0);
  const porMetodo = ventasHoy.reduce<Record<string, number>>((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] ?? 0) + v.total;
    return acc;
  }, {});

  const stockBajo = todosProductos
    .filter((p) => p.stock > 0 && p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock - b.stock);
  const agotados = todosProductos.filter((p) => p.stock <= 0);
  const valorInventario = todosProductos.reduce(
    (acc, p) => acc + p.stock * p.precioCompra,
    0
  );

  const ids = ranking.map((r) => r.productoId);
  const productosRanking = await prisma.producto.findMany({
    where: { id: { in: ids } },
    select: { id: true, nombre: true },
  });
  const nombres = new Map(productosRanking.map((p) => [p.id, p.nombre]));
  const topProductos = ranking.map((r) => ({
    nombre: nombres.get(r.productoId) ?? "Producto",
    cantidad: r._sum.cantidad ?? 0,
  }));

  return {
    ingresosHoy,
    cantidadVentasHoy: ventasHoy.length,
    porMetodo,
    ventasRecientes,
    stockBajo,
    agotados,
    valorInventario,
    totalProductos: todosProductos.length,
    topProductos,
  };
}
