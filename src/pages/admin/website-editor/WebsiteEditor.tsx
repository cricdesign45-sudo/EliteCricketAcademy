import { Link } from 'react-router-dom';
import { Globe, Home, Info, BookOpen, Users, Phone, Image, ArrowRight } from 'lucide-react';

const editorPages = [
  { title: 'Home Page', desc: 'Edit hero section, stats, and featured content', icon: Home, link: '/admin/website-editor/home', color: 'bg-blue-500' },
  { title: 'About Page', desc: 'Edit vision, mission, values and founder info', icon: Info, link: '/admin/website-editor/about', color: 'bg-green-500' },
  { title: 'Contact Info', desc: 'Update address, phone, email, and social links', icon: Phone, link: '/admin/website-editor/contact', color: 'bg-amber-500' },
  { title: 'Banners & Sliders', desc: 'Manage hero banners and promotional sliders', icon: Image, link: '/admin/website-editor/banners', color: 'bg-purple-500' },
];

export default function WebsiteEditor() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Website Editor</h1>
        <p className="text-gray-500 text-sm">Edit public website content and pages</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Globe className="text-amber-600 flex-shrink-0" size={20} />
        <div>
          <p className="font-medium text-amber-900">Live Website Editor</p>
          <p className="text-amber-700 text-sm">Changes made here will reflect on the public website immediately.</p>
        </div>
        <Link to="/" target="_blank" className="ml-auto text-sm text-cricket-green hover:underline whitespace-nowrap">View Site →</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {editorPages.map(page => (
          <Link key={page.title} to={page.link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${page.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <page.icon className="text-white" size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-cricket-green transition-colors">{page.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{page.desc}</p>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-cricket-green group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
