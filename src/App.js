// src/App.js
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Import des composants
import Navbar from "./Navbar";
import LoginPage from "./LoginPage";
import ConvoyeurDetails from "./ConvoyeurDetails";
import ChartPage from "./ChartPage";
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const location = useLocation();

  return (
    <AuthProvider>
      {location.pathname !== "/" && (
        <Navbar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/chart"
          element={
            <PrivateRoute>
              <ChartPage selectedDate={selectedDate} />
            </PrivateRoute>
          }
        />

        <Route
          path="/convoyeur-details"
          element={
            <PrivateRoute>
              <ConvoyeurDetails selectedDate={selectedDate} />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
