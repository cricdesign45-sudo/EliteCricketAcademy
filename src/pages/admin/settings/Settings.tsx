import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, User, Lock, Bell, Shield, Building2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SETTINGS_KEY = 'ywcc_settings';
const CREDENTIALS_KEY = 'ywcc_credentials';

interface AdminSettings {
  academyName: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  website: string;
}

interface NotifSettings {
  feeOverdue: boolean;
  attendanceReminder: boolean;
  newRegistration: boolean;
  newMessage: boolean;
  playerBirthday: boolean;
}

const defaultSettings: AdminSettings = {
  academyName: 'Young Warriors Cricket Club',
  email: 'admin@youngwarriors.com',
  phone: '+91 98765 43210',
  address: 'Sports Complex, Cricket Ground Road, Mumbai - 400001',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  website: 'https://youngwarriors.com',
};

const defaultNotif: NotifSettings = {
  feeOverdue: true,
  attendanceReminder: true,
  newRegistration: true,
  newMessage: true,
  playerBirthday: false,
};

function loadSettings(): AdminSettings {
  try {
    const v = localStorage.getItem(SETTINGS_KEY);
    return v ? { ...defaultSettings, ...JSON.parse(v) } : defaultSettings;
  } catch { return defaultSettings; }
}

function loadNotif(): NotifSettings {
  try {
    const v = localStorage.getItem(SETTINGS_KEY + '_notif');
    return v ? { ...defaultNotif, ...JSON.parse(v) } : defaultNotif;
  } catch { return defaultNotif; }
}

function getStoredPassword(): string {
  try {
    const v = localStorage.getItem(CREDENTIALS_KEY);
    return v ? JSON.parse(v).password : 'admin123';
  } catch { return 'admin123'; }
}

function setStoredPassword(pw: string) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ password: pw }));
}

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [generalForm, setGeneralForm] = useState<AdminSettings>(loadSettings);
  const [notifForm, setNotifForm] = useState<NotifSettings>(loadNotif);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const strength = calcStrength(passwordForm.newPass);
    setPasswordStrength(strength);
  }, [passwordForm.newPass]);

  function calcStrength(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(generalForm));
    setSaved(true);
    toast.success('General settings saved!');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveNotif = () => {
    localStorage.setItem(SETTINGS_KEY + '_notif', JSON.stringify(notifForm));
    toast.success('Notification preferences saved!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredPassword();
    if (passwordForm.current !== current) {
      toast.error('Current password is incorrect');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setStoredPassword(passwordForm.newPass);
    // Also update the auth check in storage
    localStorage.setItem('ywcc_admin_pw', passwordForm.newPass);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    toast.success('Password changed successfully!');
  };

  const notifItems = [
    { key: 'feeOverdue' as const, label: 'Fee overdue alerts', desc: 'Get notified when player fees are overdue' },
    { key: 'attendanceReminder' as const, label: 'Attendance reminder', desc: 'Remind if attendance not marked by 9 AM' },
    { key: 'newRegistration' as const, label: 'New registration alerts', desc: 'Alert on new player registrations' },
    { key: 'newMessage' as const, label: 'New contact messages', desc: 'Alert when a new contact form is submitted' },
    { key: 'playerBirthday' as const, label: 'Player birthday alerts', desc: 'Get notified on player birthdays' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 text-sm">Manage academy settings and configurations</p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Academy Information</h3>
                <p className="text-gray-500 text-xs">Update your academy's basic details</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Academy Name</label>
                <input
                  value={generalForm.academyName}
                  onChange={e => setGeneralForm({ ...generalForm, academyName: e.target.value })}
                  className="form-input"
                  placeholder="Academy name"
                />
              </div>
              <div>
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  value={generalForm.email}
                  onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  value={generalForm.phone}
                  onChange={e => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Academy Address</label>
                <textarea
                  rows={2}
                  value={generalForm.address}
                  onChange={e => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className="form-input resize-none"
                />
              </div>
              <div>
                <label className="form-label">Website URL</label>
                <input
                  value={generalForm.website}
                  onChange={e => setGeneralForm({ ...generalForm, website: e.target.value })}
                  className="form-input"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="form-label">Timezone</label>
                <select
                  value={generalForm.timezone}
                  onChange={e => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                  className="form-input"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select
                  value={generalForm.currency}
                  onChange={e => setGeneralForm({ ...generalForm, currency: e.target.value })}
                  className="form-input"
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (د.إ) — UAE Dirham</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary mt-4 flex items-center gap-2 px-6 py-2.5"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </form>
      )}

      {/* Change Password */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Change Password</h3>
                <p className="text-gray-500 text-xs">Update your admin login password</p>
              </div>
            </div>

            <div>
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="form-input pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.newPass}
                  onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="form-input pr-10"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordForm.newPass && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor[passwordStrength] : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className="font-medium">{strengthLabel[passwordStrength]}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className={`form-input pr-10 ${passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary mt-4 flex items-center gap-2 px-6 py-2.5">
            <Lock size={16} /> Change Password
          </button>
        </form>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Notification Preferences</h3>
                <p className="text-gray-500 text-xs">Choose which alerts to receive</p>
              </div>
            </div>

            {notifItems.map(item => (
              <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                <div className="pr-4">
                  <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifForm({ ...notifForm, [item.key]: !notifForm[item.key] })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    notifForm[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifForm[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveNotif}
            className="btn-primary mt-4 flex items-center gap-2 px-6 py-2.5"
          >
            <Save size={16} /> Save Preferences
          </button>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="max-w-md space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Security Overview</h3>
                <p className="text-gray-500 text-xs">Your account security status</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Admin Username</p>
                    <p className="text-xs text-gray-500">Login credential</p>
                  </div>
                </div>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">admin</span>
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Password</p>
                    <p className="text-xs text-gray-500">Last changed on sign-in</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Protected</span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Session</p>
                    <p className="text-xs text-gray-500">Local browser session</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Security Tips</p>
                <ul className="mt-2 space-y-1">
                  {[
                    'Use a strong password with letters, numbers & symbols',
                    'Change your password regularly (every 60–90 days)',
                    'Always logout from shared devices',
                    'Keep your login credentials private',
                  ].map(tip => (
                    <li key={tip} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
