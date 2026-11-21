import Link from "next/link";
import { FileText, Search, ShoppingCart } from "lucide-react";
import { listarVentas } from "@/server/ventas";
import { fechaHora, formatoSoles } from "@/lib/dinero";

export const dynamic = "force-dynamic";

const colorMetodo: Record<string, string> = {
  EFECTIVO: "bg-emerald-50 text-emerald-700",
  TARJETA: "bg-blue-50 text-blue-700",
  YAPE: "bg-violet-50 text-violet-700",
};

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ventas = await listarVentas(q);
  const totalGeneral = ventas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-sm text-slate-500">
            {ventas.length} boletas · {formatoSoles(totalGeneral)} facturado
          </p>
        </div>
        <Link href="/pos" className="btn-primary">
          <ShoppingCart size={16} /> Nueva venta
        </Link>
      </div>

      <div className="card">
        <div className="border-b border-slate-100 p-4">
          <form className="flex flex-col gap-2 sm:flex-row" action="/ventas">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q ?? ""} placeholder="Buscar por correlativo, cliente o documento..." className="input pl-9" />
            </div>
            <button type="submit" className="btn-dark">Buscar</button>
            {q && <Link href="/ventas" className="btn-ghost">Limpiar</Link>}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Boleta</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Pago</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventas.map((v) => (
                <tr key={v.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{v.correlativo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{v.clienteNombre || "Cliente varios"}</p>
                    <p className="text-xs text-slate-400">{v.clienteDoc || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fechaHora(v.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{v.items.length}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colorMetodo[v.metodoPago] ?? "bg-slate-100 text-slate-600"}`}>
                      {v.metodoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatoSoles(v.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/ventas/${v.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50">
                      <FileText size={14} /> Ver boleta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventas.length === 0 && (
            <p className="py-14 text-center text-sm text-slate-400">No se encontraron ventas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
