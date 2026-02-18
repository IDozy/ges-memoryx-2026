export type Relationship = "father" | "mother" | "guardian" | "tutor";
export type Estado = "activo" | "inactivo";

export type Parent = {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  relacion: Relationship;
  emergencia: boolean;
  estado: Estado;
};
