
import  { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      
      window.location.replace('/dashboard');
    } else {
      console.error("Google login failed, no token received.");
      window.location.replace('/');
    }
  }, [searchParams]); 

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Finalizing login, please wait...</p>
    </div>
  );
};

export default AuthCallback;