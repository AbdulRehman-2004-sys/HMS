import React, { useEffect, useState } from 'react';
import { getHospitalSettingsApi } from '../lib/settings';

export interface RegistrationSlipProps {
  hospitalName?: string;
  patientName: string;
  mrNumber: string;
  age?: number | string | null;
  gender: string;
  mobileNumber: string;
  registrationDate: string;
  receptionistName: string;
  fatherHusbandName?: string | null;
  address?: string | null;
  city?: string | null;
}

export const RegistrationSlip: React.FC<RegistrationSlipProps> = ({
  hospitalName: initialHospitalName,
  patientName,
  mrNumber,
  age,
  gender,
  mobileNumber,
  registrationDate,
  receptionistName,
  fatherHusbandName,
  address,
  city,
}) => {
  const [dynHospitalName, setDynHospitalName] = useState(initialHospitalName || 'LALA MEDICAL COMPLEX');

  useEffect(() => {
    if (!initialHospitalName) {
      getHospitalSettingsApi()
        .then((res) => {
          if (res.hospitalName) setDynHospitalName(res.hospitalName.toUpperCase());
        })
        .catch(() => {});
    }
  }, [initialHospitalName]);

  const hospitalName = dynHospitalName;

  const formattedDate = new Date(registrationDate).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="registration-slip text-black bg-white p-4 font-mono text-xs max-w-[80mm] mx-auto border border-slate-200">
      {/* Hospital Header */}
      <div className="text-center border-b border-black pb-2 mb-3">
        <h2 className="font-extrabold text-sm uppercase tracking-wider">{hospitalName}</h2>
        <p className="text-[10px] uppercase font-bold tracking-tight">Patient Registration Slip</p>
      </div>

      {/* Primary MR Number Box */}
      <div className="my-2 border-2 border-black p-2 text-center bg-slate-50">
        <span className="text-[10px] font-bold block uppercase tracking-wide">Medical Record Number (MRN)</span>
        <span className="font-black text-base tracking-widest block font-mono mt-0.5">{mrNumber}</span>
      </div>

      {/* Patient Details */}
      <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-3 mb-3">
        <div className="flex justify-between">
          <span className="font-bold">Patient:</span>
          <span className="font-bold uppercase">{patientName}</span>
        </div>

        {fatherHusbandName && (
          <div className="flex justify-between">
            <span className="text-slate-600">S/O, D/O, W/O:</span>
            <span>{fatherHusbandName}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-600">Age / Gender:</span>
          <span>{age ? `${age} Yrs` : 'N/A'} / {gender}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Mobile:</span>
          <span>{mobileNumber}</span>
        </div>

        {city && (
          <div className="flex justify-between">
            <span className="text-slate-600">City / Address:</span>
            <span className="truncate max-w-[130px] text-right">{city}{address ? `, ${address}` : ''}</span>
          </div>
        )}
      </div>

      {/* System Metadata */}
      <div className="space-y-1 text-[10px] text-slate-700">
        <div className="flex justify-between">
          <span>Reg Date:</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Operator:</span>
          <span>{receptionistName}</span>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-4 pt-2 border-t border-black text-center text-[9px] uppercase tracking-tight">
        <p className="font-bold">Keep this slip for all future hospital visits.</p>
        <p className="mt-0.5 text-slate-500">Thank you for choosing LALA Medical Complex.</p>
      </div>

      {/* CSS Print Styles for Thermal Printer 80mm */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .registration-slip, .registration-slip * {
            visibility: visible;
          }
          .registration-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
};
