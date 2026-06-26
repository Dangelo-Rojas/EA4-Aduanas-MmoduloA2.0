/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Traveler {
  id: string; // RUT or Passport
  name: string;
  lastName: string;
  email: string;
  countryOfOrigin: string;
}

export type MinorStatus = 'ambos-padres' | 'solo';

export interface Declaration {
  id: string; // ADV-XXXXXX
  traveler: Traveler;
  companionsCount: number;
  hasMinors: boolean;
  minorStatus?: MinorStatus;
  minorAuthFileName?: string;
  minorAuthFileDataUrl?: string; // for mock persistence preview
  hasSagProducts: boolean;
  sagCategories?: string[]; // e.g. fruit, seeds, meat, dairy
  hasAduanaGoods: boolean;
  aduanaValue?: number;
  aduanaDescription?: string;
  createdAt: string;
  status: 'Aprobado (Vía Verde)' | 'Sujeto a Inspección SAG' | 'Pendiente de Pago de Impuestos' | 'Inspección Conjunta Requerida';
}
