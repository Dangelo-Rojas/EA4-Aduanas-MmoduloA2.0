/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Declaration } from './types';

// Simple check if string could be a valid Passport or RUT
export function validateRutOrPassport(value: string): { isValid: boolean; type: 'RUT' | 'Passport' } {
  const clean = value.replace(/[\s\.\-]/g, '').trim();
  if (clean.length < 5) {
    return { isValid: false, type: 'Passport' };
  }

  // If it's pure numbers or ending with K/k, it's likely a RUT
  const isRutPattern = /^\d+[0-9kK]$/.test(clean);
  if (isRutPattern) {
    return { isValid: validateChileneanRut(clean), type: 'RUT' };
  }

  // Otherwise assume it is a Passport (accept broad range of letters/numbers, 6 to 15 chars)
  const isPassportPattern = /^[a-zA-Z0-9]{5,20}$/.test(clean);
  return { isValid: isPassportPattern, type: 'Passport' };
}

// Format Chilean RUT dynamically while typing (e.g. 12.345.678-9)
export function formatRUT(rut: string): string {
  let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  
  const dv = clean.slice(-1);
  const num = clean.slice(0, -1);
  
  if (num.length === 0) return dv;

  let formatted = '';
  let count = 0;
  for (let i = num.length - 1; i >= 0; i--) {
    formatted = num.charAt(i) + formatted;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formatted = '.' + formatted;
    }
  }
  
  return `${formatted}-${dv}`;
}

// Standard Chilean RUT Validation (Module 11)
function validateChileneanRut(rutStr: string): boolean {
  const clean = rutStr.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  let sum = 0;
  let mul = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  
  const res = 11 - (sum % 11);
  let expectedDv = '';
  if (res === 11) expectedDv = '0';
  else if (res === 10) expectedDv = 'K';
  else expectedDv = res.toString();
  
  return expectedDv === dv;
}

// Generate unique pre-declaration reference ID
export function generateDeclarationID(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ADV-${num}`;
}

// Determine routing status based on declaration items
export function determineStatus(hasSag: boolean, hasAduana: boolean): Declaration['status'] {
  if (hasSag && hasAduana) {
    return 'Inspección Conjunta Requerida';
  }
  if (hasSag) {
    return 'Sujeto a Inspección SAG';
  }
  if (hasAduana) {
    return 'Pendiente de Pago de Impuestos';
  }
  return 'Aprobado (Vía Verde)';
}
