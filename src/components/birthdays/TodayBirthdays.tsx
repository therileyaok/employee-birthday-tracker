import React from 'react';
import { Gift } from 'lucide-react';
import { useEmployees } from '../../context/EmployeeContext';
import { isBirthdayToday, formatDate } from '../../utils/dateUtils';
import Card from '../ui/Card';

const TodayBirthdays: React.FC = () => {
  const { employees } = useEmployees();
  const todaysBirthdays = employees.filter(emp => isBirthdayToday(emp.birthday));

  return (
    <section>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Today's Birthdays</h2>
        </div>
        {todaysBirthdays.length > 0 ? (
          <ul className="space-y-3">
            {todaysBirthdays.map(employee => (
              <li
                key={employee.id}
                className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg"
              >
                <span className="font-medium text-gray-800">{employee.name}</span>
                <span className="text-indigo-600">{formatDate(employee.birthday)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No birthdays today!</p>
        )}
      </Card>
    </section>
  );
};

export default TodayBirthdays;