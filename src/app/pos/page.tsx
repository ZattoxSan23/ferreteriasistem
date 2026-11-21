import { listarProductos } from "@/server/productos";
import { obtenerConfiguracion } from "@/server/ventas";
import { Pos } from "@/components/pos/Pos";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [productos, config] = await Promise.all([
    listarProductos(),
    obtenerConfiguracion(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Punto de venta</h1>
        <p className="text-sm text-slate-500">
          Busca productos, arma el carrito y cobra en segundos.
        </p>
      </div>
      <Pos productos={productos} igvPorcentaje={config?.igvPorcentaje ?? 18} />
    </div>
  );
}
