import React, { useRef } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { read, utils } from 'xlsx';
import { useEmployees } from '../../context/EmployeeContext';
import Button from '../ui/Button';

const ExcelUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addEmployee } = useEmployees();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const name = row.name || row.Name || row.employee || row.Employee;
        let birthday = row.birthday || row.Birthday || row.dob || row.DOB;

        // Convert Excel date serial number to date string if necessary
        if (typeof birthday === 'number') {
          const date = new Date(Math.round((birthday - 25569) * 86400 * 1000));
          birthday = date.toISOString().split('T')[0];
        }

        if (name && birthday) {
          addEmployee({ name, birthday });
        }
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please ensure it contains "name" and "birthday" columns.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Upload Excel
      </Button>
    </div>
  );
};

export default ExcelUpload;