export type Estado = "activo" | "retirado";
export type Genero = "masculino" | "femenino" | "otro";

export type Student = {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  encargado: string;
  fechaNacimiento: string;
  genero: Genero;
  grado: string;
  escuela: string;
  estado: Estado;
};

export type CreateStudentPayload = {
  // student
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string | null;
  tutor: string | null;
  birthDate: string | null;
  gender: string | null;
  grade: string | null;
  school: string | null;
  status: string;

  // parent (solo create)
  parent?: {
    firstName: string;
    lastName: string;
    relationship: string; // father|mother|guardian|tutor
  };
};
