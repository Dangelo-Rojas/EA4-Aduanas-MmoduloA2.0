/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Calendar, Trash2, QrCode, FileCheck, Inbox, ShieldCheck, AlertTriangle, AlertCircle, Coins } from 'lucide-react';
import { Declaration } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
  onSelectDeclaration: (declaration: Declaration) => void;
  onDeleteDeclaration: (id: string) => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  declarations,
  onSelectDeclaration,
  onDeleteDeclaration,
}: HistorySidebarProps) {
  
  const getStatusBadge = (status: Declaration['status']) => {
    switch (status) {
      case 'Aprobado (Vía Verde)':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            Vía Verde
          </span>
        );
      case 'Sujeto a Inspección SAG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Inspección SAG
          </span>
        );
      case 'Pendiente de Pago de Impuestos':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Coins className="w-3 h-3" />
            Pago Tributos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" />
            Inspec. Conjunta
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-100 cursor-pointer"
          ></motion.div>

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-101 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-aduana-navy/10 text-aduana-navy rounded-lg">
                  <History className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">
                    Historial de Pre-declaraciones
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Declaraciones digitales registradas en este dispositivo
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Cerrar panel"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {declarations.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Inbox className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Sin declaraciones</p>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">
                      No se han encontrado registros previos para el usuario actual.
                    </p>
                  </div>
                </div>
              ) : (
                declarations.map((decl) => (
                  <div
                    key={decl.id}
                    className="border border-slate-200 hover:border-aduana-blue hover:shadow-xs rounded-xl p-4 transition-all bg-white relative group"
                  >
                    {/* Top Row with ID & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {decl.id}
                      </span>
                      {getStatusBadge(decl.status)}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fecha: {decl.createdAt}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Viajero: <strong className="text-slate-800">{decl.traveler.name} {decl.traveler.lastName}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {decl.companionsCount === 0
                          ? 'Viaja solo'
                          : `Viaja con ${decl.companionsCount} acompañantes`}
                        {decl.hasSagProducts && ' • Trae SAG'}
                        {decl.hasAduanaGoods && ' • Trae Aduana'}
                      </div>
                    </div>

                    {/* Action buttons on card hover or simple row */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectDeclaration(decl);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-aduana-blue hover:text-aduana-navy flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Ver Código QR
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar esta pre-declaración de su historial?')) {
                            onDeleteDeclaration(decl.id);
                          }
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Eliminar de historial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Information */}
            <div className="p-4 border-t border-slate-150 bg-slate-50 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-600">Nota de Privacidad:</span> Los datos se resguardan de forma local en su navegador con cifrado de sesión básico para facilitar la consulta temporal durante su trayecto.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
