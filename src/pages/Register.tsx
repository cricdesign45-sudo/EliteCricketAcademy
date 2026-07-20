import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import type { Program } from '@/types';

export default function Register() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    playerName: '', dateOfBirth: '', phone: '', email: '', address: '',
    guardianName: '', guardianPhone: '', program: '', battingStyle: '', bowlingStyle: '', position: ''
  });

  useEffect(() => {
    db.programs.getAll().then(data => setPrograms(data.filter(p => p.status === 'active')));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <CheckCircle size={72} className="text-cricket-green mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Registration Submitted!</h2>
          <p className="text-gray-600 mb-2">Thank you for registering with Elite Cricket Academy.</p>
          <p className="text-gray-500 text-sm mb-8">Our team will review your application and contact you within 48 hours.</p>
          <Link to="/" className="btn-primary px-8 py-3 inline-block text-base">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">Join The Academy</div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">Player Registration</h1>
          <p className="text-gray-600">Fill out the form below to begin your cricket journey with Elite Cricket Academy.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Player Information</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input required value={form.playerName} onChange={e => setForm({...form, playerName: e.target.value})} className="form-input" placeholder="Player's full name" />
                </div>
                <div><label className="form-label">Date of Birth *</label><input required type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="form-input" /></div>
                <div><label className="form-label">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" placeholder="+91 98765 43210" /></div>
                <div><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" placeholder="player@email.com" /></div>
                <div><label className="form-label">Position</label>
                  <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="form-input">
                    <option value="">Select position</option>
                    <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Wicket-keeper</option>
                  </select>
                </div>
                <div className="sm:col-span-2"><label className="form-label">Address *</label><textarea required rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="form-input resize-none" placeholder="Full address" /></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Cricket Skills</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="form-label">Batting Style</label>
                  <select value={form.battingStyle} onChange={e => setForm({...form, battingStyle: e.target.value})} className="form-input">
                    <option value="">Select style</option><option>Right-hand</option><option>Left-hand</option>
                  </select>
                </div>
                <div><label className="form-label">Bowling Style</label>
                  <select value={form.bowlingStyle} onChange={e => setForm({...form, bowlingStyle: e.target.value})} className="form-input">
                    <option value="">Select style</option>
                    <option>Right-arm fast</option><option>Right-arm medium</option><option>Right-arm off-spin</option>
                    <option>Left-arm fast</option><option>Left-arm medium</option><option>Left-arm spin</option><option>None</option>
                  </select>
                </div>
                <div><label className="form-label">Program *</label>
                  <select required value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="form-input">
                    <option value="">Select program</option>
                    {programs.map(p => <option key={p.id}>{p.name} — ₹{p.fee.toLocaleString()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Guardian Information</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="form-label">Guardian Name *</label><input required value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} className="form-input" /></div>
                <div><label className="form-label">Guardian Phone *</label><input required value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} className="form-input" /></div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg font-bold">Submit Registration</button>
          </form>
        </div>
      </div>
    </div>
  );
}
