import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, EmployeeContextType } from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storageUtils';

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const savedEmployees = loadFromLocalStorage();
    setEmployees(savedEmployees);
  }, []);

  const addEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const employee = {
      ...newEmployee,
      id: crypto.randomUUID(),
    };
    const updatedEmployees = [...employees, employee];
    setEmployees(updatedEmployees);
    saveToLocalStorage(updatedEmployees);
  };

  const removeEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    saveToLocalStorage(updatedEmployees);
  };

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, removeEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};