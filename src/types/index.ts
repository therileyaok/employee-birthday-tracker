export interface Employee {
  id: string;
  name: string;
  birthday: string;
}

export interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  removeEmployee: (id: string) => void;
}