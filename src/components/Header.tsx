/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, LogOut, History, User } from 'lucide-react';
import { Traveler } from '../types';

interface HeaderProps {
  user: Traveler | null;
  onLogout: () => void;
  onViewHistory: () => void;
  historyCount: number;
}

export default function Header({ user, onLogout, onViewHistory, historyCount }: HeaderProps) {
  return (
    <header className="relative w-full bg-white border-b border-slate-200 shadow-xs z-50">
      {/* Official Chile-themed color strip */}
      <div className="h-1.5 w-full flex">
        <div className="h-full bg-aduana-navy flex-1"></div>
        <div className="h-full bg-white w-4"></div>
        <div className="h-full bg-aduana-red flex-1"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-aduana-navy">
            <Shield className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                Gobierno de Chile
              </span>
              <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded-sm font-semibold uppercase">
                Aduana / SAG
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold font-display text-aduana-navy leading-tight">
              SERVICIO NACIONAL DE ADUANAS
            </h1>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
              Pre-declaración Digital de Viajeros (Declaración Jurada Conjunta)
            </p>
          </div>
        </div>

        {/* Action Controls & Session Info */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* History Button with Badge */}
              <button
                onClick={onViewHistory}
                className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Ver declaraciones anteriores"
              >
                <History className="w-4 h-4 text-slate-600" />
                <span className="hidden md:inline">Mis Declaraciones</span>
                {historyCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-aduana-red text-[9px] font-bold text-white shadow-xs animate-pulse">
                    {historyCount}
                  </span>
                )}
              </button>

              {/* User badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <User className="w-3.5 h-3.5 text-aduana-blue" />
                <div className="text-left">
                  <p className="font-semibold text-slate-800 leading-none">
                    {user.name} {user.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                    ID: {user.id}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-aduana-red hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              Autenticación Requerida
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
