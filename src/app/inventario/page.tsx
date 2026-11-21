import Link from "next/link";
import { Boxes } from "lucide-react";
import { listarMovimientos } from "@/server/inventario";
import { listarProductos } from "@/server/productos";
import { fechaHora } from "@/lib/dinero";
import { MovimientoForm } from "@/components/inventario/MovimientoForm";
import { TipoBadge } from "@/components/inventario/TipoBadge";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const [movimientos, productos] = await Promise.all([
    listarMovimientos({ take: 60 }),
    listarProductos(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
        <p className="text-sm text-slate-500">
          Registra ingresos de mercadería y revisa el kardex de cada producto.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MovimientoForm productos={productos} />

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Boxes size={16} className="text-orange-500" /> Movimientos recientes
            </h2>
            <span className="text-xs text-slate-400">{movimientos.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Cant.</th>
                  <th className="px-4 py-3 font-semibold">Stock final</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link href={`/inventario/${m.productoId}`} className="font-medium text-slate-800 hover:text-orange-600">
                        {m.producto.nombre}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-400">{m.producto.sku}</p>
                    </td>
                    <td className="px-4 py-3"><TipoBadge tipo={m.tipo} /></td>
                    <td className={`px-4 py-3 font-semibold ${m.cantidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{m.stockResultante}</td>
                    <td className="px-4 py-3 text-slate-500">{m.motivo ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{fechaHora(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movimientos.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">Sin movimientos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
