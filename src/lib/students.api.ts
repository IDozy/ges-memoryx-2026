export type StudentStatus = "ACTIVO" | "RETIRADO";

type Genero = "masculino" | "femenino";
type Estado = "activo" | "retirado";


export type StudentDTO = {
  id: string;
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string | null;
  tutor: string | null;
  birthDate: string | null;
  gender: string | null;
  grade: string | null;
  school: string | null;
  status: StudentStatus;
  
};

export async function fetchStudents(params: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: StudentStatus | "";
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page ?? 1));
  sp.set("pageSize", String(params.pageSize ?? 10));

  const res = await fetch(`/api/students?${sp.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error cargando estudiantes");
  return res.json() as Promise<{
    items: StudentDTO[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>;
}
