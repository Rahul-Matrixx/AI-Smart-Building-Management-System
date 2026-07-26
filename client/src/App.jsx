import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route
        path="/"
        element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;