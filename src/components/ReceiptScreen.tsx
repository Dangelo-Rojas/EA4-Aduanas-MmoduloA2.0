/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
  QrCode,
  Printer,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BadgePercent,
  Download,
  AlertCircle
} from 'lucide-react';
import { Declaration } from '../types';

interface ReceiptScreenProps {
  declaration: Declaration;
  onReset: () => void;
}

export default function ReceiptScreen({ declaration, onReset }: ReceiptScreenProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Dynamic QR Code data string containing full state for the inspector's scanner
  const qrData = JSON.stringify({
    id: declaration.id,
    viajero: `${declaration.traveler.name} ${declaration.traveler.lastName}`,
    rut_passport: declaration.traveler.id,
    sag: declaration.hasSagProducts ? 'SI' : 'NO',
    aduana: declaration.hasAduanaGoods ? 'SI' : 'NO',
    status: declaration.status,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  // Determine styles depending on the customs routing status
  const getStatusConfig = () => {
    switch (declaration.status) {
      case 'Aprobado (Vía Verde)':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          icon: ShieldCheck,
          badgeBg: 'bg-emerald-500 text-white',
          desc: 'Usted ha calificado para el canal rápido. Al ingresar a la frontera, puede dirigirse de forma preferente a la fila de control simplificado o Vía Verde.',
        };
      case 'Sujeto a Inspección SAG':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: AlertTriangle,
          badgeBg: 'bg-amber-500 text-white',
          desc: 'Declaró traer productos de origen animal o vegetal. Debe presentarse obligatoriamente en el mesón de control del SAG para la inspección de su equipaje.',
        };
      case 'Pendiente de Pago de Impuestos':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: BadgePercent,
          badgeBg: 'bg-aduana-blue text-white',
          desc: 'Declaró mercancías con valor comercial que exceden la franquicia de US$ 500. Se dirigirá al mesón de liquidación de impuestos de Aduanas.',
        };
      default: // Inspección Conjunta
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-900',
          icon: AlertCircle,
          badgeBg: 'bg-red-600 text-white',
          desc: 'Su declaración requiere inspección física obligatoria por parte del SAG y liquidación de tributos comerciales en la Aduana. Siga el canal de declaración general.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Print function (opens system print or styled print-ready layout)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* QR Code and Primary Badge Column (Left) */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center w-full relative"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Pre-declaración Exitosa</span>
          </div>

          <h2 className="text-xl font-bold font-display text-slate-800 leading-tight">
            Comprobante Digital
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Presente este código QR al personal fronterizo al ingresar a Chile.
          </p>

          {/* Interactive QR code container with scanning animation */}
          <div className="relative my-6 mx-auto w-56 h-56 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center p-3 overflow-hidden shadow-2xs group">
            <img src={qrUrl} alt="Declaración QR" className="w-full h-full object-contain" />
            
            {/* Scribing/Scanning laser line animation */}
            <div className="absolute inset-x-0 h-0.5 bg-aduana-blue shadow-[0_0_8px_rgba(0,92,185,0.8)] opacity-60 animate-[bounce_2.5s_infinite_ease-in-out]"></div>
          </div>

          <div className="text-left font-mono bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
              <span className="font-sans font-bold text-slate-500">ID DECLARACIÓN:</span>
              <span className="font-bold text-slate-900">{declaration.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
              <span className="font-sans font-bold text-slate-500">FECHA GENERACIÓN:</span>
              <span className="font-bold text-slate-800">{declaration.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans font-bold text-slate-500">ESTADO RUTA:</span>
              <span className="font-bold text-aduana-navy">{declaration.status}</span>
            </div>
          </div>

          {/* Router instructions */}
          <div className={`mt-5 p-4 rounded-xl border text-left text-xs ${statusConfig.bg} ${statusConfig.text}`}>
            <div className="flex gap-2 font-bold mb-1">
              <StatusIcon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>Instrucciones de Canal</span>
            </div>
            <p className="leading-relaxed font-medium">{statusConfig.desc}</p>
          </div>
        </motion.div>
      </div>

      {/* Details Receipt Summary and Steps Column (Right) */}
      <div className="lg:col-span-7 space-y-6">
        <div ref={receiptRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                Servicio de Aduanas y SAG
              </span>
              <h3 className="text-base font-bold font-display text-slate-800">
                Resumen de Pre-declaración Jurada
              </h3>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-display uppercase tracking-wider ${statusConfig.badgeBg}`}>
              {declaration.status}
            </span>
          </div>

          {/* Form items */}
          <div className="p-6 space-y-5 text-sm">
            {/* Personals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Nombres y Apellidos
                </span>
                <span className="font-semibold text-slate-800">
                  {declaration.traveler.name} {declaration.traveler.lastName}
                </span>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Identificación (RUT / Pasaporte)
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {declaration.traveler.id}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  País de Procedencia
                </span>
                <span className="font-semibold text-slate-800">
                  {declaration.traveler.countryOfOrigin}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Correo Electrónico
                </span>
                <span className="font-semibold text-slate-800 truncate">
                  {declaration.traveler.email}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Acompañantes y menores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Acompañantes Declarados
                </span>
                <span className="font-semibold text-slate-800">
                  {declaration.companionsCount === 0
                    ? 'Sin acompañantes'
                    : `${declaration.companionsCount} personas`}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Menores en su Compañía
                </span>
                <span className="font-semibold text-slate-800">
                  {declaration.hasMinors
                    ? `Sí (Condición: ${
                        declaration.minorStatus === 'ambos-padres'
                          ? 'Con ambos padres'
                          : 'Sin uno o ambos padres'
                      })`
                    : 'No'}
                </span>
                {declaration.minorAuthFileName && (
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-mono text-xs">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{declaration.minorAuthFileName}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* SAG & Aduanas checklist */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Detalle de Declaraciones Juradas
              </span>

              {/* SAG row */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${declaration.hasSagProducts ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800">
                    Servicio Agrícola y Ganadero (SAG)
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {declaration.hasSagProducts
                      ? 'Declaró portar productos biológicos regulados de origen animal o vegetal.'
                      : 'No declara portar productos de regulación agrícola o pecuaria.'}
                  </p>
                  {declaration.hasSagProducts && declaration.sagCategories && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {declaration.sagCategories.map((c) => (
                        <span key={c} className="bg-red-50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                          {c === 'fresh' && 'Vegetales frescos'}
                          {c === 'seeds' && 'Semillas / Granos'}
                          {c === 'meat' && 'Productos cárnicos'}
                          {c === 'dairy' && 'Lácteos / Miel'}
                          {c === 'animals' && 'Especímenes vivos'}
                          {c === 'wood' && 'Madera o artesanías'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Aduanas row */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${declaration.hasAduanaGoods ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800">
                    Servicio Nacional de Aduanas
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {declaration.hasAduanaGoods
                      ? `Declaró portar equipaje/mercancías de carácter comercial que superan la franquicia (Declarado: US$ ${declaration.aduanaValue}).`
                      : 'No declara portar mercancías comerciales o bienes de valor superior a US$ 500.'}
                  </p>
                  {declaration.hasAduanaGoods && declaration.aduanaDescription && (
                    <p className="text-slate-600 bg-white border border-slate-200 rounded p-2 mt-2 italic">
                      "{declaration.aduanaDescription}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print, Download and Next Steps Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            IMPRIMIR DECLARACIÓN
          </button>

          <button
            onClick={onReset}
            className="bg-aduana-navy hover:bg-aduana-blue text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-aduana-navy/10"
          >
            <PlusCircle className="w-4 h-4" />
            NUEVA PRE-DECLARACIÓN
          </button>
        </div>

        {/* Helpful instructions guidelines */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wide">
            Pasos recomendados al llegar a la Frontera de Chile:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed font-medium">
            <li>
              <strong className="text-slate-800">Diríjase al control digital:</strong> Siga la señalética de "Pre-declaración Digital / QR" al ingresar a la zona de aduana.
            </li>
            <li>
              <strong className="text-slate-800">Escanee su comprobante:</strong> Muestre este código QR directamente desde su dispositivo móvil o su copia impresa al inspector.
            </li>
            <li>
              <strong className="text-slate-800">Inspección de equipaje:</strong> Si su semáforo es verde, pasará directo. Si es naranja o rojo (SAG o Aduanas), un oficial corroborará los productos declarados en su equipaje.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
