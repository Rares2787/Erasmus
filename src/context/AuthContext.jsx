// ============================================================================
// LER EduShare — Context de Autentificare și Permisiuni Strict RBAC
// Liceul Teoretic „Emil Racoviță” Vaslui | Erasmus+ DIGI-EQUAL
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/database';

const AuthContext = createContext(null);

const STORAGE_SESSION_USER = 'ler_auth_session_user_prod_v1';

export function AuthProvider({ children }) {
  // Sesiune reală: salvată în localStorage, fără auto-login forțat
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_SESSION_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // Implicit: Nelogat (Vizitator)
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_SESSION_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_SESSION_USER);
    }
  }, [currentUser]);

  // Autentificare strictă cu email și parolă
  async function login(email, password) {
    const user = await db.authenticateUser(email, password);
    if (!user) {
      throw new Error('Autentificare eșuată. Verificați adresa de email și parola introduse.');
    }
    setCurrentUser(user);
    return user;
  }

  // Înregistrare cont nou (Elev sau Profesor)
  async function register(userData) {
    if (userData.role === 'admin') {
      throw new Error('Conturile de administrator nu pot fi create prin înregistrare publică.');
    }
    const newUser = await db.createUser(userData);
    setCurrentUser(newUser);
    return newUser;
  }

  // Deconectare completă din sesiune
  function logout() {
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isElev: currentUser?.role === 'elev',
    isProfesor: currentUser?.role === 'profesor',
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie utilizat în interiorul unui AuthProvider.');
  }
  return context;
}
