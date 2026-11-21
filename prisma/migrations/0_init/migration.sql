-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'UND',
    "precioCompra" INTEGER NOT NULL,
    "precioVenta" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockResultante" INTEGER NOT NULL,
    "motivo" TEXT,
    "ventaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "correlativo" TEXT NOT NULL,
    "clienteNombre" TEXT,
    "clienteDoc" TEXT,
    "clienteTelefono" TEXT,
    "subtotal" INTEGER NOT NULL,
    "igv" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PAGADA',
    "referenciaPago" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaItem" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "VentaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombreFerreteria" TEXT NOT NULL DEFAULT 'Ferreter??a El Tornillo de Oro',
    "ruc" TEXT NOT NULL DEFAULT '20512345678',
    "direccion" TEXT NOT NULL DEFAULT 'Av. Los Constructores 1234 - Lima',
    "telefono" TEXT NOT NULL DEFAULT '(01) 555-4321',
    "igvPorcentaje" INTEGER NOT NULL DEFAULT 18,
    "serieBoleta" TEXT NOT NULL DEFAULT 'B001',
    "contadorBoleta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_correlativo_key" ON "Venta"("correlativo");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

