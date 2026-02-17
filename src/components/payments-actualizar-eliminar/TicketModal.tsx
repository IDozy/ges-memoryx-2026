"use client";

import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import ReciboPagoPdf from "@/src/components/pdf/PaymentReceiptPdf";
import type { PagoItem } from "./types";
import { formatDateDMY } from "./utils";

export function BoletaModal({
  data,
  onClose,
}: {
  data: {
    tutor: string;
    estudiante: string;
    mes: string;
    total: number;
    pagos: PagoItem[];
    receiptNo?: string;
  };
  onClose: () => void;
}) {
  const totalPagado = data.pagos.reduce((a, p) => a + p.amount, 0);

  async function toDataUrl(url: string) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el logo");
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }


  async function download() {
    console.log(data.receiptNo, ": Cual es el numero de correlativo")
    try {
      const logoUrl = await toDataUrl(`${window.location.origin}/logo-memoryx.png`);


      const doc = (
        <ReciboPagoPdf
          logoUrl={logoUrl}
          fecha={
            data.pagos?.[0]?.date
              ? formatDateDMY(data.pagos[0].date)
              : formatDateDMY(new Date().toISOString().slice(0, 10))
          }
          reciboNro={data.receiptNo ?? ""}
          tutor={data.tutor}
          estudiante={data.estudiante}
          pagoA={"MemoryX"}
          jr={"Jr. Mariscal Cáceres N°413"}
          cel={"945 379 813"}
          servicio={"Mensualidad"}
          mes={data.mes}
          precio={Number(data.total)}
          pagos={data.pagos.map((p) => ({ date: formatDateDMY(p.date), amount: p.amount }))}
        />
      );

      toast.message("Generando PDF...");

      const pdfInstance = pdf();
      pdfInstance.updateContainer(doc);
      const blob = await pdfInstance.toBlob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo-${data.estudiante}-${data.mes}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo generar el PDF");
    }
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" style={{ isolation: "isolate" }}>
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-300 bg-white text-zinc-900 shadow-2xl">
        <div className="p-6">
          <div className="text-lg font-semibold">Boleta de Pago</div>

          <div className="mt-4 space-y-2 text-sm">
            <div><span className="font-medium">Tutor(a): </span>{data.tutor}</div>
            <div><span className="font-medium">Estudiante: </span>{data.estudiante}</div>
            <div><span className="font-medium">Mes: </span>{data.mes}</div>
            <div className="pt-2"><span className="font-medium">Monto Total: </span>S/. {data.total}</div>
          </div>

          <div className="mt-6 text-sm font-medium">Pagos Parciales:</div>

          <div className="mt-3 max-h-[260px] overflow-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Fecha</th>
                  <th className="px-4 py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.pagos.map((p, i) => (
                  <tr key={`${p.date}-${i}`} className="border-t border-zinc-200">
                    <td className="px-4 py-2">{formatDateDMY(p.date)}</td>
                    <td className="px-4 py-2 text-right">S/. {p.amount}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200 bg-zinc-50">
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right font-medium">S/. {totalPagado}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={download}
              className="inline-flex items-center justify-center rounded-xl
      border border-[var(--color-border)]
      bg-[var(--color-surface)]
      px-4 py-2 text-sm font-semibold
      text-[var(--color-text)]
      shadow-sm
      hover:bg-[var(--color-muted)]
      transition-colors"
            >
              Descargar PDF
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl
      border border-[var(--color-border)]
      bg-transparent
      px-4 py-2 text-sm font-medium
      text-[var(--color-text-muted)]
      hover:bg-[var(--color-muted)]
      transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
