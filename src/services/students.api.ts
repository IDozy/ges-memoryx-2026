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
