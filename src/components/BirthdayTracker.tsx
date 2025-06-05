import { useState, useEffect, useMemo } from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import * as XLSX from 'xlsx';
import { ChangeEvent } from 'react';

// IndexedDB helper functions
const DB_NAME = 'birthday-tracker-db';
const DB_VERSION = 1;
const STORE_NAME = 'employees';

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getEmployees(): Promise<Employee[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME);
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('employees');
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveEmployees(employees: Employee[]) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(employees, 'employees');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

interface Employee {
  name: string;
  birthday: string; // Format: YYYY-MM-DD
  date: Date;
}

const sampleEmployees: Employee[] = [
  { name: 'John Doe', birthday: '1990-06-05', date: new Date('1990-06-05') },
  { name: 'Jane Smith', birthday: '1985-07-15', date: new Date('1985-07-15') },
  { name: 'Bob Johnson', birthday: '1992-08-20', date: new Date('1992-08-20') },
  { name: 'Alice Brown', birthday: '1988-09-10', date: new Date('1988-09-10') },
  { name: 'Charlie Wilson', birthday: '1995-10-25', date: new Date('1995-10-25') },
];

export default function BirthdayTracker() {
  // State for employees and upcoming birthdays
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentMonthBirthdays, setCurrentMonthBirthdays] = useState<Employee[]>([]);
  const [nextMonthBirthdays, setNextMonthBirthdays] = useState<Employee[]>([]);

  // Load initial data on mount
  useEffect(() => {
    console.log('Component mounted');
    
    // Load employees from IndexedDB
    getEmployees().then((employees) => {
      if (employees.length > 0) {
        const validEmployees = employees.filter(emp => 
          emp.name && emp.birthday && emp.date instanceof Date
        ).map(emp => ({
          ...emp,
          date: new Date(emp.birthday)
        }));
        
        setEmployees(validEmployees);
        
        // Calculate upcoming birthdays
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        
        const currentMonthBirthdays = validEmployees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const empDay = emp.date.getDate();
            return empMonth === currentMonth && empDay >= currentDay;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const nextMonthBirthdays = validEmployees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const nextMonth = (currentMonth + 1) % 12;
            return empMonth === nextMonth;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setCurrentMonthBirthdays(currentMonthBirthdays);
        setNextMonthBirthdays(nextMonthBirthdays);
      } else {
        // Use sample employees if no data in IndexedDB
        setEmployees(sampleEmployees);
        
        // Calculate initial upcoming birthdays for sample data
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        
        const currentMonthBirthdays = sampleEmployees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const empDay = emp.date.getDate();
            return empMonth === currentMonth && empDay >= currentDay;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const nextMonthBirthdays = sampleEmployees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const nextMonth = (currentMonth + 1) % 12;
            return empMonth === nextMonth;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setCurrentMonthBirthdays(currentMonthBirthdays);
        setNextMonthBirthdays(nextMonthBirthdays);
      }
    }).catch((error) => {
      console.error('Error loading from IndexedDB:', error);
      setEmployees(sampleEmployees);
    });
  }, []);





  // Recalculate upcoming birthdays when employees change
  useEffect(() => {
    if (employees.length === 0) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    console.log('Recalculating upcoming birthdays for:', employees.length, 'employees');
    
    const newCurrentMonthBirthdays = employees
      .filter((emp) => {
        const empMonth = emp.date.getMonth();
        const empDay = emp.date.getDate();
        const isValid = empMonth === currentMonth && empDay >= currentDay;
        console.log(`Employee ${emp.name}:`, {
          empMonth, empDay, currentMonth, currentDay, isValid
        });
        return isValid;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const newNextMonthBirthdays = employees
      .filter((emp) => {
        const empMonth = emp.date.getMonth();
        const nextMonth = (currentMonth + 1) % 12;
        const isValid = empMonth === nextMonth;
        console.log(`Employee ${emp.name}:`, {
          empMonth, nextMonth, isValid
        });
        return isValid;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    console.log('New current month birthdays:', newCurrentMonthBirthdays);
    console.log('New next month birthdays:', newNextMonthBirthdays);
    
    setCurrentMonthBirthdays(newCurrentMonthBirthdays);
    setNextMonthBirthdays(newNextMonthBirthdays);
    
    // Update localStorage with new calculations
    localStorage.setItem('currentMonthBirthdays', JSON.stringify(newCurrentMonthBirthdays));
    localStorage.setItem('nextMonthBirthdays', JSON.stringify(newNextMonthBirthdays));
  }, [employees]);

  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeBirthday, setNewEmployeeBirthday] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'employees'>('upcoming');

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim() || !newEmployeeBirthday.trim()) {
      return;
    }

    try {
      const newEmployee: Employee = {
        name: newEmployeeName.trim(),
        birthday: newEmployeeBirthday.trim(),
        date: new Date(newEmployeeBirthday.trim())
      };

      const updatedEmployees = [...employees, newEmployee];
      setEmployees(updatedEmployees);
      
      // Save to localStorage with proper validation
      const validEmployees = updatedEmployees.filter(emp => 
        emp.name && emp.birthday && emp.date instanceof Date
      );
      localStorage.setItem('employeeBirthdays', JSON.stringify(validEmployees));
      
      setNewEmployeeName('');
      setNewEmployeeBirthday('');
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleRemoveEmployee = (name: string) => {
    try {
      const updatedEmployees = employees.filter(employee => employee.name !== name);
      setEmployees(updatedEmployees);
      
      // Save to localStorage with proper validation
      const validEmployees = updatedEmployees.filter(emp => 
        emp.name && emp.birthday && emp.date instanceof Date
      );
      localStorage.setItem('employeeBirthdays', JSON.stringify(validEmployees));
    } catch (error) {
      console.error('Error removing employee:', error);
    }
  };


  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter((employee: Employee) => 
      employee.name.toLowerCase().includes(query) ||
      employee.birthday.includes(query)
    );
  }, [employees, searchQuery]);



  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) return;
          
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet);
          
          const newEmployees = rows.map((row: any) => {
            const name = row.Name || '';
            let birthday = row.Birthday || '';
            
            // If birthday is a number (Excel serial date), convert it to proper date string
            if (typeof birthday === 'number') {
              const date = new Date(Math.round((birthday - 25569) * 86400 * 1000));
              birthday = format(date, 'yyyy-MM-dd');
            }
            
            return {
              name,
              birthday,
              date: new Date(birthday)
            };
          }).filter(emp => emp.name && emp.birthday && emp.date instanceof Date); // Filter out invalid employees
          
          if (newEmployees.length > 0) {
            setEmployees(newEmployees);
            
            // Update the birthday counts immediately
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();
            
            const currentMonthBirthdays = newEmployees
              .filter((emp) => {
                const empMonth = emp.date.getMonth();
                const empDay = emp.date.getDate();
                return empMonth === currentMonth && empDay >= currentDay;
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime());
            
            const nextMonthBirthdays = newEmployees
              .filter((emp) => {
                const empMonth = emp.date.getMonth();
                const nextMonth = (currentMonth + 1) % 12;
                return empMonth === nextMonth;
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime());
            
            setCurrentMonthBirthdays(currentMonthBirthdays);
            setNextMonthBirthdays(nextMonthBirthdays);
            setIsSaved(false);
          } else {
            console.error('No valid employees found in the uploaded file');
            alert('No valid employees found in the uploaded file. Please check the format and try again.');
          }
        } catch (error) {
          console.error('Error processing Excel data:', error);
          alert('Error processing Excel data. Please check the format and try again.');
        }
      };
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        alert('Error reading file. Please try again.');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error initializing file reader:', error);
      alert('Error initializing file reader. Please try again.');
    }

    // Reset the file input
    const input = event.target as HTMLInputElement;
    input.value = '';
  };

  const handleSaveData = () => {
    try {
      // Save employees to IndexedDB
      saveEmployees(employees).then(() => {
        // Calculate and update upcoming birthdays
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        
        const currentMonthBirthdays = employees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const empDay = emp.date.getDate();
            return empMonth === currentMonth && empDay >= currentDay;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const nextMonthBirthdays = employees
          .filter((emp) => {
            const empMonth = emp.date.getMonth();
            const nextMonth = (currentMonth + 1) % 12;
            return empMonth === nextMonth;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setCurrentMonthBirthdays(currentMonthBirthdays);
        setNextMonthBirthdays(nextMonthBirthdays);
        
        alert('Data saved successfully!');
      }).catch((error) => {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
      });
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Employee Birthday Tracker</h1>

      <div className="mb-8">
        <div className="mb-4">
          <label htmlFor="excel-upload" className="block mb-2 text-sm font-medium">Upload Excel File:</label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'upcoming'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming Birthdays
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'employees'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manage Employees
            </button>
          </div>
        </div>

        {activeTab === 'upcoming' ? (
          <div>
            {/* Upcoming Birthdays Summary */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming Birthdays</h2>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-blue-600">{currentMonthBirthdays.length}</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-blue-600">{nextMonthBirthdays.length}</p>
                    <p className="text-sm text-gray-600">Next Month</p>
                  </div>
                </div>
              </div>

               {/* Current Month Birthdays */}
               <div className="space-y-4">
                 {currentMonthBirthdays.map((employee, index) => (
                   <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                     <span className="text-xl font-bold text-pink-500 mr-4">🎂</span>
                     <div>
                       <h3 className="font-semibold">{employee.name}</h3>
                       <p className="text-sm text-gray-600">
                         {format(employee.date, 'MMMM do')}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>

              {/* Save Data Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveData}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mt-4"
                >
                  Save Data
                </button>
              </div>

              {/* Next Month Birthdays */}
              {nextMonthBirthdays.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Next Month's Birthdays</h3>
                  <div className="space-y-4">
                    {nextMonthBirthdays.map((employee, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-xl font-bold text-pink-500 mr-4">🎂</span>
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-gray-600">
                            {format(employee.date, 'MMMM do')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Add New Employee:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Birthday (YYYY-MM-DD)"
                    value={newEmployeeBirthday}
                    onChange={(e) => setNewEmployeeBirthday(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    onClick={handleAddEmployee}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Employees</h3>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-blue-600">{employees.length}</p>
                    <p className="text-sm text-gray-600">Total Employees</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full p-2 border rounded-lg pr-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg 
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                {filteredEmployees.map((employee, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{employee.name}</h3>
                        <p className="text-gray-600">Birthday: {employee.birthday}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveEmployee(employee.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
