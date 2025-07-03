import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import SendSignal from "./pages/SendSignal";
import Terms from "./pages/Terms";
import Signals from "./pages/Signals";
import Users from "./pages/Users";
import ProUsers from "./pages/ProUsers";

function App() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {!isLogged ? (
          <Route
            path="*"
            element={<Login onLogin={() => setIsLogged(true)} />}
          />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/enviar-sinal" element={<SendSignal />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/sinais" element={<Signals />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/usuarios-pro" element={<ProUsers />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
