import { Clock, Calendar, MapPin } from 'lucide-react';
import { programsStore } from '@/lib/storage';

const timeSlots = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '4:00 PM', '5:00 PM', '6:00 PM'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const schedule = [
  { program: 'Senior Academy', day: 'Monday-Saturday', time: '5:00 AM - 9:00 AM', coach: 'Suresh Yadav', venue: 'Main Ground', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { program: 'Junior Elite', day: 'Monday-Saturday', time: '5:30 AM - 9:00 AM', coach: 'Mahendra Singh', venue: 'Ground B', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { program: 'Youth Development', day: 'Tue, Thu, Sat', time: '6:00 AM - 9:00 AM', coach: 'Suresh Yadav', venue: 'Indoor Nets', color: 'bg-green-100 border-green-300 text-green-800' },
  { program: 'Foundation Course', day: 'Mon, Wed, Fri', time: '6:00 AM - 8:00 AM', coach: 'Mahendra Singh', venue: 'Practice Ground', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { program: 'Fitness & Fielding', day: 'Monday-Friday', time: '4:00 PM - 6:00 PM', coach: 'Rekha Patel', venue: 'Gymnasium', color: 'bg-rose-100 border-rose-300 text-rose-800' },
  { program: 'Batting Workshop', day: 'Saturday', time: '4:00 PM - 7:00 PM', coach: 'Mahendra Singh', venue: 'Indoor Nets', color: 'bg-teal-100 border-teal-300 text-teal-800' },
];

export default function Schedule() {
  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Plan Your Training</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Training Schedule</h1>
          <p className="text-gray-300 text-lg">All training sessions and their timings at a glance.</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {schedule.map(item => (
              <div key={item.program} className={`rounded-xl border-l-4 p-6 ${item.color}`}>
                <h3 className="text-lg font-bold mb-3">{item.program}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{item.day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{item.venue}</span>
                  </div>
                  <div className="font-medium mt-2">Coach: {item.coach}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Important Notes</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-cricket-green rounded-full mt-2 flex-shrink-0"></span>
                Players should arrive 15 minutes before scheduled time for warm-up.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-cricket-green rounded-full mt-2 flex-shrink-0"></span>
                Academy will be closed on national holidays and declared holidays.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-cricket-green rounded-full mt-2 flex-shrink-0"></span>
                In case of rain, indoor training will be conducted at the designated nets.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-cricket-green rounded-full mt-2 flex-shrink-0"></span>
                Players must carry their own kit including bat, pads, gloves, and helmet.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
