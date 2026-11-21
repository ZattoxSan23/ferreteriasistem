"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Wallet, X } from "lucide-react";
import { formatoSoles } from "@/lib/dinero";

export function PagoModal({
  monto,
  metodo,
  onCerrar,
  onExito,
}: {
  monto: number;
  metodo: "TARJETA" | "YAPE";
  onCerrar: () => void;
  onExito: (referencia: string) => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar(forzarRechazo: boolean) {
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch("/api/pagos/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto, metodo, forzarRechazo }),
      });
      const data = await res.json();
      if (!res.ok || !data.aprobado) {
        throw new Error(data.mensaje ?? data.error ?? "Pago rechazado.");
      }
      onExito(data.referencia);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar el pago.");
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {metodo === "TARJETA" ? (
              <CreditCard size={18} className="text-orange-500" />
            ) : (
              <Wallet size={18} className="text-violet-500" />
            )}
            <h2 className="font-bold text-slate-900">
              Pago con {metodo === "TARJETA" ? "tarjeta" : "Yape"}
            </h2>
          </div>
          <button onClick={onCerrar} disabled={procesando} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs text-slate-400">Total a pagar</p>
            <p className="text-2xl font-bold">{formatoSoles(monto)}</p>
          </div>

          {metodo === "TARJETA" ? (
            <div className="space-y-3">
              <div>
                <label className="label">Número de tarjeta</label>
                <input className="input font-mono" defaultValue="4111 1111 1111 1111" readOnly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Vencimiento</label>
                  <input className="input" defaultValue="12/29" readOnly />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input" defaultValue="123" readOnly />
                </div>
              </div>
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck size={13} /> Pago procesado de forma segura.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-40 w-40 grid-cols-7 grid-rows-7 gap-1 rounded-xl border-4 border-slate-900 bg-white p-2">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[2px] ${
                      [0, 1, 2, 5, 6, 7, 9, 13, 14, 15, 18, 20, 21, 24, 27, 28, 30, 33, 34, 35, 36, 40, 42, 43, 44, 46, 47, 48].includes(i)
                        ? "bg-slate-900"
                        : "bg-white"
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-slate-500">
                Escanea el QR con Yape o confirma el cobro.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            onClick={() => pagar(false)}
            disabled={procesando}
            className="btn-primary w-full py-2.5"
          >
            {procesando ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {procesando ? "Procesando..." : `Pagar ${formatoSoles(monto)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
