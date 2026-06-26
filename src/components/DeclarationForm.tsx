/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Globe,
  Mail,
  Users,
  Baby,
  FileUp,
  FileText,
  CheckCircle,
  Leaf,
  DollarSign,
  AlertTriangle,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Coins
} from 'lucide-react';
import { Traveler, Declaration, MinorStatus } from '../types';
import { determineStatus, generateDeclarationID } from '../utils';

interface DeclarationFormProps {
  user: Traveler;
  onSubmit: (declaration: Declaration) => void;
}

export default function DeclarationForm({ user, onSubmit }: DeclarationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // --- STEP 1 STATE: Viajero & Grupo Familiar ---
  const [name, setName] = useState(user.name);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [country, setCountry] = useState(user.countryOfOrigin);
  const [companions, setCompanions] = useState(0);
  const [hasMinors, setHasMinors] = useState(false);
  const [minorStatus, setMinorStatus] = useState<MinorStatus>('ambos-padres');
  
  // File upload state for authorization
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STEP 2 STATE: Declaración de Productos ---
  const [hasSag, setHasSag] = useState(false);
  const [sagCategories, setSagCategories] = useState<string[]>([]);
  
  const [hasAduana, setHasAduana] = useState(false);
  const [aduanaValue, setAduanaValue] = useState<number>(0);
  const [aduanaDescription, setAduanaDescription] = useState('');

  // --- STEP 3 STATE: Firma y Confirmación ---
  const [acceptOath, setAcceptOath] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  // --- HANDLERS ---
  
  // File Picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Formato no permitido. Solo se admiten PDFs e imágenes (JPG, PNG).');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Simple local reader for preview simulation
          const reader = new FileReader();
          reader.onloadend = () => {
            setFileDataUrl(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  const removeFile = () => {
    setFile(null);
    setFileDataUrl('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // SAG Multi-select toggler
  const toggleSagCategory = (category: string) => {
    if (sagCategories.includes(category)) {
      setSagCategories(sagCategories.filter((c) => c !== category));
    } else {
      setSagCategories([...sagCategories, category]);
    }
  };

  // Validation before going to next steps
  const validateStep1 = () => {
    if (!name.trim() || !lastName.trim() || !email.trim()) {
      alert('Debe completar sus datos personales.');
      return false;
    }
    if (hasMinors && minorStatus === 'solo' && !file) {
      alert('Es obligatorio adjuntar la autorización notarial de viaje para el menor que viaja sin uno o ambos padres.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (hasSag && sagCategories.length === 0) {
      alert('Debe seleccionar al menos una categoría de productos de origen animal o vegetal que trae consigo.');
      return false;
    }
    if (hasAduana) {
      if (aduanaValue <= 500) {
        alert('Si trae mercancías gravadas, el valor declarado debe ser superior al deducible de viajeros (US$ 500).');
        return false;
      }
      if (!aduanaDescription.trim()) {
        alert('Debe detallar la descripción de las mercancías de valor comercial sujetas a impuesto.');
        return false;
      }
    }
    return true;
  };

  const handleFinalSubmit = () => {
    if (!acceptOath) {
      alert('Debe aceptar la declaración jurada de veracidad antes de enviar.');
      return false;
    }
    if (!signatureName.trim()) {
      alert('Debe registrar su firma digital (su nombre completo) para validar legalmente este documento.');
      return false;
    }

    // Prepare declaration payload
    const declId = generateDeclarationID();
    const declStatus = determineStatus(hasSag, hasAduana);

    const newDeclaration: Declaration = {
      id: declId,
      traveler: {
        id: user.id,
        name,
        lastName,
        email,
        countryOfOrigin: country,
      },
      companionsCount: companions,
      hasMinors,
      minorStatus: hasMinors ? minorStatus : undefined,
      minorAuthFileName: hasMinors && minorStatus === 'solo' && file ? file.name : undefined,
      minorAuthFileDataUrl: hasMinors && minorStatus === 'solo' ? fileDataUrl : undefined,
      hasSagProducts: hasSag,
      sagCategories: hasSag ? sagCategories : [],
      hasAduanaGoods: hasAduana,
      aduanaValue: hasAduana ? aduanaValue : undefined,
      aduanaDescription: hasAduana ? aduanaDescription : undefined,
      createdAt: new Date().toLocaleString('es-CL'),
      status: declStatus,
    };

    onSubmit(newDeclaration);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Wizard Steps Tracker */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-aduana-navy uppercase tracking-wider">Progreso:</span>
            <span className="text-xs font-semibold text-slate-500">Paso {step} de 3</span>
          </div>
          <div className="flex gap-1">
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-aduana-navy' : 'bg-slate-200'}`}></div>
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-aduana-navy' : 'bg-slate-200'}`}></div>
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-aduana-navy' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Dynamic labels */}
        <div className="grid grid-cols-3 mt-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <span className={step === 1 ? 'text-aduana-navy' : 'text-slate-400'}>1. Grupo Familiar</span>
          <span className={step === 2 ? 'text-aduana-navy' : 'text-slate-400'}>2. Declaraciones</span>
          <span className={step === 3 ? 'text-aduana-navy' : 'text-slate-400'}>3. Resumen y Firma</span>
        </div>
      </div>

      {/* Main Content Area with Transitions */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTIFICATION & FAMILY GROUP */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-aduana-navy" />
                  Identificación del Viajero y Acompañantes
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Revise sus datos personales declarados en el ingreso y defina el grupo familiar bajo su responsabilidad.
                </p>
              </div>

              {/* Grid 2 - Personals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nombres del Declarante
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{name}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Apellidos del Declarante
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{lastName}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    RUT / Pasaporte
                  </label>
                  <p className="text-sm font-semibold font-mono text-slate-800">{user.id}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    País de Procedencia
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-aduana-blue"
                  >
                    <option value="Chile">Chile</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Perú">Perú</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Group Family & Minors */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Grupo Familiar y Menores de Edad
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      ¿Viaja con acompañantes a su cargo?
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Indique el número de familiares directos que viajan con usted y de quienes asume la declaración.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={companions}
                      onChange={(e) => setCompanions(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-slate-800 focus:border-aduana-blue"
                    />
                    <span className="text-xs font-semibold text-slate-500">personas</span>
                  </div>
                </div>

                {/* Minors check */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasMinors}
                      onChange={(e) => setHasMinors(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-aduana-blue focus:ring-aduana-blue mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Baby className="w-4 h-4 text-slate-500" />
                        ¿Viaja con menores de edad?
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seleccione esta casilla si lo acompañan personas menores de 18 años.
                      </p>
                    </div>
                  </label>

                  {/* Conditional logic for Minors */}
                  {hasMinors && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-8 pt-3 border-t border-slate-100 space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Condición de viaje de los menores:
                        </label>
                        <select
                          value={minorStatus}
                          onChange={(e) => setMinorStatus(e.target.value as MinorStatus)}
                          className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:border-aduana-blue"
                        >
                          <option value="ambos-padres">Viaja acompañado de ambos padres</option>
                          <option value="solo">Viaja sin uno o ambos padres</option>
                        </select>
                      </div>

                      {/* File upload conditional */}
                      {minorStatus === 'solo' && (
                        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl space-y-3">
                          <div className="flex gap-2 text-amber-900 text-xs font-bold">
                            <AlertTriangle className="w-4.5 h-4.5 text-amber-700 flex-shrink-0" />
                            <span>Documentación Obligatoria Requerida</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Para ingresar a Chile con menores que no viajan con ambos padres, debe adjuntar la <strong className="text-slate-800">Autorización Notarial de Viaje</strong> o resolución judicial competente.
                          </p>

                          {/* Beautiful Drag & Drop area */}
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
                              isDragOver
                                ? 'border-aduana-blue bg-aduana-blue/5'
                                : file
                                ? 'border-emerald-300 bg-emerald-50/10'
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf, .png, .jpg, .jpeg"
                              className="hidden"
                            />

                            {!file ? (
                              <div className="space-y-2">
                                <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                  <FileUp className="w-5 h-5" />
                                </div>
                                <div className="text-xs text-slate-700 font-semibold">
                                  Arrastre el archivo aquí o <span className="text-aduana-blue underline">busque en su dispositivo</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  Formatos admitidos: PDF, PNG, JPG (máximo 10MB)
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 max-w-md mx-auto">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {isUploading ? (
                                      <div className="w-5 h-5 border-2 border-aduana-blue border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    )}
                                    <div className="text-left overflow-hidden">
                                      <p className="text-xs font-bold text-slate-800 truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>

                                  {!isUploading && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile();
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                      title="Quitar archivo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                {isUploading && (
                                  <div className="max-w-md mx-auto">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-aduana-blue transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                      Cargando... {uploadProgress}%
                                    </span>
                                  </div>
                                )}

                                {!isUploading && fileDataUrl && (
                                  <div className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                                    <span>Archivo validado y cargado correctamente</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) {
                      setStep(2);
                    }
                  }}
                  className="bg-aduana-navy hover:bg-aduana-blue text-white font-bold py-2.5 px-5 rounded-xl text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  SIGUIENTE: DECLARACIÓN
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DECLARACIONES SAG / ADUANA */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-aduana-navy" />
                  Declaración de Mercancías y Regulaciones
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Responda con total honestidad a las preguntas de control fronterizo del Servicio Agrícola y Ganadero y la Aduana de Chile.
                </p>
              </div>

              {/* SAG Section */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-sag-green flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      1. Declaración Fitosanitaria y Zoosanitaria (SAG)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ¿Trae consigo productos, partes o subproductos de origen vegetal o animal (orgánicos, frescos, semillas o procesados artesanalmente) que no cuenten con autorización previa?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pl-12">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sag-radio"
                      checked={hasSag === true}
                      onChange={() => setHasSag(true)}
                      className="w-4 h-4 text-sag-green focus:ring-sag-green"
                    />
                    Sí, traigo productos
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sag-radio"
                      checked={hasSag === false}
                      onChange={() => {
                        setHasSag(false);
                        setSagCategories([]);
                      }}
                      className="w-4 h-4 text-sag-green focus:ring-sag-green"
                    />
                    No, no traigo ninguno
                  </label>
                </div>

                {/* Conditional categories for SAG */}
                {hasSag && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-12 pt-4 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-2.5"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest col-span-full mb-1">
                      Marque los productos que porta en su equipaje:
                    </span>

                    {[
                      { id: 'fresh', label: 'Frutas, verduras u hortalizas frescas o secas' },
                      { id: 'seeds', label: 'Semillas, granos, plantas, tierra u ornamentos' },
                      { id: 'meat', label: 'Carnes de vacuno, cerdo, ave u otros derivados cárnicos' },
                      { id: 'dairy', label: 'Leche, quesos, mantequilla, yogurt o miel de abejas' },
                      { id: 'animals', label: 'Animales vivos, aves, insectos u otros especímenes' },
                      { id: 'wood', label: 'Madera sin tratar, artesanías de corteza o fibras vegetales' },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer select-none transition-all ${
                          sagCategories.includes(item.id)
                            ? 'border-sag-green bg-emerald-50/20 text-emerald-900 font-medium'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sagCategories.includes(item.id)}
                          onChange={() => toggleSagCategory(item.id)}
                          className="w-4.5 h-4.5 text-sag-green rounded border-slate-300 focus:ring-sag-green mt-0.5 cursor-pointer"
                        />
                        <span className="text-xs leading-snug">{item.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Aduana Section */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-aduana-blue flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      2. Declaración de Franquicia de Viajero y Tributos (Aduana)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ¿Trae consigo mercancías de carácter comercial o artículos en su equipaje que excedan la franquicia permitida para viajeros de <strong className="text-slate-700">US$ 500</strong> de valor total?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pl-12">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="aduana-radio"
                      checked={hasAduana === true}
                      onChange={() => setHasAduana(true)}
                      className="w-4 h-4 text-aduana-blue focus:ring-aduana-blue"
                    />
                    Sí, traigo mercancías (Excedo Franquicia)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="aduana-radio"
                      checked={hasAduana === false}
                      onChange={() => {
                        setHasAduana(false);
                        setAduanaValue(0);
                        setAduanaDescription('');
                      }}
                      className="w-4 h-4 text-aduana-blue focus:ring-aduana-blue"
                    />
                    No, todo califica dentro de la franquicia
                  </label>
                </div>

                {/* Conditional detail form for Aduanas */}
                {hasAduana && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-12 pt-4 border-t border-slate-200/60 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-slate-500" />
                          Valor Estimado Comercial (USD)
                        </label>
                        <input
                          type="number"
                          min="501"
                          placeholder="Ej: 750"
                          value={aduanaValue === 0 ? '' : aduanaValue}
                          onChange={(e) => setAduanaValue(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-aduana-blue"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Solo declare si el valor es mayor a US$500. El excedente pagará aprox. 19% IVA + aranceles.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Descripción de Artículos declarados
                        </label>
                        <textarea
                          placeholder="Detalle marcas, modelos y cantidades (Ej: 1 Laptop Gamer Asus, 2 Relojes Smart, etc.)"
                          rows={2}
                          value={aduanaDescription}
                          onChange={(e) => setAduanaDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-aduana-blue resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Step Navigation Controls */}
              <div className="border-t border-slate-100 pt-5 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  VOLVER ATRÁS
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) {
                      setStep(3);
                    }
                  }}
                  className="bg-aduana-navy hover:bg-aduana-blue text-white font-bold py-2.5 px-5 rounded-xl text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  SIGUIENTE: REVISAR Y FIRMAR
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUMMARY & OATH SIGNATURE */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-aduana-navy" />
                  Declaración de Veracidad y Firma Digital
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Revise los datos consignados antes de generar su pre-declaración electrónica conjunta.
                </p>
              </div>

              {/* Declarations Summary Cards */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Resumen de Declaración Digital
                  </h4>
                </div>

                <div className="p-4 space-y-4 text-xs divide-y divide-slate-100">
                  {/* Persona */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3">
                    <div>
                      <span className="text-slate-400 font-medium">Viajero Declarante:</span>
                      <p className="font-bold text-slate-800">{name} {lastName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">ID RUT/Pasaporte:</span>
                      <p className="font-bold font-mono text-slate-800">{user.id}</p>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 font-medium">Email:</span>
                      <p className="font-bold text-slate-800">{email}</p>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 font-medium">Acompañantes declarados:</span>
                      <p className="font-bold text-slate-800">
                        {companions === 0 ? 'Ninguno (Viaja Solo)' : `${companions} personas`}
                      </p>
                    </div>
                  </div>

                  {/* Menores de edad */}
                  <div className="py-3">
                    <span className="text-slate-400 font-medium">¿Viaja con menores de edad?</span>
                    <p className="font-bold text-slate-800">
                      {hasMinors
                        ? `Sí (${
                            minorStatus === 'ambos-padres'
                              ? 'Acompañado por ambos padres'
                              : 'Sin uno o ambos padres. Autorización adjuntada.'
                          })`
                        : 'No'}
                    </p>
                    {hasMinors && minorStatus === 'solo' && file && (
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 font-mono text-[10px] text-slate-600 mt-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{file.name}</span>
                      </div>
                    )}
                  </div>

                  {/* SAG products */}
                  <div className="py-3">
                    <span className="text-slate-400 font-medium">Productos de origen vegetal/animal (SAG):</span>
                    <p className={`font-bold mt-0.5 ${hasSag ? 'text-red-600' : 'text-emerald-700'}`}>
                      {hasSag ? 'SÍ, TRAE PRODUCTOS REGULADOS' : 'NO TRAE PRODUCTOS REGULADOS'}
                    </p>
                    {hasSag && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sagCategories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-red-50 text-red-800 border border-red-100 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {cat === 'fresh' && 'Vegetales frescos'}
                            {cat === 'seeds' && 'Semillas o plantas'}
                            {cat === 'meat' && 'Productos cárnicos'}
                            {cat === 'dairy' && 'Lácteos o miel'}
                            {cat === 'animals' && 'Especímenes vivos'}
                            {cat === 'wood' && 'Madera o artesanías'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Aduana goods */}
                  <div className="py-3">
                    <span className="text-slate-400 font-medium">Mercancías de valor comercial &gt; US$500 (Aduana):</span>
                    <p className={`font-bold mt-0.5 ${hasAduana ? 'text-red-600' : 'text-emerald-700'}`}>
                      {hasAduana
                        ? `SÍ, TRAE MERCANCÍAS (Valor declarado: US$ ${aduanaValue})`
                        : 'NO TRAE MERCANCÍAS SUJETAS A IMPUESTO'}
                    </p>
                    {hasAduana && aduanaDescription && (
                      <p className="text-slate-600 italic mt-1 bg-slate-50 border border-slate-100 p-2 rounded text-[11px]">
                        "{aduanaDescription}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Juramento */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptOath}
                    onChange={(e) => setAcceptOath(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-aduana-blue focus:ring-aduana-blue mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Juramento de Veracidad e Integridad
                    </span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      "Declaro bajo juramento que los datos aportados en esta pre-declaración conjunta son verdaderos, fidedignos y que no porto ninguna mercancía u organismo regulado adicional al consignado en este documento digital. Conozco las sanciones que la ley chilena impone por falsedad en la declaración."
                    </p>
                  </div>
                </label>

                {acceptOath && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3 border-t border-blue-200 space-y-2 max-w-md"
                  >
                    <label className="block text-xs font-bold text-slate-700">
                      Firma Digital del Viajero (Escriba su nombre completo):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Carlos Pérez González"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-aduana-blue font-sans uppercase"
                    />
                  </motion.div>
                )}
              </div>

              {/* Step Navigation Controls */}
              <div className="border-t border-slate-100 pt-5 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  VOLVER ATRÁS
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  GENERAR PRE-DECLARACIÓN DIGITAL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
