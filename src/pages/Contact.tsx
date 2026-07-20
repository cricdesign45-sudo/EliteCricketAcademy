import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import type { WebsiteContent } from '@/types';

type ContactContent = WebsiteContent['contact'];

const defaultContact: ContactContent = {
  address: '123 Sports Complex, Cricket Ground Road, Mumbai - 400001',
  phone: '+91 98765 43210',
  email: 'info@elitecricketacademy.com',
  mapEmbedUrl: '',
  workingHours: 'Monday - Saturday: 5:00 AM to 9:00 PM',
  socialLinks: {},
};

export default function Contact() {
  const [contact, setContact] = useState<ContactContent>(defaultContact);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  useEffect(() => {
    db.websiteContent.get().then(content => {
      if (content.contact) setContact(content.contact);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await db.messages.add({ ...form, date: getTodayString(), status: 'unread' });
    setSending(false);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Get In Touch</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg">We'd love to hear from you. Reach out for admissions, queries, or any information.</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Address', content: contact.address },
                { icon: Phone, title: 'Phone', content: contact.phone },
                { icon: Mail, title: 'Email', content: contact.email },
                { icon: Clock, title: 'Working Hours', content: contact.workingHours },
              ].map(item => (
                <div key={item.title} className="bg-white rounded-xl p-6 shadow-md flex gap-4">
                  <div className="w-12 h-12 bg-cricket-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-cricket-green" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle size={64} className="text-cricket-green mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-primary px-6 py-2.5">Send Another</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label">Full Name *</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" placeholder="Your name" />
                      </div>
                      <div>
                        <label className="form-label">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label">Phone</label>
                        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" placeholder="+91 98765 43210" />
                      </div>
                      <div>
                        <label className="form-label">Subject *</label>
                        <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="form-input">
                          <option value="">Select subject</option>
                          <option>Admission Inquiry</option>
                          <option>Fee Information</option>
                          <option>Scholarship Query</option>
                          <option>General Information</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Message *</label>
                      <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="form-input resize-none" placeholder="Write your message here..." />
                    </div>
                    <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                      <Send size={18} /> {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
