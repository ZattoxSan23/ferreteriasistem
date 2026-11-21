import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categorias = [
  { nombre: "Herramientas", prefijo: "HER" },
  { nombre: "Electricidad", prefijo: "ELE" },
  { nombre: "Plomería", prefijo: "PLO" },
  { nombre: "Pintura", prefijo: "PIN" },
  { nombre: "Tornillería", prefijo: "TOR" },
  { nombre: "Seguridad", prefijo: "SEG" },
];

type ProductoSeed = {
  cat: string;
  nombre: string;
  unidad: string;
  compra: number;
  venta: number;
  stock: number;
  minimo: number;
};

const productos: ProductoSeed[] = [
  { cat: "HER", nombre: 'Martillo de acero 16oz', unidad: "UND", compra: 1800, venta: 2900, stock: 24, minimo: 5 },
  { cat: "HER", nombre: 'Destornillador plano 6"', unidad: "UND", compra: 600, venta: 1100, stock: 40, minimo: 8 },
  { cat: "HER", nombre: 'Destornillador estrella 6"', unidad: "UND", compra: 600, venta: 1100, stock: 35, minimo: 8 },
  { cat: "HER", nombre: "Juego de llaves mixtas 12 pzs", unidad: "JGO", compra: 8500, venta: 13900, stock: 10, minimo: 3 },
  { cat: "HER", nombre: "Taladro percutor 650W", unidad: "UND", compra: 18000, venta: 27900, stock: 8, minimo: 2 },
  { cat: "HER", nombre: 'Alicate universal 8"', unidad: "UND", compra: 1200, venta: 2200, stock: 20, minimo: 5 },
  { cat: "HER", nombre: "Sierra circular 1400W", unidad: "UND", compra: 28000, venta: 39900, stock: 4, minimo: 2 },
  { cat: "HER", nombre: "Cinta métrica 5m", unidad: "UND", compra: 900, venta: 1700, stock: 30, minimo: 6 },

  { cat: "ELE", nombre: "Cable THW 2.5mm x 100m", unidad: "ROLLO", compra: 12000, venta: 18500, stock: 12, minimo: 3 },
  { cat: "ELE", nombre: "Cable THW 1.5mm x 100m", unidad: "ROLLO", compra: 8000, venta: 12500, stock: 15, minimo: 3 },
  { cat: "ELE", nombre: "Tomacorriente doble", unidad: "UND", compra: 350, venta: 750, stock: 60, minimo: 10 },
  { cat: "ELE", nombre: "Interruptor simple", unidad: "UND", compra: 300, venta: 650, stock: 55, minimo: 10 },
  { cat: "ELE", nombre: "Foco LED 9W", unidad: "UND", compra: 500, venta: 1100, stock: 80, minimo: 15 },
  { cat: "ELE", nombre: "Breaker 2x20A", unidad: "UND", compra: 1800, venta: 3200, stock: 25, minimo: 5 },
  { cat: "ELE", nombre: "Cinta aislante", unidad: "UND", compra: 150, venta: 400, stock: 100, minimo: 15 },

  { cat: "PLO", nombre: 'Tubo PVC 1/2" x 5m', unidad: "UND", compra: 900, venta: 1700, stock: 40, minimo: 8 },
  { cat: "PLO", nombre: 'Codo PVC 1/2"', unidad: "UND", compra: 80, venta: 250, stock: 200, minimo: 30 },
  { cat: "PLO", nombre: "Pegamento PVC 1/4 galón", unidad: "UND", compra: 1200, venta: 2200, stock: 18, minimo: 4 },
  { cat: "PLO", nombre: 'Llave de paso 1/2"', unidad: "UND", compra: 1000, venta: 1900, stock: 30, minimo: 6 },
  { cat: "PLO", nombre: "Inodoro one piece", unidad: "UND", compra: 22000, venta: 32900, stock: 5, minimo: 2 },
  { cat: "PLO", nombre: "Grifo de jardín", unidad: "UND", compra: 800, venta: 1600, stock: 25, minimo: 5 },

  { cat: "PIN", nombre: "Pintura látex blanco 1 galón", unidad: "UND", compra: 2200, venta: 3600, stock: 30, minimo: 6 },
  { cat: "PIN", nombre: "Pintura esmalte negro 1/4 galón", unidad: "UND", compra: 1500, venta: 2700, stock: 20, minimo: 5 },
  { cat: "PIN", nombre: "Thinner 1L", unidad: "UND", compra: 800, venta: 1500, stock: 40, minimo: 8 },
  { cat: "PIN", nombre: 'Brocha 3"', unidad: "UND", compra: 350, venta: 800, stock: 50, minimo: 10 },
  { cat: "PIN", nombre: 'Rodillo 9"', unidad: "UND", compra: 700, venta: 1400, stock: 35, minimo: 8 },

  { cat: "TOR", nombre: 'Tornillo autoperforante 8x1" x100', unidad: "BOLSA", compra: 600, venta: 1200, stock: 45, minimo: 10 },
  { cat: "TOR", nombre: 'Clavo de acero 2" 1kg', unidad: "UND", compra: 500, venta: 1000, stock: 60, minimo: 12 },
  { cat: "TOR", nombre: 'Tuerca hexagonal 1/4" x100', unidad: "BOLSA", compra: 400, venta: 900, stock: 40, minimo: 10 },
  { cat: "TOR", nombre: 'Arandela plana 1/4" x100', unidad: "BOLSA", compra: 300, venta: 700, stock: 50, minimo: 10 },

  { cat: "SEG", nombre: "Guantes de cuero", unidad: "PAR", compra: 700, venta: 1500, stock: 40, minimo: 8 },
  { cat: "SEG", nombre: "Casco de seguridad", unidad: "UND", compra: 1500, venta: 2800, stock: 20, minimo: 5 },
  { cat: "SEG", nombre: "Lentes de protección", unidad: "UND", compra: 500, venta: 1200, stock: 60, minimo: 10 },
  { cat: "SEG", nombre: "Mascarilla N95", unidad: "UND", compra: 300, venta: 800, stock: 90, minimo: 20 },
];

function desglosarIgv(total: number) {
  const subtotal = Math.round(total / 1.18);
  return { subtotal, igv: total - subtotal };
}

async function main() {
  const [productosExistentes, configuracionExistente] = await Promise.all([
    prisma.producto.count(),
    prisma.configuracion.count(),
  ]);

  if (productosExistentes > 0 || configuracionExistente > 0) {
    console.log("La base de datos ya tiene datos. Se omite la carga inicial.");
    return;
  }

  console.log("Limpiando datos...");
  await prisma.movimientoInventario.deleteMany();
  await prisma.ventaItem.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.configuracion.deleteMany();

  console.log("Creando configuración y categorías...");
  await prisma.configuracion.create({
    data: { id: 1, contadorBoleta: 0 },
  });

  const porPrefijo = new Map<string, number>();
  for (const c of categorias) {
    const creada = await prisma.categoria.create({ data: { nombre: c.nombre } });
    porPrefijo.set(c.prefijo, creada.id);
  }

  console.log("Creando productos...");
  const contadorSKU = new Map<string, number>();
  const creados: { id: number; venta: number }[] = [];

  for (const p of productos) {
    const n = (contadorSKU.get(p.cat) ?? 0) + 1;
    contadorSKU.set(p.cat, n);
    const sku = `FER-${p.cat}-${String(n).padStart(3, "0")}`;
    const producto = await prisma.producto.create({
      data: {
        sku,
        nombre: p.nombre,
        categoriaId: porPrefijo.get(p.cat)!,
        unidad: p.unidad,
        precioCompra: p.compra,
        precioVenta: p.venta,
        stock: p.stock,
        stockMinimo: p.minimo,
      },
    });
    creados.push({ id: producto.id, venta: producto.precioVenta });
  }

  console.log("Creando ventas de ejemplo...");
  const ahora = new Date();
  const ventasSeed = [
    {
      diasAtras: 2,
      cliente: { nombre: "Carlos Mendoza", doc: "45678912", telefono: "987654321" },
      metodoPago: "EFECTIVO",
      items: [
        { idx: 0, cantidad: 1 },
        { idx: 1, cantidad: 2 },
        { idx: 27, cantidad: 2 },
      ],
    },
    {
      diasAtras: 1,
      cliente: { nombre: "María Quispe", doc: "70123456", telefono: "912345678" },
      metodoPago: "TARJETA",
      items: [
        { idx: 4, cantidad: 1 },
        { idx: 8, cantidad: 1 },
      ],
    },
    {
      diasAtras: 0,
      cliente: { nombre: "Constructora Andina SAC", doc: "20556677889", telefono: "999888777" },
      metodoPago: "YAPE",
      items: [
        { idx: 12, cantidad: 6 },
        { idx: 15, cantidad: 10 },
        { idx: 16, cantidad: 20 },
        { idx: 31, cantidad: 4 },
      ],
    },
  ];

  let numero = 0;
  for (const v of ventasSeed) {
    numero += 1;
    const fecha = new Date(ahora.getTime() - v.diasAtras * 24 * 60 * 60 * 1000);
    const lineas = v.items.map((it) => {
      const prod = creados[it.idx];
      return {
        productoId: prod.id,
        descripcion: productos[it.idx].nombre,
        cantidad: it.cantidad,
        precioUnitario: prod.venta,
        subtotal: prod.venta * it.cantidad,
      };
    });
    const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);
    const { subtotal, igv } = desglosarIgv(total);

    const venta = await prisma.venta.create({
      data: {
        correlativo: `B001-${String(numero).padStart(6, "0")}`,
        clienteNombre: v.cliente.nombre,
        clienteDoc: v.cliente.doc,
        clienteTelefono: v.cliente.telefono,
        subtotal,
        igv,
        total,
        metodoPago: v.metodoPago,
        estado: "PAGADA",
        referenciaPago: `TRX-${Date.now()}-${numero}`,
        createdAt: fecha,
        items: { create: lineas },
      },
    });

    for (const linea of lineas) {
      const prod = await prisma.producto.findUnique({ where: { id: linea.productoId } });
      if (!prod) continue;
      const nuevoStock = prod.stock - linea.cantidad;
      await prisma.producto.update({
        where: { id: prod.id },
        data: { stock: nuevoStock },
      });
      await prisma.movimientoInventario.create({
        data: {
          productoId: prod.id,
          tipo: "SALIDA",
          cantidad: linea.cantidad,
          stockResultante: nuevoStock,
          motivo: `Venta ${venta.correlativo}`,
          ventaId: venta.id,
          createdAt: fecha,
        },
      });
    }
  }

  await prisma.configuracion.update({
    where: { id: 1 },
    data: { contadorBoleta: numero },
  });

  console.log(`Listo: ${productos.length} productos y ${numero} ventas de ejemplo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
