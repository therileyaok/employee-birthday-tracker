import React, { useState } from 'react';
import { useEmployees } from '../../context/EmployeeContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ExcelUpload from './ExcelUpload';

const EmployeeForm: React.FC = () => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const { addEmployee } = useEmployees();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthday) {
      addEmployee({ name, birthday });
      setName('');
      setBirthday('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Employee Name"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Birthday"
          id="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Add Employee
        </Button>
      </form>
      <div className="flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <ExcelUpload />
    </div>
  );
};

export default EmployeeForm;