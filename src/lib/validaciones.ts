import { z } from "zod";

export const productoSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio").max(40),
  nombre: z.string().min(2, "El nombre es obligatorio").max(120),
  categoriaId: z.number().int().positive(),
  unidad: z.string().min(1).max(12),
  precioCompra: z.number().int().min(0),
  precioVenta: z.number().int().min(1),
  stock: z.number().int().min(0),
  stockMinimo: z.number().int().min(0),
});

export const productoUpdateSchema = productoSchema
  .omit({ stock: true })
  .partial()
  .extend({ activo: z.boolean().optional() });

export const movimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(["ENTRADA", "AJUSTE"]),
  cantidad: z.number().int().min(0),
  motivo: z.string().max(160).optional(),
});

export const ventaSchema = z.object({
  clienteNombre: z.string().max(120).optional(),
  clienteDoc: z.string().max(20).optional(),
  clienteTelefono: z.string().max(20).optional(),
  metodoPago: z.enum(["EFECTIVO", "TARJETA", "YAPE"]),
  referenciaPago: z.string().max(80).optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
      })
    )
    .min(1, "Agrega al menos un producto"),
});

export const pagoSchema = z.object({
  monto: z.number().int().positive(),
  metodo: z.enum(["TARJETA", "YAPE"]),
  forzarRechazo: z.boolean().optional(),
});

export type ProductoForm = z.infer<typeof productoSchema>;
export type VentaForm = z.infer<typeof ventaSchema>;
