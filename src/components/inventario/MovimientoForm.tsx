"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, Loader2, Settings2 } from "lucide-react";
import type { ProductoDTO } from "@/lib/tipos";

export function MovimientoForm({ productos }: { productos: ProductoDTO[] }) {
  const router = useRouter();
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA" | "AJUSTE">("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  const seleccionado = productos.find((p) => String(p.id) === productoId);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: Number(productoId),
          tipo,
          cantidad: Number(cantidad),
          motivo: motivo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar.");
      setMensaje({ ok: true, texto: "Movimiento registrado correctamente." });
      setCantidad("");
      setMotivo("");
      router.refresh();
    } catch (e) {
      setMensaje({ ok: false, texto: e instanceof Error ? e.message : "Error inesperado." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card h-fit space-y-4 p-5">
      <h2 className="font-semibold text-slate-800">Registrar movimiento</h2>

      <div>
        <label className="label">Producto</label>
        <select required className="input" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
          <option value="">Selecciona un producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} · stock {p.stock}
            </option>
          ))}
        </select>
        {seleccionado && (
          <p className="mt-1 text-xs text-slate-500">
            {seleccionado.sku} · stock actual: <strong>{seleccionado.stock} {seleccionado.unidad}</strong>
          </p>
        )}
      </div>

      <div>
        <label className="label">Tipo de movimiento</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo("ENTRADA")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              tipo === "ENTRADA"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ArrowDownLeft size={15} /> Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo("AJUSTE")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              tipo === "AJUSTE"
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Settings2 size={15} /> Ajuste
          </button>
        </div>
      </div>

      <div>
        <label className="label">{tipo === "ENTRADA" ? "Cantidad a ingresar" : "Nuevo stock (conteo)"}</label>
        <input
          required
          type="number"
          min={tipo === "ENTRADA" ? "1" : "0"}
          className="input"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="0"
        />
      </div>

      <div>
        <label className="label">Motivo (opcional)</label>
        <input
          className="input"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Compra a proveedor, conteo físico..."
        />
      </div>

      {mensaje && (
        <p className={`rounded-lg px-3 py-2 text-sm font-medium ${mensaje.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {mensaje.texto}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={cargando || !productoId}>
        {cargando ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownLeft size={16} />}
        Registrar movimiento
      </button>
    </form>
  );
}
