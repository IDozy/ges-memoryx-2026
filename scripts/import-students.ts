import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { PrismaClient, StudentStatus, Gender } from "@prisma/client";


const prisma = new PrismaClient();

function toUtf8Smart(buf: Buffer) {
  // si está bien, no hace nada; si viene como latin1 mal interpretado, lo repara
  let text = buf.toString("utf8");
  if (text.includes("Ã") || text.includes("Â")) {
    const latin1 = buf.toString("latin1");
    text = Buffer.from(latin1, "latin1").toString("utf8");
  }
  return text;
}

function mapStatus(old: string): StudentStatus {
  const v = (old ?? "").trim().toUpperCase();
  if (v === "ACTIVO") return StudentStatus.ACTIVE;
  if (v === "RETIRADO") return StudentStatus.WITHDRAWN; // o INACTIVE, como prefieras
  return StudentStatus.ACTIVE;
}

function mapGender(old: string): Gender | null {
  const v = (old ?? "").trim().toUpperCase();
  if (v === "M") return Gender.M;
  if (v === "F") return Gender.F;
  return null;
}

function pad(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

async function main() {
  const csvPath = "./data/students.csv";
  const raw = fs.readFileSync(csvPath);
  const text = toUtf8Smart(raw);

  const rows: any[] = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Genera studentCode: STU-YYYY-0001
  // Para que sea estable, usamos el año de createdAt y un contador global incremental.
  let counter = 0;

  // Si ya tienes estudiantes en DB, empieza luego del máximo correlativo (por seguridad)
  const existing = await prisma.student.count();
  counter = existing;

  const data = rows.map((r) => {
    counter += 1;

    const id = (r.id ?? "").trim();
    const firstName = (r.firstName ?? "").trim();
    const lastNameFather = (r.lastNameFather ?? "").trim();
    const lastNameMother = (r.lastNameMother ?? "").trim();

    const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();
    const updatedAt = r.updatedAt ? new Date(r.updatedAt) : createdAt;

    // year para el código
    const year = createdAt.getFullYear();
    const studentCode = `STU-${year}-${pad(counter, 4)}`;

    // OJO: en tu schema nuevo NO existe tutor, así que lo guardo dentro de pickupPerson si está vacío
    const tutor = (r.tutor ?? "").trim();
    const pickupPerson = (r.pickupPerson ?? "").trim();
    const pickupFinal =
      pickupPerson || tutor ? [pickupPerson, tutor].filter(Boolean).join(" | ") : null;

    // birthDate puede venir vacío
    const birthDate = r.birthDate ? new Date(r.birthDate) : null;

    return {
      id,
      studentCode,
      firstName,
      lastNameFather,
      lastNameMother,
      birthDate,
      gender: mapGender(r.gender),
      grade: (r.grade ?? "").trim() || null,
      school: (r.school ?? "").trim() || null,
      phone: (r.phone ?? "").trim() || null,
      address: (r.address ?? "").trim() || null,
      pickupPerson: pickupFinal,
      status: mapStatus(r.status),
      createdAt,
      updatedAt,
    };
  }).filter(s => s.id && s.firstName && s.lastNameFather && s.lastNameMother);

  // Inserta en lotes
  const BATCH = 500;
  let inserted = 0;

  for (let i = 0; i < data.length; i += BATCH) {
    const chunk = data.slice(i, i + BATCH);
    const res = await prisma.student.createMany({
      data: chunk,
      skipDuplicates: true, // por si re-ejecutas
    });
    inserted += res.count;
    console.log(`✅ Insertados: ${inserted}/${data.length}`);
  }

  console.log("🎉 Import finalizado.");
}

main()
  .catch((e) => {
    console.error("❌ Error importando students:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
