import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LiveQueueItem } from '../types';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Volume2,
  RefreshCw,
  Send,
  Building2,
  UserCheck,
  Stethoscope,
} from 'lucide-react';

interface LiveWaitingQueueViewProps {
  onSelectPatient?: (patientId: string) => void;
  userRole?: 'PATIENT' | 'DOCTOR' | 'STAFF' | 'ADMIN';
}

export const LiveWaitingQueueView: React.FC<LiveWaitingQueueViewProps> = ({
  onSelectPatient,
  userRole = 'PATIENT',
}) => {
  const { language, t, localize, isMarathi, isHindi } = useLanguage();
  const [queue, setQueue] = useState<LiveQueueItem[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<LiveQueueItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchToken, setSearchToken] = useState('A-042');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [audioAnnouncement, setAudioAnnouncement] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'STABLE'>('ALL');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rural/queue');
      const data = await res.json();
      if (data.status === 'success') {
        setQueue(data.rawQueue || []);
        setCurrentlyServing(data.currentlyServing || null);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQueueAction = async (action: string, itemId?: string, newCategory?: string) => {
    try {
      const res = await fetch('/api/rural/queue/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          itemId,
          newCategory,
          doctorName: 'Dr. Ananya Deshmukh (Medical Officer)',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchQueue();
        if (action === 'CALL_NEXT' && data.currentlyServing) {
          playAudioAnnouncement(data.currentlyServing.token, data.currentlyServing.patientName);
        }
      }
    } catch (err) {
      console.error('Queue action error:', err);
    }
  };

  const playAudioAnnouncement = (token: string, patientName: string) => {
    let msg = `Token ${token}, ${patientName}, please proceed to OPD Consultation Room 2.`;
    if (isMarathi) {
      msg = `टोकन क्रमांक ${token}, ${patientName}, कृपया ओपीडी तपासणी कक्ष २ मध्ये यावे.`;
    } else if (isHindi) {
      msg = `टोकन संख्या ${token}, ${patientName}, कृपया ओपीडी कक्ष संख्या २ में पधारें।`;
    }
    setAudioAnnouncement(msg);
    setTimeout(() => setAudioAnnouncement(null), 8000);
  };

  const handleTrigger1HourNotification = async (aptId: string) => {
    try {
      const res = await fetch(`/api/rural/appointments/${aptId}/trigger-1hr-reminder`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.status === 'success') {
        const text = isMarathi
          ? data.notification.messageMr
          : data.notification.messageEn;
        setNotificationStatus(`1-Hour Notification Sent to ${data.notification.patientPhone}: "${text}"`);
        setTimeout(() => setNotificationStatus(null), 7000);
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  const filteredQueue = queue.filter(item => {
    if (activeCategoryFilter === 'ALL') return true;
    return item.triageCategory === activeCategoryFilter;
  });

  const searchedItem = queue.find(q => q.token.toLowerCase() === searchToken.trim().toLowerCase());
  const patientsAheadCount = searchedItem
    ? queue.filter(q => q.status === 'WAITING' && q.position < searchedItem.position).length +
      (currentlyServing && currentlyServing.token !== searchedItem.token ? 1 : 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Audio Chime Notification Banner */}
      {audioAnnouncement && (
        <div className="p-4 bg-amber-500 text-slate-950 font-bold rounded-2xl flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="text-base tracking-wide">{audioAnnouncement}</span>
          </div>
          <button
            onClick={() => setAudioAnnouncement(null)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1-Hour Reminder Sent Banner */}
      {notificationStatus && (
        <div className="p-4 bg-teal-50 border border-teal-300 text-teal-900 rounded-2xl flex items-start gap-3 shadow-xs">
          <Bell className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
          <div className="text-sm font-semibold">{notificationStatus}</div>
        </div>
      )}

      {/* Top Banner: Facility Live Status & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-teal-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isMarathi
                    ? 'थेट ओपीडी प्रतीक्षा रांग व टोकन व्यवस्था'
                    : isHindi
                    ? 'लाइव ओपीडी प्रतीक्षा कतार व टोकन प्रबंधन'
                    : 'Live OPD Waiting Queue & Token Management'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isMarathi
                  ? 'भोर प्राथमिक आरोग्य केंद्र • कक्ष क्र. २ (वैद्यकीय अधिकारी कक्ष)'
                  : 'Bhor Primary Health Centre (PHC) • OPD Room 2 • Dr. Ananya Deshmukh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchQueue}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'रीफ्रेश' : isHindi ? 'रिफ्रेश' : localize('Refresh')}
            </button>

            {/* Doctor / Staff Controls */}
            <button
              onClick={() => handleQueueAction('CALL_NEXT')}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-md shadow-teal-200 flex items-center gap-2 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isMarathi ? 'पुढील रुग्ण बोलवा (Call Next)' : isHindi ? 'अगला मरीज बुलाएं' : localize('Call Next Patient')}
            </button>
          </div>
        </div>

        {/* Big Live Screen Display (Kiosk / Waiting Hall Display) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Card 1: Currently Serving Token */}
          <div className="bg-gradient-to-br from-teal-800 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
              {isMarathi ? 'सध्या तपासणी सुरू असलेले टोकन' : isHindi ? 'वर्तमान में परामर्श जारी' : localize('Now In Consultation')}
            </div>
            {currentlyServing ? (
              <div>
                <div className="text-5xl font-black tracking-tight text-white my-1">
                  {currentlyServing.token}
                </div>
                <div className="text-base font-bold text-teal-100 flex items-center gap-2 mt-1">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  {currentlyServing.patientName} ({currentlyServing.patientAge}y / {currentlyServing.patientGender})
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wide ${
                      currentlyServing.triageCategory === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : currentlyServing.triageCategory === 'MEDIUM'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {currentlyServing.triageCategory}
                  </span>
                  <span className="text-xs text-teal-200">Room 2 • Dr. Deshmukh</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-teal-200 text-sm font-medium">
                {isMarathi ? 'सध्या कोणताही रुग्ण केबिनमध्ये नाही' : 'No patient currently inside consultation room'}
              </div>
            )}
          </div>

          {/* Card 2: Next In Line */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isMarathi ? 'पुढील टोकन (तयार राहा)' : isHindi ? 'अगला टोकन' : localize('Next In Line (Get Ready)')}
            </div>
            {queue.find(q => q.status === 'WAITING') ? (
              (() => {
                const nextP = queue.find(q => q.status === 'WAITING')!;
                return (
                  <div>
                    <div className="text-4xl font-extrabold text-slate-900 my-1">
                      {nextP.token}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {nextP.patientName} ({nextP.patientAge}y)
                    </div>
                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {isMarathi
                        ? `अंदाजे प्रतीक्षा: ${nextP.estimatedWaitMinutes} मिनिटे`
                        : `Estimated wait: ~${nextP.estimatedWaitMinutes} mins`}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-slate-500 py-3 font-medium">
                {isMarathi ? 'प्रतीक्षा यादी रिक्त आहे' : 'Waiting line is clear'}
              </div>
            )}
          </div>

          {/* Card 3: Personalized Token Lookup & 1-Hour Travel Guidance */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isMarathi ? 'माझे टोकन तपासा' : isHindi ? 'अपना टोकन जांचें' : localize('Check My Token Wait')}</span>
              <Bell className="w-4 h-4 text-amber-700" />
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchToken}
                onChange={e => setSearchToken(e.target.value)}
                placeholder="e.g. A-042"
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {searchedItem ? (
              <div className="space-y-1.5 text-xs text-amber-950 font-medium">
                <div className="flex justify-between">
                  <span>{isMarathi ? 'रुग्ण:' : 'Patient:'}</span>
                  <span className="font-bold">{searchedItem.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isMarathi ? 'आपल्या आधी रुग्ण:' : 'Ahead in line:'}</span>
                  <span className="font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                    {patientsAheadCount} patients
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isMarathi ? 'अंदाजे वेळ:' : 'Estimated Time:'}</span>
                  <span className="font-extrabold text-teal-800">
                    ~{patientsAheadCount * 10} minutes
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800">
                    {isMarathi ? '१ तास आधी आठवण पाठवा:' : 'Test 1-Hr Reminder:'}
                  </span>
                  <button
                    onClick={() => handleTrigger1HourNotification('APT-MH-201')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800">
                {isMarathi ? 'टोकन क्रमांक टाकून रांग स्थिती पहा.' : 'Enter token to check live position and wait time.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Triage Stratified Queue Table (CRITICAL / MEDIUM / STABLE) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isMarathi
                ? 'रुग्ण रांग प्राधान्य वर्गवारी (Critical / Medium / Stable)'
                : isHindi
                ? 'मरीज कतार प्राथमिकता वर्गीकरण'
                : 'Triage-Stratified OPD Patient Queue'}
            </h3>
            <p className="text-xs text-slate-500">
              {isMarathi
                ? 'आरोग्य धोक्यानुसार आपोआप क्रमवारी: गंभीर रुग्ण त्वरित, मध्यम प्राधान्य, आणि स्थिर नियमित रुग्ण'
                : 'Categorized by clinical priority to ensure zero preventable delays in rural emergency care'}
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            {(['ALL', 'CRITICAL', 'MEDIUM', 'STABLE'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeCategoryFilter === cat
                    ? cat === 'CRITICAL'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : cat === 'MEDIUM'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : cat === 'STABLE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-teal-700 text-white shadow-xs'
                    : 'hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL'
                  ? isMarathi ? 'सर्व' : 'All'
                  : cat === 'CRITICAL'
                  ? isMarathi ? 'गंभीर' : 'Critical'
                  : cat === 'MEDIUM'
                  ? isMarathi ? 'मध्यम' : 'Medium'
                  : isMarathi ? 'स्थिर' : 'Stable'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient & Vitals</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Doctor / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQueue.map(item => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition ${
                    item.status === 'SERVING' ? 'bg-teal-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs">
                      {item.token}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.patientName}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.patientAge}y • {item.patientGender} • BP: {item.vitals?.bp || 'N/A'} • SpO2: {item.vitals?.spo2 || 'N/A'}%
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.triageCategory === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : item.triageCategory === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {item.triageCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={item.chiefComplaint}>
                    {item.chiefComplaint}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.status === 'SERVING'
                      ? 'In Consultation'
                      : `~${item.estimatedWaitMinutes} mins`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'SERVING'
                          ? 'bg-teal-600 text-white animate-pulse'
                          : item.status === 'WAITING'
                          ? 'bg-slate-200 text-slate-800'
                          : item.status === 'HOLD'
                          ? 'bg-yellow-200 text-yellow-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Physician Reprioritize Dropdown */}
                      <select
                        value={item.triageCategory}
                        onChange={e => handleQueueAction('REPRIORITIZE', item.id, e.target.value)}
                        className="text-[10px] font-bold bg-slate-100 border border-slate-300 rounded px-1.5 py-1 text-slate-700"
                        title="Physician Override Priority"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="STABLE">Stable</option>
                      </select>

                      {item.status === 'WAITING' && (
                        <button
                          onClick={() => handleQueueAction('SET_STATUS', item.id, 'SERVING')}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold"
                        >
                          Call
                        </button>
                      )}

                      {item.status === 'SERVING' && (
                        <button
                          onClick={() => handleQueueAction('SET_STATUS', item.id, 'COMPLETED')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Finish
                        </button>
                      )}

                      {onSelectPatient && (
                        <button
                          onClick={() => onSelectPatient(item.patientId)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-bold"
                        >
                          Record
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
