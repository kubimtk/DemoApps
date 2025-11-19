import { useState, useEffect, FormEvent } from 'react';

interface Appointment {
  id: string;
  dateTime: string;
  email: string;
  title: string;
  status: 'confirmed' | 'moved' | 'cancelled';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateTime, setDateTime] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [emailError, setEmailError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [emailLog, setEmailLog] = useState<string[]>([]);

  // Load appointments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (e) {
        console.error('Fehler beim Laden der Termine:', e);
      }
    }
  }, []);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const simulateApiCall = async (callback: () => void) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    callback();
    setIsLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (!dateTime || !title) {
      return;
    }

    await simulateApiCall(() => {
      const newAppointment: Appointment = {
        id: crypto.randomUUID(),
        dateTime,
        email,
        title,
        status: 'confirmed',
      };

      setAppointments([...appointments, newAppointment]);
      console.log('📧 Bestätigung an:', email);
      setEmailLog(prev => [...prev, `📧 Bestätigung an: ${email} - ${new Date().toLocaleTimeString()}`]);
      showToast('Termin erfolgreich erstellt!', 'success');

      // Reset form
      setDateTime('');
      setEmail('');
      setTitle('');
    });
  };

  const handleMove = async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    const newDateTime = prompt('Neues Datum und Uhrzeit (YYYY-MM-DDTHH:MM):', appointment.dateTime);
    if (newDateTime && newDateTime !== appointment.dateTime) {
      await simulateApiCall(() => {
        setAppointments(appointments.map(a =>
          a.id === id
            ? { ...a, dateTime: newDateTime, status: 'moved' as const }
            : a
        ));
        console.log('📧 Update an:', appointment.email);
        setEmailLog(prev => [...prev, `📧 Update an: ${appointment.email} - ${new Date().toLocaleTimeString()}`]);
        showToast('Termin erfolgreich verschoben!', 'success');
      });
    }
  };

  const handleCancel = async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    if (confirm(`Möchten Sie den Termin "${appointment.title}" wirklich stornieren?`)) {
      await simulateApiCall(() => {
        setAppointments(appointments.filter(a => a.id !== id));
        console.log('📧 Storno an:', appointment.email);
        setEmailLog(prev => [...prev, `📧 Storno an: ${appointment.email} - ${new Date().toLocaleTimeString()}`]);
        showToast('Termin erfolgreich storniert!', 'success');
      });
    }
  };

  const handleCopy = async (appointment: Appointment) => {
    const text = `Termin: ${appointment.title}\nDatum: ${new Date(appointment.dateTime).toLocaleString('de-DE')}\nE-Mail: ${appointment.email}\nStatus: ${appointment.status}`;
    
    try {
      await navigator.clipboard.writeText(text);
      showToast('Termin in Zwischenablage kopiert!', 'success');
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
      showToast('Fehler beim Kopieren in die Zwischenablage', 'error');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `termine_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Termine erfolgreich exportiert!', 'success');
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'moved':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'moved':
        return 'Verschoben';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments
    .filter(apt => 
      apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#111827]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-[32px] font-[700]">Termin-Management</h1>
            </div>
            {appointments.length > 0 && (
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          {/* Left Column - Form */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6">Neuen Termin erstellen</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-[14px] uppercase tracking-wider text-gray-400 mb-2 font-medium">
                    Titel
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-500"
                    placeholder="z.B. Beratungsgespräch"
                  />
                </div>

                <div>
                  <label htmlFor="datetime" className="block text-[14px] uppercase tracking-wider text-gray-400 mb-2 font-medium">
                    Datum und Uhrzeit
                  </label>
                  <input
                    type="datetime-local"
                    id="datetime"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[14px] uppercase tracking-wider text-gray-400 mb-2 font-medium">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    required
                    disabled={isLoading}
                    className={`w-full px-4 py-4 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 ${
                      emailError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="kunde@beispiel.de"
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-[16px] transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Erstelle...</span>
                    </>
                  ) : (
                    <span>Termin erstellen</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Appointments List */}
          <div>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Termine durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleExport}
                className="sm:hidden flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700/50">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-300">
                  {searchQuery ? 'Keine Termine gefunden' : 'Noch keine Termine'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Versuchen Sie einen anderen Suchbegriff' 
                    : 'Erstellen Sie Ihren ersten Termin mit dem Formular'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 shadow-xl transition-all duration-200 border border-gray-700/50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-[20px] font-bold mb-2 text-gray-100">
                              {appointment.title}
                            </h3>
                            <p className="text-[18px] font-bold text-blue-400 mb-2">
                              📅 {new Date(appointment.dateTime).toLocaleString('de-DE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-[14px] text-blue-400 mb-4 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{appointment.email}</span>
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap lg:flex-col gap-2">
                        <button
                          onClick={() => handleMove(appointment.id)}
                          disabled={isLoading}
                          className="flex-1 lg:flex-none bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Verschieben
                        </button>
                        <button
                          onClick={() => handleCopy(appointment)}
                          disabled={isLoading}
                          className="flex-1 lg:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Kopieren
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={isLoading}
                          className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Stornieren
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Log Panel */}
        {emailLog.length > 0 && (
          <div className="mt-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email-Log</span>
                </h3>
                <button
                  onClick={() => setEmailLog([])}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Log löschen
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 bg-gray-900/50 rounded-lg p-4">
                {emailLog.map((log, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-300 font-mono py-1 border-b border-gray-700/50 last:border-b-0"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 animate-slide-in backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
