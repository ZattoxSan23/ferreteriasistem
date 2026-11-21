import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes } from "lucide-react";
import { listarCategorias, obtenerProducto } from "@/server/productos";
import { EditarProductoForm } from "@/components/productos/EditarProductoForm";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    obtenerProducto(Number(id)),
    listarCategorias(),
  ]);
  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/productos" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft size={15} /> Volver a productos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{producto.nombre}</h1>
            <p className="font-mono text-xs text-slate-400">{producto.sku}</p>
          </div>
          <Link href={`/inventario/${producto.id}`} className="btn-ghost">
            <Boxes size={16} /> Ver kardex
          </Link>
        </div>
      </div>

      <EditarProductoForm
        producto={{
          id: producto.id,
          sku: producto.sku,
          nombre: producto.nombre,
          unidad: producto.unidad,
          categoriaId: producto.categoriaId,
          precioCompra: producto.precioCompra,
          precioVenta: producto.precioVenta,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          activo: producto.activo,
          categoria: producto.categoria,
        }}
        categorias={categorias}
      />
    </div>
  );
}
