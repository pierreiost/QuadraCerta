// frontend/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courts from './pages/Courts';
import Clients from './pages/Clients';
import Reservations from './pages/Reservations';
import Products from './pages/Products';
import Tabs from './pages/Tabs';
import TabDetails from './pages/TabDetails';
import Profile from './pages/Profile'; // Importa a página de Perfil
import './styles/App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="loading" style={{ width: '50px', height: '50px', borderWidth: '5px' }}></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="loading" style={{ width: '50px', height: '50px', borderWidth: '5px' }}></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/courts" 
            element={
              <PrivateRoute>
                <Courts />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/courts/:id" 
            element={
              <PrivateRoute>
                <Courts />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <PrivateRoute>
                <Reservations />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/agenda" 
            element={
              <PrivateRoute>
                <Reservations />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tabs" 
            element={
              <PrivateRoute>
                <Tabs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tabs/:id" 
            element={
              <PrivateRoute>
                <TabDetails />
              </PrivateRoute>
            } 
          />
          
          {/* Rota de perfil que adicionamos */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;