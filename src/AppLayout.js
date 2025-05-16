// src/AppLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = ({ selectedDate, setSelectedDate }) => {
  const location = useLocation();

  return (
    <>
      {/* Show Navbar on all routes except the login page ("/") */}
      {location.pathname !== "/" && (
        <Navbar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}
      <Outlet />
    </>
  );
};

export default AppLayout;
