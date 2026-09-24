import React, { useState } from 'react';
import { Patient } from '../types';
import {
  Search,
  User,
  Stethoscope,
  Building2,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface PatientDirectoryProps {
  patients: Patient[];
  isLoading: boolean;
  onSelectPatient: (patient: Patient) => void;
  onRefresh: () => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  patients,
  isLoading,
  onSelectPatient,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Pending Review' | 'Critical'>('ALL');
  const [hospitalFilter, setHospitalFilter] = useState<string>('ALL');

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.token.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.assignedDoctorName && p.assignedDoctorName.toLowerCase().includes(q)) ||
      (p.assignedHospitalName && p.assignedHospitalName.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Critical' && (p.status === 'Critical' || (p.vitals && p.vitals.pulse && p.vitals.pulse > 105))) ||
      p.status === statusFilter;

    const matchHospital =
      hospitalFilter === 'ALL' ||
      p.assignedHospitalName?.toLowerCase().includes(hospitalFilter.toLowerCase());

    return matchSearch && matchStatus && matchHospital;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Patient Directory & Health Records</span>
              <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200">
                {patients.length} Patients
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated mock patient registry with full EHR relations (Patient → Doctor → Hospital).
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Records</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, ABHA, Doctor, City..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Clinical Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Critical">Critical Priority</option>
            </select>
          </div>

          {/* Hospital Filter */}
          <div className="sm:col-span-3">
            <select
              value={hospitalFilter}
              onChange={e => setHospitalFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Hospitals</option>
              <option value="MediCare">MediCare Hospital (Kanpur)</option>
              <option value="City Heart">City Heart Hospital (Lucknow)</option>
              <option value="Ayush Wellness">Ayush Wellness Hospital</option>
              <option value="All India">All India Institute of Ayurveda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table: Patient | Age | Gender | Patient ID | Doctor | Hospital | Status */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-3">Age</th>
              <th className="py-3 px-3">Gender</th>
              <th className="py-3 px-3 font-mono">Patient ID</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Hospital</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  <span>Loading patient registry...</span>
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>No patients matching search criteria.</span>
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => {
                const isCrit = patient.status === 'Critical' || (patient.vitals?.pulse && patient.vitals.pulse > 105);
                return (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Patient Name & City */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {patient.name}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {patient.city || 'Kanpur'} {patient.bloodGroup ? `• ${patient.bloodGroup}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {patient.age} yrs
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-3 text-slate-600">
                      {patient.gender}
                    </td>

                    {/* Patient ID */}
                    <td className="py-3 px-3 font-mono font-bold text-teal-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] border border-slate-200">
                        {patient.id}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            {patient.assignedDoctorName || 'Assigned Doctor'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {patient.department || 'Consultant'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hospital */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-700 text-[11px] line-clamp-1">
                          {patient.assignedHospitalName || 'Affiliated Hospital'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        isCrit
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : patient.status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isCrit && <AlertCircle className="w-3 h-3 text-red-600" />}
                        <span>{patient.status || 'Active'}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(patient);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span>Showing {filteredPatients.length} of {patients.length} registered patients</span>
        <span className="text-[11px]">Click on any patient row to open their full clinical profile & chatbot.</span>
      </div>
    </div>
  );
};
