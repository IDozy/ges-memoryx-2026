import type { UserStatus } from "./teacher.repository";

export class TeacherEntity {
  static create(input: {
 
    status: UserStatus;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    specialty: string | null;
    department: string | null;
    hireDate: Date | null;
  }) {

    return {
  
      status: input.status,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,

    
      specialty: input.specialty,
      department: input.department,
      hireDate: input.hireDate,
    };
  }
}
