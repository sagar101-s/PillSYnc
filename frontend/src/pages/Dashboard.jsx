import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';

const Dashboard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notesModal, setNotesModal] = useState({ open: false, log: null, noteText: '' });

  const fetchDashboardData = async () => {
    try {
      const res = await api.getDashboard();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup timer to update next dose countdown every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleAction = async (medId, time, status, notes = '') => {
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        scheduledTime: time,
        notes
      };

      let res;
      if (status === 'Taken') {
        res = await api.markTaken(medId, payload);
      } else if (status === 'Missed') {
        res = await api.markMissed(medId, payload);
      } else if (status === 'Skipped') {
        res = await api.markSkipped(medId, payload);
      }

      if (res && res.success) {
        showToast(`Dose marked as ${status}!`, 'success');
        // Refresh dashboard
        fetchDashboardData();
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const getRemainingTimeStr = (scheduledDateTime) => {
    const diffMs = new Date(scheduledDateTime) - currentTime;
    if (diffMs < 0) return 'Dose is overdue!';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `in ${diffHours} hr ${remainingMins} min${remainingMins !== 1 ? 's' : ''}`;
  };

  if (loading) return <Spinner fullPage />;

  const { todaySummary, nextDose, todayMedicines, recentActivity } = data || {
    todaySummary: { total: 0, taken: 0, missed: 0, pending: 0, skipped: 0, adherence: 100 },
    nextDose: null,
    todayMedicines: [],
    recentActivity: []
  };

  // SVG parameters for Adherence circle
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todaySummary.adherence / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-800 text-white shadow-glow-primary animate-slide-in">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            Hello John! <Heart className="w-5 h-5 fill-red-400 text-red-400 animate-pulse" />
          </h3>
          <p className="text-primary-100 text-sm">
            Here is your medication tracking summary for today. Keep up the great work!
          </p>
        </div>
        <Link 
          to="/today"
          className="self-start md:self-center px-4 py-2.5 rounded-xl bg-white text-primary-600 font-semibold text-xs hover:bg-primary-50 transition-all flex items-center gap-1.5 shadow"
        >
          View Full Today's Schedule <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Doses Card */}
        <Card className="flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Today's Doses
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{todaySummary.total}</span>
            <span className="text-xs font-medium text-slate-400">slots</span>
          </div>
        </Card>

        {/* Taken Card */}
        <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Taken <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{todaySummary.taken}</span>
            <span className="text-xs font-medium text-slate-400">taken</span>
          </div>
        </Card>

        {/* Missed Card */}
        <Card className="flex flex-col justify-between border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Missed <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">{todaySummary.missed}</span>
            <span className="text-xs font-medium text-slate-400">missed</span>
          </div>
        </Card>

        {/* Pending Card */}
        <Card className="flex flex-col justify-between border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Pending <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{todaySummary.pending}</span>
            <span className="text-xs font-medium text-slate-400">left</span>
          </div>
        </Card>

        {/* Adherence Circle Card */}
        <Card className="col-span-2 lg:col-span-1 flex items-center justify-between lg:justify-center lg:flex-col gap-3 py-4">
          <div className="text-left lg:text-center">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Today's Adherence
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {todaySummary.adherence}%
            </p>
          </div>
          
          {/* Progress Circular Arc */}
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-primary-500 dark:stroke-primary-400 fill-none transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-[10px] font-bold text-slate-500 dark:text-slate-400">
              ADHERENT
            </div>
          </div>
        </Card>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Next Dose and Upcoming Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Dose Highlight Card */}
          {nextDose ? (
            <Card glow className="border border-primary-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-950/50 rounded-2xl text-primary-500">
                    <Clock className="w-6 h-6 animate-pulse-glow" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest bg-primary-500/10 dark:bg-primary-400/10 px-2 py-0.5 rounded-md">
                      Next Medication Due
                    </span>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {nextDose.medicineName} <span className="text-sm font-normal text-slate-400">({nextDose.dosage})</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Scheduled for <strong className="text-slate-700 dark:text-slate-300">{nextDose.scheduledTime}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="text-left sm:text-right bg-primary-50 dark:bg-darkbg-800 px-4 py-3 rounded-2xl">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Remaining Countdown
                  </p>
                  <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                    {getRemainingTimeStr(nextDose.scheduledDateTime)}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-emerald-500/5 border border-emerald-500/10 text-center py-6">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100">All Done For Today!</h4>
              <p className="text-xs text-slate-500 mt-1">No upcoming scheduled doses left on your calendar today.</p>
            </Card>
          )}

          {/* Quick Schedule Checklist Card */}
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" /> Today's Doses Quick-Check
              </h3>
              <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                {todayMedicines.length} scheduled
              </span>
            </div>

            {todayMedicines.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {todayMedicines.map((log, index) => {
                  const isTaken = log.status === 'Taken';
                  const isMissed = log.status === 'Missed';
                  const isSkipped = log.status === 'Skipped';
                  
                  return (
                    <div key={index} className="py-3.5 flex items-center justify-between gap-4 animate-slide-in">
                      <div className="flex items-start gap-3">
                        {/* Status Checkbox Button */}
                        <button
                          disabled={isTaken || isMissed || isSkipped}
                          onClick={() => handleAction(log.medicationId, log.scheduledTime, 'Taken')}
                          className={`
                            w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 transition-colors
                            ${isTaken 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : isMissed 
                              ? 'bg-red-500 border-red-500 text-white'
                              : isSkipped
                              ? 'bg-slate-300 border-slate-300 text-slate-600 dark:bg-slate-700 dark:border-slate-600'
                              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400'
                            }
                          `}
                        >
                          {isTaken && <CheckCircle className="w-4 h-4" />}
                          {isMissed && <XCircle className="w-4 h-4" />}
                          {isSkipped && <span className="text-[10px] font-bold">S</span>}
                        </button>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm ${isTaken ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                              {log.medication ? log.medication.medicineName : 'Unknown Medicine'}
                            </h4>
                            <span className="text-xs text-slate-400 font-normal">({log.medication ? log.medication.dosage : ''})</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {log.scheduledTime}
                            </span>
                            
                            {/* Badges */}
                            {isTaken && (
                              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">
                                Taken at {new Date(log.takenTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {isMissed && (
                              <span className="text-[10px] font-semibold bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded">
                                Missed
                              </span>
                            )}
                            {isSkipped && (
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown/Actions (Only visible if pending) */}
                      {!isTaken && !isMissed && !isSkipped && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAction(log.medicationId, log.scheduledTime, 'Taken')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => {
                              setNotesModal({
                                open: true,
                                log: log,
                                noteText: ''
                              });
                            }}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold transition-all"
                          >
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No medications scheduled for today. Add a new medication regimen first.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Activities Feed */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/50 flex-shrink-0">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Recent Activities
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const isTaken = activity.status === 'Taken';
                  const isMissed = activity.status === 'Missed';
                  const isSkipped = activity.status === 'Skipped';
                  const time = new Date(activity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const date = new Date(activity.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={index} className="flex gap-3 text-left">
                      {/* Vertical line connector */}
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0
                          ${isTaken 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                            : isMissed 
                            ? 'bg-red-500/10 border-red-500 text-red-500'
                            : 'bg-amber-500/10 border-amber-500 text-amber-500'
                          }
                        `}>
                          {isTaken && <CheckCircle className="w-4 h-4" />}
                          {isMissed && <XCircle className="w-4 h-4" />}
                          {isSkipped && <AlertCircle className="w-4 h-4" />}
                        </div>
                        {index < recentActivity.length - 1 && (
                          <div className="w-0.5 flex-grow bg-slate-200 dark:bg-slate-800 my-1" />
                        )}
                      </div>
                      
                      <div className="flex-1 pb-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {activity.medicineName} <span className="font-normal text-slate-400">({activity.status.toLowerCase()})</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Scheduled for {activity.scheduledTime} • Logged on {date} at {time}
                        </p>
                        {activity.notes && (
                          <p className="text-[11px] italic text-slate-400 mt-1 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-200/20">
                            "{activity.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No logged activities yet. Mark today's schedule to see log updates.
                </div>
              )}
            </div>
            
            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-center flex-shrink-0">
              <Link 
                to="/history"
                className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-1 group"
              >
                Go to Complete Logs History <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Skip Dose Modal Notes Form */}
      {notesModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-darkbg-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl mx-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Skip Dose Medication Log
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add any explanations or notes for skipping {notesModal.log?.medication?.medicineName} ({notesModal.log?.scheduledTime}).
            </p>

            <textarea
              className="w-full mt-4 p-3 border border-slate-200 dark:border-slate-800 dark:bg-darkbg-850 rounded-xl text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none dark:text-slate-200"
              rows="3"
              placeholder="e.g. Doctor recommendation, stomach issue, or forgot..."
              value={notesModal.noteText}
              onChange={(e) => setNotesModal(prev => ({ ...prev, noteText: e.target.value }))}
            />

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setNotesModal({ open: false, log: null, noteText: '' })}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction(
                    notesModal.log.medicationId,
                    notesModal.log.scheduledTime,
                    'Skipped',
                    notesModal.noteText
                  );
                  setNotesModal({ open: false, log: null, noteText: '' });
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                Confirm Skip Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
