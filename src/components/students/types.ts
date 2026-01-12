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
