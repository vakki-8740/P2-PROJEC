import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import ChatPanel from './pages/ChatPanel';
import ChatDetail from './pages/ChatDetail';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import InstallButton from './components/InstallButton';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const adminLogin = localStorage.getItem('adminLogin');
    if (adminLogin) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('adminLogin', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLogin');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="admin-app">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/complaint/:mobile/:type/:id" element={<ComplaintDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/user/:mobile" element={<UserDetail />} />
            <Route path="/chat" element={<ChatPanel />} />
            <Route path="/chat/:mobile" element={<ChatDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <InstallButton />
      </div>
    </Router>
  );
}

export default App;
