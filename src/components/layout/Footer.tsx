import { useState, useEffect } from 'react';
import logoImg from '@/assets/academy-logo.jpg';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { db } from '@/lib/db';
import type { WebsiteContent } from '@/types';

type ContactContent = WebsiteContent['contact'];

const defaultContact: ContactContent = {
  address: '123 Sports Complex, Cricket Ground Road, Mumbai - 400001',
  phone: '+91 98765 43210',
  email: 'info@elitecricketacademy.com',
  mapEmbedUrl: '',
  workingHours: 'Mon-Sat: 5:00 AM to 9:00 PM',
  socialLinks: {
    facebook: 'https://facebook.com/elitecricketacademy',
    instagram: 'https://instagram.com/elitecricketacademy',
    twitter: 'https://twitter.com/elitecricket',
    youtube: 'https://youtube.com/elitecricketacademy',
  },
};

export default function Footer() {
  const [contact, setContact] = useState<ContactContent>(defaultContact);

  useEffect(() => {
    db.websiteContent.get().then(content => {
      if (content.contact) setContact(content.contact);
    });
  }, []);

  return (
    <footer className="bg-cricket-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Young Warriors Cricket Club" className="w-11 h-11 rounded-full object-cover border-2 border-amber-400" />
              <div>
                <div className="text-white font-display font-bold text-base leading-tight">Young Warriors</div>
                <div className="text-amber-400 text-xs tracking-widest uppercase">Cricket Club</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">Building cricket champions since 2010. World-class coaching, professional facilities, and a passion for the game.</p>
            <div className="flex gap-3">
              {contact.socialLinks.facebook && (
                <a href={contact.socialLinks.facebook} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-cricket-dark transition-colors" target="_blank" rel="noopener noreferrer"><Facebook size={16} /></a>
              )}
              {contact.socialLinks.instagram && (
                <a href={contact.socialLinks.instagram} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-cricket-dark transition-colors" target="_blank" rel="noopener noreferrer"><Instagram size={16} /></a>
              )}
              {contact.socialLinks.twitter && (
                <a href={contact.socialLinks.twitter} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-cricket-dark transition-colors" target="_blank" rel="noopener noreferrer"><Twitter size={16} /></a>
              )}
              {contact.socialLinks.youtube && (
                <a href={contact.socialLinks.youtube} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-cricket-dark transition-colors" target="_blank" rel="noopener noreferrer"><Youtube size={16} /></a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[['About Us', '/about'], ['Programs', '/programs'], ['Coaches', '/coaches'], ['Achievements', '/achievements'], ['Gallery', '/gallery'], ['News', '/news'], ['Contact', '/contact']].map(([label, path]) => (
                <li key={path}><Link to={path} className="text-sm hover:text-amber-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4">Our Programs</h3>
            <ul className="space-y-2">
              {['Foundation Course', 'Youth Development', 'Junior Elite', 'Senior Academy', 'Weekend Coaching', 'Summer Camp'].map(p => (
                <li key={p}><Link to="/programs" className="text-sm hover:text-amber-400 transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4">Legal & Policies</h3>
            <ul className="space-y-2">
              {[
                ['Terms & Conditions', '/policies'],
                ['Privacy Policy', '/policies'],
                ['Refund Policy', '/policies'],
                ['Academy Rules', '/policies'],
                ['Player Code of Conduct', '/policies'],
                ['Child Safety Policy', '/policies'],
                ['FAQ', '/policies'],
              ].map(([label, path]) => (
                <li key={label}><Link to={path} className="text-sm hover:text-amber-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 text-amber-400 flex-shrink-0" /><span className="text-sm">{contact.address}</span></li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 text-amber-400 flex-shrink-0" /><span className="text-sm">{contact.phone}</span></li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 text-amber-400 flex-shrink-0" /><span className="text-sm">{contact.email}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Young Warriors Cricket Club. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/policies" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link to="/policies" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link to="/policies" className="hover:text-amber-400 transition-colors">Policies</Link>
            <Link to="/store" className="hover:text-amber-400 transition-colors">Store</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
