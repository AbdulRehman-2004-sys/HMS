import { api } from './api-client';


export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  sequence?: number;
}

export interface CreatePrescriptionPayload {
  visitId?: string | null;
  patientId: string;
  doctorId: string;
  diagnosis?: string | null;
  advice?: string | null;
  followUpDate?: string | null;
  items: PrescriptionItem[];
}

export interface PrescriptionData {
  id: string;
  prescriptionNumber: string;
  visitId?: string | null;
  patientId: string;
  doctorId: string;
  diagnosis?: string | null;
  advice?: string | null;
  followUpDate?: string | null;
  status: string;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicineOption {
  id: string;
  name: string;
  category: string;
  defaultDosage: string;
  defaultFrequency: string;
}

// 1. Create e-Prescription
export async function createPrescriptionApi(payload: CreatePrescriptionPayload): Promise<PrescriptionData> {
  const res = await api.post('/prescriptions', payload);
  return res.data.data.prescription;
}

// 2. Get Prescription by Visit ID
export async function getPrescriptionByVisitApi(visitId: string): Promise<PrescriptionData | null> {
  const res = await api.get(`/prescriptions/visit/${visitId}`);
  return res.data.data.prescription;
}

// 3. Search Drug Library
export async function searchMedicinesApi(query: string): Promise<MedicineOption[]> {
  const res = await api.get('/prescriptions/medicines/search', { params: { query } });
  return res.data.data.medicines || [];
}
