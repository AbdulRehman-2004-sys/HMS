'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import { createVisitApi } from '../lib/visits';
import { X, UserCheck, Stethoscope, Activity, FileText } from 'lucide-react';

interface DoctorOption {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
}

interface CreateVisitModalProps {
  patient: {
    id: string;
    mrNumber: string;
    firstName: string;
    lastName: string;
    age?: number | null;
    gender: string;
    mobileNumber: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateVisitModal: React.FC<CreateVisitModalProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pulse, setPulse] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await api.get('/doctors', { params: { limit: 100 } });
        const list = res.data?.data?.doctors || [];
        setDoctors(list);
        if (list.length > 0) {
          setSelectedDoctorId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setErrorMsg('Please select a doctor to assign the patient');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await createVisitApi({
        patientId: patient.id,
        doctorId: selectedDoctorId,
        chiefComplaint: chiefComplaint.trim() || undefined,
        temperature: temperature.trim() || undefined,
        pulse: pulse.trim() || undefined,
        bloodPressure: bloodPressure.trim() || undefined,
        weight: weight.trim() || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create visit and queue patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Reception Check-In & Queue</h3>
              <p className="text-[11px] text-slate-400">Create OPD Patient Encounter Visit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Patient Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">{patient.firstName} {patient.lastName}</span>
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">{patient.mrNumber} • {patient.gender} • {patient.age ? `${patient.age} yrs` : 'N/A'}</p>
            </div>
            <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded font-semibold text-[11px]">
              {patient.mobileNumber}
            </span>
          </div>

          {/* Doctor Assignment Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
              <span>Assign OPD Doctor *</span>
            </label>
            {loadingDoctors ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-md border border-slate-200"></div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName} — {doc.specialization} (Fee: PKR {doc.consultationFee})
                  </option>
                ))}
              </select>
            )}
            {selectedDoctor && (
              <p className="text-[11px] text-slate-500 font-medium pl-1">
                Fee: <strong className="text-slate-800">PKR {selectedDoctor.consultationFee}</strong> • {selectedDoctor.qualification}
              </p>
            )}
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>Chief Complaint (Primary Symptoms)</span>
            </label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Fever, abdominal pain, severe headache..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Vitals Form Grid */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-red-500" />
              <span>Initial Intake Vitals (Optional)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-500">Temp</span>
                <input
                  type="text"
                  placeholder="98.6 F"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500">Pulse</span>
                <input
                  type="text"
                  placeholder="72 bpm"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500">Blood Pressure</span>
                <input
                  type="text"
                  placeholder="120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500">Weight</span>
                <input
                  type="text"
                  placeholder="70 kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingDoctors}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow transition flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Checking In...' : 'Check In & Add to Queue'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
