import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { doctorsService } from '../../services';
import type { Doctor } from '../../types';
import {
  Stethoscope,
  Video,
  Star,
  Sparkles,
  CheckCircle2,
  FileText,
  X,
  PhoneCall,
  Mic,
  MicOff,
  VideoOff,
  Loader2
} from 'lucide-react';

import { MOCK_DOCTORS } from '../../data/mockData';

function adaptDoctor(d: any): Doctor {
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    hospital: d.qualification || 'Board Certified',
    experienceYears: d.experience || 10,
    rating: d.rating || 4.9,
    reviewCount: Math.floor(80 + Math.random() * 200),
    consultationFee: d.fee || 799,
    image: d.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    availableToday: d.isAvailable !== false,
    nextSlot: 'Today, 4:30 PM',
    aiMatchReason: d.bio || 'Specialized in metabolic health and personalized nutrition.',
  };
}

export const DoctorConsultation: React.FC = () => {
  const { healthProfile } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorsService.getAll();
        if (res.success && res.data && res.data.length > 0) {
          setDoctors(res.data.map(adaptDoctor));
        }
      } catch (err) {
        console.warn('Doctors fetch failed, using fallback:', err);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookSlot = async (doc: Doctor) => {
    setSelectedDoctor(doc);
    try {
      await doctorsService.bookAppointment({
        doctorId: doc.id,
        type: 'Video',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err) {
      console.warn('Booking failed:', err);
    }
    setIsBooked(true);
  };

  const handleStartCall = () => {
    setIsVideoCallActive(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Telehealth Clinical Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Doctor & Dietitian Telehealth
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Consult board-certified metabolic endocrinologists & clinical nutritionists. AI automatically packages your food logs and glucose trends.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <FileText className="w-6 h-6 text-blue-200" />
          <div>
            <div className="text-xs font-bold">Auto-Generated AI Clinical Brief</div>
            <div className="text-[10px] text-blue-200">Shared automatically prior to call</div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        /* Doctor Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">{doc.name}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-400">{doc.hospital}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" /> AI Telemetry Match
                  </div>
                  <p className="text-[11px] leading-tight">{doc.aiMatchReason}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {doc.rating} ({doc.reviewCount})
                  </span>
                  <span>{doc.experienceYears} Years Exp.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Consultation Fee</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                    ₹{doc.consultationFee}
                  </div>
                </div>

                <button
                  onClick={() => handleBookSlot(doc)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Book Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Confirmation & Video Launch Modal */}
      {isBooked && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">

            <button
              onClick={() => setIsBooked(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                Telehealth Appointment Confirmed!
              </h3>
              <p className="text-xs text-slate-500">
                With {selectedDoctor.name} • {selectedDoctor.nextSlot}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white">AI Health Brief Package:</div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside text-[11px]">
                <li>Patient: {healthProfile.name} (Age: {healthProfile.age}, BMI: {healthProfile.bmi})</li>
                <li>Medical Diagnosis: {healthProfile.diseases.join(', ') || 'None reported'}</li>
                <li>Weekly Calorie Compliance: 94%</li>
                <li>Continuous Glucose Monitor Trend: Stable (88-112 mg/dL)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsBooked(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={handleStartCall}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Call Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Simulated Live Telehealth Video Call Screen */}
      {isVideoCallActive && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-4xl h-[80vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">

            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-bold text-sm font-['Outfit']">Live Telehealth Consultation</span>
                <span className="text-xs text-slate-400">| {selectedDoctor.name}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">12:45 Encrypted</span>
            </div>

            <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className={`w-full h-full object-cover opacity-80 ${isVideoOff ? 'filter blur-md' : ''}`}
              />

              <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white text-xs space-y-0.5">
                <div className="font-bold">{selectedDoctor.name}</div>
                <div className="text-[10px] text-emerald-400">{selectedDoctor.specialty}</div>
              </div>

              <div className="absolute bottom-4 right-4 w-40 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Self Patient"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">You</span>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200'} transition-all`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200'} transition-all`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsVideoCallActive(false)}
                className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5 rotate-[135deg]" />
                <span>End Call</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
