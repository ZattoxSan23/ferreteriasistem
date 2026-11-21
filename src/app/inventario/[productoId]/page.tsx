import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { listarMovimientos } from "@/server/inventario";
import { obtenerProducto } from "@/server/productos";
import { fechaHora, formatoSoles } from "@/lib/dinero";
import { TipoBadge } from "@/components/inventario/TipoBadge";

export const dynamic = "force-dynamic";

export default async function KardexPage({
  params,
}: {
  params: Promise<{ productoId: string }>;
}) {
  const { productoId } = await params;
  const producto = await obtenerProducto(Number(productoId));
  if (!producto) notFound();
  const movimientos = await listarMovimientos({ productoId: producto.id, take: 200 });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/inventario" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft size={15} /> Volver a inventario
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Kardex del producto</h1>
        <p className="text-sm text-slate-500">Historial completo de entradas, salidas y ajustes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-3 p-5 lg:col-span-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Package size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{producto.nombre}</p>
            <p className="font-mono text-xs text-slate-400">{producto.sku} · {producto.categoria.nombre}</p>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stock actual</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {producto.stock} <span className="text-sm font-medium text-slate-400">{producto.unidad}</span>
          </p>
          <p className="text-xs text-slate-400">Mínimo: {producto.stockMinimo}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Precio venta</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatoSoles(producto.precioVenta)}</p>
          <p className="text-xs text-slate-400">Compra: {formatoSoles(producto.precioCompra)}</p>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Movimientos ({movimientos.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Cantidad</th>
                <th className="px-4 py-3 font-semibold">Stock resultante</th>
                <th className="px-4 py-3 font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-xs text-slate-400">{fechaHora(m.createdAt)}</td>
                  <td className="px-4 py-3"><TipoBadge tipo={m.tipo} /></td>
                  <td className={`px-4 py-3 font-semibold ${m.cantidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{m.stockResultante}</td>
                  <td className="px-4 py-3 text-slate-500">{m.motivo ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movimientos.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">Sin movimientos para este producto.</p>
          )}
        </div>
      </div>
    </div>
  );
}
