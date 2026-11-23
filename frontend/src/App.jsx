import { useState } from 'react';
import AuthPage from './AuthPage';
import KanbanBoard from './KanbanBoard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <AuthPage onAuthSuccess={(data) => setUser({ name: data.name, email: data.email })} />;
  }

  return <KanbanBoard user={user} onLogout={handleLogout} />;
}
