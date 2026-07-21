import { db } from './connection';
import { doctors } from '../features/doctors/doctors.schema';
import { logger } from '../config/logger';

const REAL_DOCTORS = [
  {
    firstName: 'M Zafar',
    lastName: 'Iqbal',
    email: 'zafar.iqbal@lalamedical.com',
    phone: '+92 300 0000001',
    qualification: 'MBBS, FCPS, MME',
    specialization: 'Pediatric Surgeon / CEO',
    experience: 20,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '33791-P',
    signatureText: 'Prof Dr. M Zafar Iqbal - Pediatric Surgeon / CEO',
  },
  {
    firstName: 'Shumaila',
    lastName: 'Irum',
    email: 'shumaila.irum@lalamedical.com',
    phone: '+92 300 0000002',
    qualification: 'MBBS, MME, M Phil (Physiology)',
    specialization: 'APWMO / MS',
    experience: 12,
    gender: 'Female',
    consultationFee: 500, // Dr. Shumaila Irum has Rs. 500
    registrationNumber: '41229-P',
    signatureText: 'Dr. Shumaila Irum - APWMO / MS',
  },
  {
    firstName: 'Noor Ahmed',
    lastName: 'Niazi',
    email: 'noor.niazi@lalamedical.com',
    phone: '+92 300 0000003',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Surgeon',
    experience: 15,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '15228–P',
    signatureText: 'Dr. Noor Ahmed Niazi - Consultant Surgeon',
  },
  {
    firstName: 'Afsheen',
    lastName: 'Asif',
    email: 'afsheen.asif@lalamedical.com',
    phone: '+92 300 0000004',
    qualification: 'MBBS, MCPS',
    specialization: 'Consultant Gynecologist',
    experience: 10,
    gender: 'Female',
    consultationFee: 1000,
    registrationNumber: '50192-S',
    signatureText: 'Dr. Afsheen Asif - Consultant Gynecologist',
  },
  {
    firstName: 'Mohtmam',
    lastName: 'Nazir',
    email: 'mohtmam.nazir@lalamedical.com',
    phone: '+92 300 0000005',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant General & Laparoscopic Surgeon',
    experience: 14,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '53225-P',
    signatureText: 'Dr. Mohtmam Nazir - Consultant Surgeon',
  },
  {
    firstName: 'Tahir',
    lastName: 'Mehmood',
    email: 'tahir.mehmood@lalamedical.com',
    phone: '+92 300 0000006',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Surgeon',
    experience: 16,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '29761-S',
    signatureText: 'Dr. Tahir Mehmood - Consultant Surgeon',
  },
  {
    firstName: 'Anees Ur',
    lastName: 'Rehman',
    email: 'anees.rehman@lalamedical.com',
    phone: '+92 300 0000007',
    qualification: 'MBBS, DLO, FCPS',
    specialization: 'Consultant ENT Surgeon',
    experience: 11,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '32011-P',
    signatureText: 'Dr. Anees Ur Rehman - Consultant ENT Surgeon',
  },
  {
    firstName: 'Amir',
    lastName: 'Hameed',
    email: 'amir.hameed@lalamedical.com',
    phone: '+92 300 0000008',
    qualification: 'MBBS, FCPS',
    specialization: 'Consultant Orthopedic Surgeon',
    experience: 13,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '49132-P',
    signatureText: 'Dr. Amir Hameed - Consultant Orthopedic Surgeon',
  },
  {
    firstName: 'Sajid',
    lastName: 'Ghafoor',
    email: 'sajid.ghafoor@lalamedical.com',
    phone: '+92 300 0000009',
    qualification: 'MBBS, DMRT',
    specialization: 'Consultant Oncologist',
    experience: 15,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '42801-P',
    signatureText: 'Dr. Sajid Ghafoor - Consultant Oncologist',
  },
  {
    firstName: 'Syed Abbas',
    lastName: 'Rasool',
    email: 'abbas.rasool@lalamedical.com',
    phone: '+92 300 0000010',
    qualification: 'MBBS, DIP CARD (NICVD)',
    specialization: 'Consultant Cardiologist',
    experience: 18,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '80232-P',
    signatureText: 'Dr. Syed Abbas Rasool - Consultant Cardiologist',
  },
  {
    firstName: 'Asif',
    lastName: 'Hussain',
    email: 'asif.hussain@lalamedical.com',
    phone: '+92 300 0000011',
    qualification: 'MBBS, MCPS',
    specialization: 'Consultant Anesthetist',
    experience: 9,
    gender: 'Male',
    consultationFee: 1000,
    registrationNumber: '46493-S',
    signatureText: 'Dr. Asif Hussain - Consultant Anesthetist',
  },
];

async function seedDoctors() {
  logger.info('Starting Doctor Seeding Process...');

  try {
    // 1. Clear existing dummy doctors
    await db.delete(doctors);
    logger.info('Cleared existing dummy doctor records.');

    // 2. Insert 11 real doctors
    for (const doc of REAL_DOCTORS) {
      await db.insert(doctors).values({
        ...doc,
        isActive: true,
        isDeleted: false,
      });
      logger.info(`Seeded doctor: ${doc.firstName} ${doc.lastName} (${doc.specialization}) - Rs. ${doc.consultationFee}`);
    }

    logger.info('🎉 Successfully seeded all 11 real doctor profiles with updated consultation fees!');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed doctor profiles:', error);
    process.exit(1);
  }
}

seedDoctors();
