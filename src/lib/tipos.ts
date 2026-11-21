export type CategoriaDTO = { id: number; nombre: string };

export type ProductoDTO = {
  id: number;
  sku: string;
  nombre: string;
  unidad: string;
  categoriaId: number;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  categoria: CategoriaDTO;
};

export type MovimientoDTO = {
  id: number;
  productoId: number;
  tipo: string;
  cantidad: number;
  stockResultante: number;
  motivo: string | null;
  createdAt: string | Date;
  producto: { id: number; nombre: string; sku: string; unidad: string };
  venta?: { id: number; correlativo: string } | null;
};

export type VentaItemDTO = {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type VentaDTO = {
  id: number;
  correlativo: string;
  clienteNombre: string | null;
  clienteDoc: string | null;
  clienteTelefono: string | null;
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: string;
  estado: string;
  referenciaPago?: string | null;
  createdAt: string | Date;
  items: VentaItemDTO[];
};

export type ConfigDTO = {
  nombreFerreteria: string;
  ruc: string;
  direccion: string;
  telefono: string;
  igvPorcentaje: number;
  serieBoleta: string;
};
