import React from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';
import { useEmployees } from '../../context/EmployeeContext';
import { isUpcomingBirthday, formatDate } from '../../utils/dateUtils';
import Card from '../ui/Card';
import Button from '../ui/Button';

const UpcomingBirthdays: React.FC = () => {
  const { employees, removeEmployee } = useEmployees();
  const upcomingBirthdays = employees
    .filter(emp => isUpcomingBirthday(emp.birthday))
    .sort((a, b) => new Date(a.birthday).getTime() - new Date(b.birthday).getTime());

  return (
    <section>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Birthdays</h2>
        </div>
        {upcomingBirthdays.length > 0 ? (
          <ul className="space-y-3">
            {upcomingBirthdays.map(employee => (
              <li
                key={employee.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <span className="font-medium text-gray-800">{employee.name}</span>
                  <span className="ml-2 text-indigo-600">{formatDate(employee.birthday)}</span>
                </div>
                <Button
                  variant="danger"
                  onClick={() => removeEmployee(employee.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Remove employee"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming birthdays in the next month!</p>
        )}
      </Card>
    </section>
  );
};

export default UpcomingBirthdays;