import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShoppingCart } from "lucide-react";
import { obtenerConfiguracion, obtenerVenta } from "@/server/ventas";
import { fechaHora, formatoSoles } from "@/lib/dinero";
import { BoletaActions } from "@/components/boleta/BoletaActions";

export const dynamic = "force-dynamic";

export default async function BoletaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const { id } = await params;
  const { nueva } = await searchParams;
  const [venta, config] = await Promise.all([
    obtenerVenta(Number(id)),
    obtenerConfiguracion(),
  ]);
  if (!venta || !config) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/ventas" className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ArrowLeft size={15} /> Volver a ventas
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Boleta {venta.correlativo}</h1>
        </div>
        <Link href="/pos" className="btn-ghost">
          <ShoppingCart size={16} /> Nueva venta
        </Link>
      </div>

      {nueva === "1" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Venta registrada con éxito</p>
            <p className="text-xs text-emerald-600">El stock se actualizó y la boleta está lista para enviar.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="border-b border-dashed border-slate-200 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{config.nombreFerreteria}</p>
                <p className="text-xs text-slate-500">RUC: {config.ruc}</p>
                <p className="text-xs text-slate-500">{config.direccion}</p>
                <p className="text-xs text-slate-500">Tel: {config.telefono}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Boleta de venta</p>
                <p className="font-mono text-sm font-bold text-slate-800">{venta.correlativo}</p>
                <p className="mt-1 text-xs text-slate-500">{fechaHora(venta.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Cliente</p>
              <p className="text-sm font-medium text-slate-800">{venta.clienteNombre || "Cliente varios"}</p>
              <p className="text-xs text-slate-500">Doc: {venta.clienteDoc || "—"}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Pago</p>
              <p className="text-sm font-medium text-slate-800">{venta.metodoPago}</p>
              <p className="text-xs text-slate-500">Estado: {venta.estado}</p>
              {venta.referenciaPago && (
                <p className="font-mono text-[10px] text-slate-400">{venta.referenciaPago}</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto px-2">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-semibold">Descripción</th>
                  <th className="px-4 py-2 text-center font-semibold">Cant.</th>
                  <th className="px-4 py-2 text-right font-semibold">P. Unit.</th>
                  <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {venta.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 text-slate-700">{item.descripcion}</td>
                    <td className="px-4 py-2.5 text-center text-slate-600">{item.cantidad}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatoSoles(item.precioUnitario)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-800">{formatoSoles(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed border-slate-200 px-6 py-4">
            <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatoSoles(venta.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IGV ({config.igvPorcentaje}%)</span>
                <span>{formatoSoles(venta.igv)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>{formatoSoles(venta.total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-3">
            <p className="text-center text-[11px] text-slate-400">
              Gracias por su preferencia. Documento generado electrónicamente.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <BoletaActions
            ventaId={venta.id}
            correlativo={venta.correlativo}
            total={venta.total}
            clienteNombre={venta.clienteNombre}
            clienteTelefono={venta.clienteTelefono}
            nombreFerreteria={config.nombreFerreteria}
          />
        </div>
      </div>
    </div>
  );
}
