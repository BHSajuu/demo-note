
import { Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Updated route structure to match new design */}
        <Route path="/" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/login/success" element={<AuthCallback />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}
export default App;