import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  CreditCard,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { resumenDashboard } from "@/server/resumen";
import { formatoSoles, fechaHora } from "@/lib/dinero";

export const dynamic = "force-dynamic";

const colorMetodo: Record<string, string> = {
  EFECTIVO: "bg-emerald-50 text-emerald-700",
  TARJETA: "bg-blue-50 text-blue-700",
  YAPE: "bg-violet-50 text-violet-700",
};

export default async function DashboardPage() {
  const r = await resumenDashboard();
  const alertas = r.stockBajo.length + r.agotados.length;
  const maxTop = Math.max(1, ...r.topProductos.map((p) => p.cantidad));

  const stats = [
    {
      label: "Ingresos de hoy",
      valor: formatoSoles(r.ingresosHoy),
      detalle: `${r.cantidadVentasHoy} ventas registradas`,
      icono: TrendingUp,
      color: "bg-emerald-500",
    },
    {
      label: "Ventas de hoy",
      valor: String(r.cantidadVentasHoy),
      detalle: "Boletas emitidas",
      icono: Receipt,
      color: "bg-blue-500",
    },
    {
      label: "Productos activos",
      valor: String(r.totalProductos),
      detalle: `${alertas} con stock por atender`,
      icono: Package,
      color: "bg-orange-500",
    },
    {
      label: "Valor del inventario",
      valor: formatoSoles(r.valorInventario),
      detalle: "Costo de mercadería",
      icono: Boxes,
      color: "bg-slate-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumen del día</h1>
          <p className="text-sm text-slate-500">
            Control de inventario y ventas de la ferretería.
          </p>
        </div>
        <Link href="/pos" className="btn-primary">
          <ShoppingCart size={16} />
          Nueva venta
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icono = s.icono;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {s.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{s.valor}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${s.color}`}>
                  <Icono size={18} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{s.detalle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-800">Últimas ventas</h2>
            <Link href="/ventas" className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700">
              Ver todas <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {r.ventasRecientes.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                Aún no hay ventas registradas.
              </p>
            )}
            {r.ventasRecientes.map((v) => (
              <Link
                key={v.id}
                href={`/ventas/${v.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {v.clienteNombre || "Cliente varios"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {v.correlativo} · {fechaHora(v.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${colorMetodo[v.metodoPago] ?? "bg-slate-100 text-slate-600"}`}>
                    {v.metodoPago}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{formatoSoles(v.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <TriangleAlert size={16} className="text-orange-500" />
              Stock por atender
            </h2>
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
              {alertas}
            </span>
          </div>
          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {r.agotados.map((p) => (
              <div key={`ag-${p.id}`} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.sku}</p>
                </div>
                <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                  AGOTADO
                </span>
              </div>
            ))}
            {r.stockBajo.map((p) => (
              <div key={`bajo-${p.id}`} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.sku}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                  {p.stock} {p.unidad}
                </span>
              </div>
            ))}
            {alertas === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                Todo el inventario está en orden.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-800">Productos más vendidos</h2>
          <div className="mt-4 space-y-3">
            {r.topProductos.map((p) => (
              <div key={p.nombre}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate text-slate-700">{p.nombre}</span>
                  <span className="font-semibold text-slate-500">{p.cantidad} und.</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${Math.round((p.cantidad / maxTop) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {r.topProductos.length === 0 && (
              <p className="text-sm text-slate-400">Sin datos de ventas todavía.</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-800">Cobros de hoy</h2>
          <div className="mt-4 space-y-3">
            {[
              { k: "EFECTIVO", icono: Banknote, color: "text-emerald-600 bg-emerald-50" },
              { k: "TARJETA", icono: CreditCard, color: "text-blue-600 bg-blue-50" },
              { k: "YAPE", icono: ShoppingCart, color: "text-violet-600 bg-violet-50" },
            ].map((m) => {
              const Icono = m.icono;
              return (
                <div key={m.k} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>
                      <Icono size={15} />
                    </span>
                    <span className="text-sm text-slate-600">{m.k}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatoSoles(r.porMetodo[m.k] ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
