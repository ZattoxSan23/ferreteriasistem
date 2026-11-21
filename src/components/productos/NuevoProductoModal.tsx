"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import type { CategoriaDTO } from "@/lib/tipos";

const inicial = {
  sku: "",
  nombre: "",
  categoriaId: "",
  unidad: "UND",
  precioCompra: "",
  precioVenta: "",
  stock: "",
  stockMinimo: "5",
};

export function NuevoProductoModal({ categorias }: { categorias: CategoriaDTO[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function cambiar(campo: keyof typeof inicial, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function cerrar() {
    setAbierto(false);
    setError(null);
    setForm(inicial);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: form.sku,
          nombre: form.nombre,
          categoriaId: Number(form.categoriaId),
          unidad: form.unidad,
          precioCompra: Math.round(Number(form.precioCompra || 0) * 100),
          precioVenta: Math.round(Number(form.precioVenta || 0) * 100),
          stock: Number(form.stock || 0),
          stockMinimo: Number(form.stockMinimo || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      cerrar();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setAbierto(true)}>
        <Plus size={16} /> Nuevo producto
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Nuevo producto</h2>
              <button onClick={cerrar} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={guardar} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">SKU</label>
                  <input required className="input" value={form.sku} onChange={(e) => cambiar("sku", e.target.value)} placeholder="FER-HER-035" />
                </div>
                <div>
                  <label className="label">Categoría</label>
                  <select required className="input" value={form.categoriaId} onChange={(e) => cambiar("categoriaId", e.target.value)}>
                    <option value="">Selecciona...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Nombre</label>
                <input required className="input" value={form.nombre} onChange={(e) => cambiar("nombre", e.target.value)} placeholder="Descripción del producto" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Unidad</label>
                  <input className="input" value={form.unidad} onChange={(e) => cambiar("unidad", e.target.value)} />
                </div>
                <div>
                  <label className="label">Precio compra (S/)</label>
                  <input required type="number" min="0" step="0.01" className="input" value={form.precioCompra} onChange={(e) => cambiar("precioCompra", e.target.value)} />
                </div>
                <div>
                  <label className="label">Precio venta (S/)</label>
                  <input required type="number" min="0" step="0.01" className="input" value={form.precioVenta} onChange={(e) => cambiar("precioVenta", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Stock inicial</label>
                  <input required type="number" min="0" className="input" value={form.stock} onChange={(e) => cambiar("stock", e.target.value)} />
                </div>
                <div>
                  <label className="label">Stock mínimo</label>
                  <input required type="number" min="0" className="input" value={form.stockMinimo} onChange={(e) => cambiar("stockMinimo", e.target.value)} />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={cerrar}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={cargando}>
                  {cargando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Guardar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
