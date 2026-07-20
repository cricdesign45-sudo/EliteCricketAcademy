import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-cricket-green/20 mb-4">404</div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary px-6 py-3">Go Home</Link>
          <Link to="/contact" className="btn-outline px-6 py-3">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
