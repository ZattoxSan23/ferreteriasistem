import Link from "next/link";
import { Boxes, Pencil, Plus, Search } from "lucide-react";
import { listarCategorias, listarProductos } from "@/server/productos";
import { formatoSoles } from "@/lib/dinero";
import { NuevoProductoModal } from "@/components/productos/NuevoProductoModal";

export const dynamic = "force-dynamic";

function BadgeStock({ stock, minimo, unidad }: { stock: number; minimo: number; unidad: string }) {
  if (stock <= 0) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">Agotado</span>;
  }
  if (stock <= minimo) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        {stock} {unidad} · bajo
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
      {stock} {unidad}
    </span>
  );
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [productos, categorias] = await Promise.all([
    listarProductos(q),
    listarCategorias(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            {productos.length} productos en catálogo · {categorias.length} categorías
          </p>
        </div>
        <NuevoProductoModal categorias={categorias} />
      </div>

      <div className="card">
        <div className="border-b border-slate-100 p-4">
          <form className="flex flex-col gap-2 sm:flex-row" action="/productos">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Buscar por nombre o SKU..."
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-dark">Buscar</button>
            {q && (
              <Link href="/productos" className="btn-ghost">Limpiar</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">P. venta</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{p.nombre}</p>
                    <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.categoria.nombre}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatoSoles(p.precioVenta)}
                  </td>
                  <td className="px-4 py-3">
                    <BadgeStock stock={p.stock} minimo={p.stockMinimo} unidad={p.unidad} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.activo ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/inventario/${p.id}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Ver kardex"
                      >
                        <Boxes size={16} />
                      </Link>
                      <Link
                        href={`/productos/${p.id}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <Plus className="text-slate-300" size={28} />
              <p className="text-sm text-slate-400">No se encontraron productos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
