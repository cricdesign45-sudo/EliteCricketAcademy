import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [generalForm, setGeneralForm] = useState({ academyName: 'Elite Cricket Academy', email: 'admin@eca.com', phone: '+91 98765 43210', timezone: 'Asia/Kolkata', currency: 'INR' });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.current !== 'admin123') {
      toast.error('Current password is incorrect');
      return;
    }
    toast.success('Password changed successfully!');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'password', label: 'Change Password' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 text-sm">Manage academy settings and configurations</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id ? 'text-cricket-green border-b-2 border-cricket-green' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div><label className="form-label">Academy Name</label><input value={generalForm.academyName} onChange={e => setGeneralForm({...generalForm, academyName: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Admin Email</label><input type="email" value={generalForm.email} onChange={e => setGeneralForm({...generalForm, email: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Contact Phone</label><input value={generalForm.phone} onChange={e => setGeneralForm({...generalForm, phone: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Timezone</label>
              <select value={generalForm.timezone} onChange={e => setGeneralForm({...generalForm, timezone: e.target.value})} className="form-input">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div><label className="form-label">Currency</label>
              <select value={generalForm.currency} onChange={e => setGeneralForm({...generalForm, currency: e.target.value})} className="form-input">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 flex items-center gap-2 px-6 py-2.5">
            <Save size={16} /> Save Settings
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="form-input pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div><label className="form-label">New Password</label><input type="password" required minLength={6} value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Confirm New Password</label><input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="form-input" /></div>
          </div>
          <button type="submit" className="btn-primary mt-4 px-6 py-2.5">Change Password</button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-sm mb-4">Configure notification preferences</p>
          {[
            { label: 'Fee overdue alerts', desc: 'Get notified when fees are overdue' },
            { label: 'Attendance reminders', desc: 'Remind if attendance not marked by 9 AM' },
            { label: 'New registration alerts', desc: 'Alert on new contact form submissions' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-cricket-green" />
            </div>
          ))}
          <button className="btn-primary mt-4 flex items-center gap-2 px-6 py-2.5" onClick={() => toast.success('Notification settings saved!')}>
            <Save size={16} /> Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}
