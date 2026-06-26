/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertCircle, FileCheck, Landmark, PlaneTakeoff, Key, CreditCard } from 'lucide-react';
import { Traveler } from '../types';
import { formatRUT, validateRutOrPassport } from '../utils';

interface LoginScreenProps {
  onLogin: (user: Traveler) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [docType, setDocType] = useState<'RUT' | 'Passport'>('RUT');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Chile');

  // Error and UI feedbacks
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate inputs
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    if (docType === 'RUT') {
      // Formatear RUT chileno
      rawValue = formatRUT(rawValue);
    }
    setIdValue(rawValue);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Validar ID según tipo
      const check = validateRutOrPassport(idValue);
      if (!check.isValid) {
        setErrorMsg(
          docType === 'RUT'
            ? 'El RUT ingresado no es válido. Recuerde incluir puntos, guión y dígito verificador.'
            : 'El número de pasaporte debe ser alfanumérico y contener entre 5 y 20 caracteres.'
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Validar que la clave sea la predeterminada o válida
      if (password.trim().length < 4) {
        setErrorMsg('La contraseña debe tener al menos 4 caracteres.');
        setIsSubmitting(false);
        return;
      }

      // 3. Validar datos requeridos para completar el viajero
      if (!name.trim() || !lastName.trim() || !email.trim()) {
        setErrorMsg('Por favor, complete todos los campos de identificación personal.');
        setIsSubmitting(false);
        return;
      }

      // Exito, iniciar sesion
      const traveler: Traveler = {
        id: idValue.trim(),
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        countryOfOrigin: country,
      };

      onLogin(traveler);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Informational Column (Left) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-aduana-navy/10 text-aduana-navy rounded-full text-xs font-semibold mb-4">
            <Landmark className="w-3.5 h-3.5" />
            <span>Sistema Nacional de Fronteras</span>
          </div>
          
          <h2 className="text-xl font-bold font-display text-slate-900 leading-tight">
            Ingreso y Control de Viajeros a Chile
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Todo viajero mayor de 18 años que ingrese a Chile por cualquier frontera terrestre, aérea o marítima, tiene la obligación legal de declarar las mercancías y productos animales/vegetales bajo su control.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Declaración Conjunta</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Un solo trámite para el Servicio Nacional de Aduanas y el Servicio Agrícola y Ganadero (SAG).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <PlaneTakeoff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Agilice su Entrada</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete este formulario digital hasta 48 horas antes de su viaje, y simplemente escanee el código QR provisto en aduana.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Advertencia Legal:</span> Ocultar o no declarar productos regulados de origen animal o vegetal, así como mercancías de valor comercial superior al permitido, está penado por ley con multas severas y el decomiso inmediato de los bienes.
          </div>
        </div>
      </div>

      {/* Login and Basic Form Column (Right) */}
      <div className="lg:col-span-7">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-bold font-display text-slate-800">
              Datos de Ingreso del Viajero
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Registre sus datos y asigne una contraseña de acceso rápido para consultar o modificar su declaración posteriormente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 text-sm flex gap-2.5 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Selector de Documento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tipo de Identificación
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocType('RUT');
                    setIdValue('');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    docType === 'RUT'
                      ? 'bg-aduana-navy text-white border-aduana-navy shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  RUT Chileno
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocType('Passport');
                    setIdValue('');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    docType === 'Passport'
                      ? 'bg-aduana-navy text-white border-aduana-navy shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <PlaneTakeoff className="w-4 h-4" />
                  Pasaporte Extranjero
                </button>
              </div>
            </div>

            {/* Input RUT / Passport y Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {docType === 'RUT' ? 'RUT de Viajero' : 'Número de Pasaporte'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={docType === 'RUT' ? 'Ej: 12.345.678-9' : 'Ej: E987654'}
                  value={idValue}
                  onChange={handleIdChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none font-mono"
                />
                {docType === 'RUT' && (
                  <p className="text-[10px] text-slate-400 mt-1 italic font-medium">
                    Debe incluir puntos, guión y dígito verificador.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Contraseña de Consulta
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Por defecto: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">123456</code>
                </p>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Datos del Viajero
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombres
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Carlos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pérez González"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej: jperez@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    País de Origen / Procedencia
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:border-aduana-blue focus:ring-3 focus:ring-aduana-blue/15 outline-none cursor-pointer"
                  >
                    <option value="Chile">Chile</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Perú">Perú</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Colombia">Colombia</option>
                    <option value="España">España</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-aduana-blue hover:bg-aduana-navy disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-sm tracking-wider transition-colors shadow-md shadow-aduana-blue/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'INGRESAR AL FORMULARIO'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
