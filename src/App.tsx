import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Programs from '@/pages/Programs';
import CoachesPage from '@/pages/Coaches';
import Gallery from '@/pages/Gallery';
import Achievements from '@/pages/Achievements';
import News from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import Schedule from '@/pages/Schedule';
import Contact from '@/pages/Contact';
import Register from '@/pages/Register';
import Store from '@/pages/Store';
import Login from '@/pages/Login';
import PlayerLogin from '@/pages/PlayerLogin';
import PlayerDashboard from '@/pages/PlayerDashboard';
import NotFound from '@/pages/NotFound';
import StoreProductDetail from '@/pages/StoreProductDetail';
import PlayerChat from '@/pages/PlayerChat';
import PlayerOfMonthAdmin from '@/pages/admin/players/PlayerOfMonth';
import Analytics from '@/pages/admin/analytics/Analytics';
import ChatManagement from '@/pages/admin/chat/ChatManagement';
import VerificationManagement from '@/pages/admin/players/VerificationManagement';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import PlayerList from '@/pages/admin/players/PlayerList';
import AddPlayer from '@/pages/admin/players/AddPlayer';
import EditPlayer from '@/pages/admin/players/EditPlayer';
import PlayerDetail from '@/pages/admin/players/PlayerDetail';
import FeeManagement from '@/pages/admin/fees/FeeManagement';
import AddFee from '@/pages/admin/fees/AddFee';
import FeeReports from '@/pages/admin/fees/FeeReports';
import Attendance from '@/pages/admin/attendance/Attendance';
import AttendanceHistory from '@/pages/admin/attendance/AttendanceHistory';
import AttendanceCalendar from '@/pages/admin/attendance/AttendanceCalendar';
import AttendanceReports from '@/pages/admin/attendance/AttendanceReports';
import HolidayManagement from '@/pages/admin/holidays/HolidayManagement';
import CoachManagement from '@/pages/admin/coaches/CoachManagement';
import AddCoach from '@/pages/admin/coaches/AddCoach';
import ProgramManagement from '@/pages/admin/programs/ProgramManagement';
import AddProgram from '@/pages/admin/programs/AddProgram';
import GalleryManagement from '@/pages/admin/gallery/GalleryManagement';
import NewsManagement from '@/pages/admin/news/NewsManagement';
import AddNews from '@/pages/admin/news/AddNews';
import AchievementsAdmin from '@/pages/admin/achievements/AchievementsAdmin';
import Testimonials from '@/pages/admin/testimonials/Testimonials';
import Messages from '@/pages/admin/messages/Messages';
import Notifications from '@/pages/admin/notifications/Notifications';
import StoreManagement from '@/pages/admin/store/StoreManagement';
import OrderManagement from '@/pages/admin/store/OrderManagement';
import Reports from '@/pages/admin/reports/Reports';
import PlayerStats from '@/pages/admin/stats/PlayerStats';
import Settings from '@/pages/admin/settings/Settings';
import WebsiteEditor from '@/pages/admin/website-editor/WebsiteEditor';
import EditHome from '@/pages/admin/website-editor/EditHome';
import EditAbout from '@/pages/admin/website-editor/EditAbout';
import EditContact from '@/pages/admin/website-editor/EditContact';
import EditBanners from '@/pages/admin/website-editor/EditBanners';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/coaches" element={<CoachesPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/:id" element={<StoreProductDetail />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/player-login" element={<PlayerLogin />} />
        <Route path="/player" element={<PlayerDashboard />} />
        <Route path="/player/chat" element={<PlayerChat />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          {/* Players */}
          <Route path="players" element={<PlayerList />} />
          <Route path="players/add" element={<AddPlayer />} />
          <Route path="players/:id" element={<PlayerDetail />} />
          <Route path="players/:id/edit" element={<EditPlayer />} />

          {/* Fees */}
          <Route path="fees" element={<FeeManagement />} />
          <Route path="fees/add" element={<AddFee />} />
          <Route path="fees/reports" element={<FeeReports />} />

          {/* Attendance */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance/history" element={<AttendanceHistory />} />
          <Route path="attendance/reports" element={<AttendanceReports />} />
          <Route path="attendance/calendar" element={<AttendanceCalendar />} />

          {/* Holidays */}
          <Route path="holidays" element={<HolidayManagement />} />

          {/* Coaches */}
          <Route path="coaches" element={<CoachManagement />} />
          <Route path="coaches/add" element={<AddCoach />} />
          <Route path="coaches/:id/edit" element={<AddCoach />} />

          {/* Programs */}
          <Route path="programs" element={<ProgramManagement />} />
          <Route path="programs/add" element={<AddProgram />} />
          <Route path="programs/:id/edit" element={<AddProgram />} />

          {/* Content */}
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="news/add" element={<AddNews />} />
          <Route path="news/:id/edit" element={<AddNews />} />
          <Route path="achievements" element={<AchievementsAdmin />} />
          <Route path="testimonials" element={<Testimonials />} />

          {/* Communication */}
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Store */}
          <Route path="store" element={<StoreManagement />} />
          <Route path="store/orders" element={<OrderManagement />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
          <Route path="player-stats" element={<PlayerStats />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />

          {/* Website Editor */}
          <Route path="website-editor" element={<WebsiteEditor />} />
          <Route path="website-editor/home" element={<EditHome />} />
          <Route path="website-editor/about" element={<EditAbout />} />
          <Route path="website-editor/contact" element={<EditContact />} />
          <Route path="website-editor/banners" element={<EditBanners />} />

          {/* New Features */}
          <Route path="player-of-month" element={<PlayerOfMonthAdmin />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="chat-management" element={<ChatManagement />} />
          <Route path="verification" element={<VerificationManagement />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
