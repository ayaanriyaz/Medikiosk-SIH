import React, { useState } from 'react';
import { TimelineEvent } from '../types';
import {
  Calendar,
  FileText,
  Activity,
  Pill,
  Hospital,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface LongitudinalContinuityTimelineProps {
  events: TimelineEvent[];
  onSelectDoc?: (docId: string) => void;
}

export const LongitudinalContinuityTimeline: React.FC<LongitudinalContinuityTimelineProps> = ({
  events,
  onSelectDoc,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CONSULT' && (e.category === 'Consultation' || e.category === 'Current Intake')) return true;
    if (activeFilter === 'MEDS' && e.category === 'Prescription') return true;
    if (activeFilter === 'LABS' && e.category === 'Lab Test') return true;
    if (activeFilter === 'HOSP' && e.category === 'Hospitalization') return true;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Current Intake':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'Prescription':
        return <Pill className="w-4 h-4 text-indigo-600" />;
      case 'Lab Test':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'Hospitalization':
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'Consultation':
      default:
        return <FileText className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Current Intake':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Prescription':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Lab Test':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hospitalization':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Consultation':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">Longitudinal Continuity Timeline</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic historical trajectory across visits, digitized prescriptions, and prior hospital records.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter('CONSULT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'CONSULT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Encounters
          </button>
          <button
            onClick={() => setActiveFilter('MEDS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'MEDS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Meds
          </button>
          <button
            onClick={() => setActiveFilter('LABS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'LABS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Labs
          </button>
          <button
            onClick={() => setActiveFilter('HOSP')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'HOSP' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital
          </button>
        </div>
      </div>

      {/* Continuity Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map((event, idx) => {
          const isExpanded = expandedEvents[event.id] ?? (idx < 2);

          return (
            <div key={event.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-600 flex items-center justify-center shadow-xs transition-colors">
                <div className="w-2 h-2 rounded-full bg-teal-600"></div>
              </div>

              {/* Event Card */}
              <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryBadgeClass(event.category)}`}>
                        {getCategoryIcon(event.category)}
                        <span>{event.category}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {event.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{event.title}</h4>
                  </div>

                  <button
                    onClick={() => toggleExpand(event.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Summary / Body */}
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{event.summary}</p>

                {/* Additional Details on Expand */}
                {isExpanded && event.sourceDocId && onSelectDoc && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">Document Identifier: {event.sourceDocId}</span>
                    <button
                      onClick={() => onSelectDoc(event.sourceDocId!)}
                      className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold text-[11px] cursor-pointer"
                    >
                      <span>View Digitized Source</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            No historical continuity records matching this filter category.
          </div>
        )}
      </div>
    </div>
  );
};
