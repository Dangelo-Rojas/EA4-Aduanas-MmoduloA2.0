/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plane, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { Traveler, Declaration } from './types';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import DeclarationForm from './components/DeclarationForm';
import ReceiptScreen from './components/ReceiptScreen';
import HistorySidebar from './components/HistorySidebar';

export default function App() {
  // Session State
  const [user, setUser] = useState<Traveler | null>(null);
  
  // Active pre-declaration state (for receipt preview)
  const [activeDeclaration, setActiveDeclaration] = useState<Declaration | null>(null);
  
  // History collection
  const [allDeclarations, setAllDeclarations] = useState<Declaration[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load declarations from localStorage on mount or session change
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chile_aduanas_pre_declarations');
      if (stored) {
        setAllDeclarations(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading history from localStorage', e);
    }
  }, []);

  // Filter history belonging to currently logged in traveler
  const userDeclarations = user
    ? allDeclarations.filter((d) => d.traveler.id === user.id)
    : [];

  const handleLogin = (loggedUser: Traveler) => {
    setUser(loggedUser);
    // Reset active declaration for fresh login session
    setActiveDeclaration(null);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveDeclaration(null);
    setIsHistoryOpen(false);
  };

  const handleSubmitDeclaration = (newDecl: Declaration) => {
    const updated = [newDecl, ...allDeclarations];
    setAllDeclarations(updated);
    setActiveDeclaration(newDecl);
    
    try {
      localStorage.setItem('chile_aduanas_pre_declarations', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving declarations to localStorage', e);
    }
  };

  const handleDeleteDeclaration = (id: string) => {
    const updated = allDeclarations.filter((d) => d.id !== id);
    setAllDeclarations(updated);
    
    // If deleted the one currently active, clear it
    if (activeDeclaration && activeDeclaration.id === id) {
      setActiveDeclaration(null);
    }

    try {
      localStorage.setItem('chile_aduanas_pre_declarations', JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting declaration from localStorage', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Government Official Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onViewHistory={() => setIsHistoryOpen(true)}
        historyCount={userDeclarations.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner with general updates (only if not viewing a receipt) */}
        {!activeDeclaration && user && (
          <div className="bg-gradient-to-r from-aduana-navy to-aduana-blue text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] bg-white/15 text-white/95 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                Fronteras Abiertas y Seguras
              </span>
              <h2 className="text-xl font-bold font-display leading-tight">
                Complete su declaración digital antes de llegar al control
              </h2>
              <p className="text-xs text-slate-100/80 max-w-xl">
                Al rellenar este comprobante, se genera un código QR que reduce hasta en un 70% el tiempo de espera en el control fronterizo del Servicio Agrícola y Ganadero y la Aduana.
              </p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-white/90">
              <div className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-xs">
                <span className="block text-[10px] text-white/60">Aduana</span>
                <span>Max US$ 500 Libre</span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-xs">
                <span className="block text-[10px] text-white/60">SAG</span>
                <span>Filtro Fitosanitario</span>
              </div>
            </div>
          </div>
        )}

        {/* Content routing based on Auth & Declaration state */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LoginScreen onLogin={handleLogin} />
            </motion.div>
          ) : activeDeclaration ? (
            <motion.div
              key="receipt-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ReceiptScreen
                declaration={activeDeclaration}
                onReset={() => setActiveDeclaration(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <DeclarationForm
                user={user}
                onSubmit={handleSubmitDeclaration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-in History Sidebar Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        declarations={userDeclarations}
        onSelectDeclaration={(decl) => {
          setActiveDeclaration(decl);
          setIsHistoryOpen(false);
        }}
        onDeleteDeclaration={handleDeleteDeclaration}
      />

      {/* Footer Credentials */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Servidores oficiales sincronizados • Hora local de Chile</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Servicio Nacional de Aduanas - Gobierno de Chile
          </div>
        </div>
      </footer>
    </div>
  );
}
