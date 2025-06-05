import { EmployeeProvider } from './context/EmployeeContext';
import BirthdayTracker from './components/BirthdayTracker';

function App() {
  return (
    <EmployeeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <BirthdayTracker />
        </div>
      </div>
    </EmployeeProvider>
  );
}

export default App;