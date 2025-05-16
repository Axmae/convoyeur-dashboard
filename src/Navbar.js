import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "./Navbar.css";
import "react-datepicker/dist/react-datepicker.css";
import logo from './ocp.png';
import { useAuth } from './AuthContext';
import { 
  LineChart, 
  Calendar, 
  LogOut,
  ChevronDown
} from "lucide-react";

// Register the French locale
registerLocale('fr', fr);

const Navbar = ({ selectedDate, setSelectedDate }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar-container">
      {/* Logo with hover effect */}
      <div className="logo-container">
        <img 
          src={logo} 
          alt="OCP Logo" 
          className="logo-image"
        />
        <span className="logo-text">OCP Analytics</span>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <NavLink 
          to="/chart" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active-link' : ''}`
          }
        >
          <LineChart className="link-icon" size={18} />
          Dashboard
        </NavLink>
      </div>

      {/* Right side controls */}
      <div className="nav-controls">
        {/* Date Picker */}
        <div className="date-picker-container">
          <Calendar className="date-picker-icon" size={18} />
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            placeholderText="Sélectionnez une date"
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            locale="fr"
            className="custom-datepicker-input"
            popperClassName="date-picker-popper"
            showPopperArrow={false}
            dropdownMode="select"
          />
          <ChevronDown className="date-picker-chevron" size={16} />
        </div>

        {/* Logout Button */}
        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="logout-icon" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;