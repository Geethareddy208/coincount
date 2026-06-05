import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, Target, Map, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Wallet size={20} /> },
    { name: 'Income', path: '/income', icon: <TrendingUp size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <Target size={20} /> },
    { name: 'Travel', path: '/trips', icon: <Map size={20} /> },
  ];

  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="text-gradient">Coin Count</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="nav-link logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
