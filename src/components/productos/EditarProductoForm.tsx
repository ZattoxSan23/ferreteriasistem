"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { CategoriaDTO, ProductoDTO } from "@/lib/tipos";

export function EditarProductoForm({
  producto,
  categorias,
}: {
  producto: ProductoDTO;
  categorias: CategoriaDTO[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    sku: producto.sku,
    nombre: producto.nombre,
    categoriaId: String(producto.categoriaId),
    unidad: producto.unidad,
    precioCompra: (producto.precioCompra / 100).toFixed(2),
    precioVenta: (producto.precioVenta / 100).toFixed(2),
    stockMinimo: String(producto.stockMinimo),
    activo: producto.activo,
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: form.sku,
          nombre: form.nombre,
          categoriaId: Number(form.categoriaId),
          unidad: form.unidad,
          precioCompra: Math.round(Number(form.precioCompra) * 100),
          precioVenta: Math.round(Number(form.precioVenta) * 100),
          stockMinimo: Number(form.stockMinimo),
          activo: form.activo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      setMensaje({ ok: true, texto: "Cambios guardados correctamente." });
      router.refresh();
    } catch (e) {
      setMensaje({ ok: false, texto: e instanceof Error ? e.message : "Error inesperado." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SKU</label>
          <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div>
          <label className="label">Categoría</label>
          <select className="input" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Nombre</label>
        <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Unidad</label>
          <input className="input" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} />
        </div>
        <div>
          <label className="label">Precio compra (S/)</label>
          <input type="number" min="0" step="0.01" className="input" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} />
        </div>
        <div>
          <label className="label">Precio venta (S/)</label>
          <input type="number" min="0" step="0.01" className="input" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Stock actual</label>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">
              {producto.stock} {producto.unidad}
            </span>
            <span className="text-[11px] text-slate-400">Se modifica desde Inventario</span>
          </div>
        </div>
        <div>
          <label className="label">Stock mínimo</label>
          <input type="number" min="0" className="input" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.activo}
          onChange={(e) => setForm({ ...form, activo: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
        />
        Producto activo (disponible para la venta)
      </label>

      {mensaje && (
        <p className={`rounded-lg px-3 py-2 text-sm font-medium ${mensaje.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {mensaje.texto}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
