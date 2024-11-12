import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CardDetail from "./components/CardDetail";
import Admin from "./components/Admin";
import Login from "./components/Login";
import CardInput from "./components/CardInput";
import CardEdit from "./components/CardEdit";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/cardinput" element={<ProtectedRoute><CardInput /></ProtectedRoute>} />
        <Route path="/cardedit" element={<ProtectedRoute><CardEdit /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
