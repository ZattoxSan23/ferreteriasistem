"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { aCentimos, desglosarIgv, formatoSoles } from "@/lib/dinero";
import type { ProductoDTO } from "@/lib/tipos";
import { PagoModal } from "@/components/pos/PagoModal";

type LineaCarrito = { producto: ProductoDTO; cantidad: number };

const metodos = [
  { id: "EFECTIVO", label: "Efectivo", icono: Banknote },
  { id: "TARJETA", label: "Tarjeta", icono: CreditCard },
  { id: "YAPE", label: "Yape", icono: Wallet },
] as const;

type MetodoPago = (typeof metodos)[number]["id"];

export function Pos({
  productos,
  igvPorcentaje,
}: {
  productos: ProductoDTO[];
  igvPorcentaje: number;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [cliente, setCliente] = useState({ nombre: "", doc: "", telefono: "" });
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [efectivo, setEfectivo] = useState("");
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorias = useMemo(
    () => ["todas", ...Array.from(new Set(productos.map((p) => p.categoria.nombre)))],
    [productos]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const coincideTexto =
        !q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const coincideCategoria = categoria === "todas" || p.categoria.nombre === categoria;
      return p.activo && coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, categoria]);

  const total = carrito.reduce((acc, l) => acc + l.producto.precioVenta * l.cantidad, 0);
  const { subtotal, igv } = desglosarIgv(total, igvPorcentaje);
  const efectivoCentimos = aCentimos(Number(efectivo || 0));
  const vuelto = efectivoCentimos - total;

  function cantidadEnCarrito(productoId: number) {
    return carrito.find((l) => l.producto.id === productoId)?.cantidad ?? 0;
  }

  function agregar(producto: ProductoDTO) {
    setError(null);
    setCarrito((actual) => {
      const existente = actual.find((l) => l.producto.id === producto.id);
      if (existente) {
        if (existente.cantidad >= producto.stock) return actual;
        return actual.map((l) =>
          l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l
        );
      }
      if (producto.stock <= 0) return actual;
      return [...actual, { producto, cantidad: 1 }];
    });
  }

  function cambiar(productoId: number, delta: number) {
    setCarrito((actual) =>
      actual
        .map((l) => {
          if (l.producto.id !== productoId) return l;
          const nueva = l.cantidad + delta;
          if (nueva > l.producto.stock) return l;
          return { ...l, cantidad: nueva };
        })
        .filter((l) => l.cantidad > 0)
    );
  }

  function quitar(productoId: number) {
    setCarrito((actual) => actual.filter((l) => l.producto.id !== productoId));
  }

  async function confirmarVenta(referenciaPago?: string) {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre: cliente.nombre || undefined,
          clienteDoc: cliente.doc || undefined,
          clienteTelefono: cliente.telefono || undefined,
          metodoPago,
          referenciaPago,
          items: carrito.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar la venta.");
      router.push(`/ventas/${data.id}?nueva=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setPagoAbierto(false);
      setEnviando(false);
    }
  }

  function cobrar() {
    if (carrito.length === 0) return;
    setError(null);
    if (metodoPago === "EFECTIVO") {
      if (efectivoCentimos < total) {
        setError("El efectivo recibido es menor al total a pagar.");
        return;
      }
      void confirmarVenta();
    } else {
      setPagoAbierto(true);
    }
  }

  const puedeCobrar =
    carrito.length > 0 &&
    !enviando &&
    (metodoPago !== "EFECTIVO" || efectivoCentimos >= total);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <div className="card p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto por nombre o SKU (ej. martillo, FER-HER-001)"
              className="input pl-9"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  categoria === c
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c === "todas" ? "Todas" : c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {filtrados.map((p) => {
            const enCarrito = cantidadEnCarrito(p.id);
            const sinStock = p.stock <= 0;
            const lleno = enCarrito >= p.stock;
            return (
              <button
                key={p.id}
                onClick={() => agregar(p)}
                disabled={sinStock || lleno}
                className="card group flex flex-col p-4 text-left transition hover:border-orange-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                    {p.sku}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      sinStock
                        ? "bg-red-50 text-red-600"
                        : p.stock <= p.stockMinimo
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {sinStock ? "Agotado" : `${p.stock} ${p.unidad}`}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm font-semibold text-slate-800">
                  {p.nombre}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">{formatoSoles(p.precioVenta)}</span>
                  {enCarrito > 0 && (
                    <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {enCarrito} en carrito
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {filtrados.length === 0 && (
          <div className="card py-14 text-center text-sm text-slate-400">
            No se encontraron productos con ese criterio.
          </div>
        )}
      </div>

      <div className="card flex h-fit flex-col xl:sticky xl:top-24">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <ShoppingCart size={16} className="text-orange-500" /> Carrito
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {carrito.reduce((a, l) => a + l.cantidad, 0)} items
          </span>
        </div>

        <div className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
          {carrito.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              El carrito está vacío. Agrega productos.
            </p>
          )}
          {carrito.map((l) => (
            <div key={l.producto.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{l.producto.nombre}</p>
                  <p className="text-xs text-slate-400">{formatoSoles(l.producto.precioVenta)} c/u</p>
                </div>
                <button onClick={() => quitar(l.producto.id)} className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => cambiar(l.producto.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{l.cantidad}</span>
                  <button onClick={() => cambiar(l.producto.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Plus size={13} />
                  </button>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatoSoles(l.producto.precioVenta * l.cantidad)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-slate-100 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="Cliente (opcional)"
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
            />
            <input
              className="input"
              placeholder="DNI / RUC"
              value={cliente.doc}
              onChange={(e) => setCliente({ ...cliente, doc: e.target.value })}
            />
          </div>
          <input
            className="input"
            placeholder="WhatsApp (para enviar boleta)"
            value={cliente.telefono}
            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
          />

          <div>
            <p className="label">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {metodos.map((m) => {
                const Icono = m.icono;
                const on = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      on
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icono size={16} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {metodoPago === "EFECTIVO" && (
            <div>
              <label className="label">Efectivo recibido (S/)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input"
                value={efectivo}
                onChange={(e) => setEfectivo(e.target.value)}
                placeholder="0.00"
              />
              {efectivoCentimos > 0 && (
                <p className={`mt-1 text-xs font-medium ${vuelto < 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {vuelto < 0 ? "Falta: " : "Vuelto: "}
                  {formatoSoles(Math.abs(vuelto))}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatoSoles(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IGV ({igvPorcentaje}%)</span>
              <span>{formatoSoles(igv)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatoSoles(total)}</span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          <button onClick={cobrar} className="btn-primary w-full py-2.5" disabled={!puedeCobrar}>
            {enviando ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            {metodoPago === "EFECTIVO" ? "Cobrar" : "Ir a pagar"} · {formatoSoles(total)}
          </button>
        </div>
      </div>

      {pagoAbierto && (
        <PagoModal
          monto={total}
          metodo={metodoPago === "YAPE" ? "YAPE" : "TARJETA"}
          onCerrar={() => setPagoAbierto(false)}
          onExito={(referencia) => {
            setPagoAbierto(false);
            void confirmarVenta(referencia);
          }}
        />
      )}
    </div>
  );
}
