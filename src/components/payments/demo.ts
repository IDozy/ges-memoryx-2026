import type { Estudiante } from "./types";
import { uid, buildMes } from "./utils";

export const demoData: Estudiante[] = [
  {
    id: uid(),
    nombreCompleto: "Zaid Bolaños Lopez",
    tutor: "Maria",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-23", amount: 80 }]),
      4: buildMes(80, [{ date: "2025-05-09", amount: 80 }]),
      5: buildMes(80, [{ date: "2025-06-02", amount: 80 }]),
    },
  },
  {
    id: uid(),
    nombreCompleto: "Briana Eugenio Ramos",
    tutor: "Alex",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-08", amount: 50 }]),
      4: buildMes(80, [], true),
      5: buildMes(80, [], true),
    },
  },
];
