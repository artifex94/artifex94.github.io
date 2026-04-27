import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="w-full border-b border-dashed border-line bg-base/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-xl">&gt; Artifex</span>
          <span className="text-secondary text-sm hidden sm:inline-block">// System_Core</span>
        </div>
        <div className="flex gap-6">
          <Link 
            to="/" 
            className={`text-sm font-mono transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-secondary hover:text-primary'}`}
          >
            ./Portfolio
          </Link>
          <Link
            to="/business"
            className={`text-sm font-mono transition-colors ${location.pathname.startsWith('/business') ? 'text-accent' : 'text-secondary hover:text-primary'}`}
          >
            ./Business
          </Link>
        </div>
      </div>
    </nav>
  );
};