import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PenTool, ChevronDown, X, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileWritingDropdownOpen, setMobileWritingDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Search state
  const searchParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Admin authentication state (hidden from visitors)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('santheri_admin_auth') === 'true';
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdminLoggedIn(localStorage.getItem('santheri_admin_auth') === 'true');
    };
    window.addEventListener('santheri-admin-auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('santheri-admin-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Synchronize search input with URL search param
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [location.search]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const cat = searchParams.get('category');
    const params = new URLSearchParams();
    if (cat) params.append('category', cat);
    if (val.trim()) params.append('search', val.trim());
    
    navigate(`/writing?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    const cat = searchParams.get('category');
    if (cat) {
      navigate(`/writing?category=${cat}`);
    } else {
      navigate('/writing');
    }
  };

  // Determine active states
  const currentCategory = searchParams.get('category');

  const isHomeActive = location.pathname === '/';
  const isWritingActive = location.pathname.startsWith('/writing');
  const isProjectsActive = location.pathname.startsWith('/projects');
  const isNotesActive = location.pathname.startsWith('/notes');
  const isAboutActive = location.pathname.startsWith('/about');
  const isAdminActive = location.pathname.startsWith('/admin');

  const isCategoryActive = (cat) => 
    location.pathname === '/writing' && 
    currentCategory && 
    currentCategory.toLowerCase() === cat.toLowerCase();

  return (
    <header className="site-header">
      <div className="nav-row">
        {/* Left Side: 3-lined mobile button & Brand Logo */}
        <div className="nav-left-group">
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle-btn"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <Link to="/" className="brand-logo" id="nav-brand-logo">
            SANTHERI
          </Link>
        </div>

        {/* Desktop Navigation (Hidden on mobile) */}
        <nav className="main-nav desktop-nav" id="main-navigation">
          {/* Writing with Dropdown containing 3 categories */}
          <div className="writing-dropdown-wrapper" id="writing-dropdown-wrapper">
            <Link 
              to="/writing" 
              className={`writing-trigger ${isWritingActive ? 'active' : ''}`}
              id="nav-writing-link"
            >
              Writing <ChevronDown size={14} className="dropdown-icon" />
            </Link>

            <div className="dropdown-menu" id="nav-categories-dropdown">
              <Link 
                to="/writing?category=Travel" 
                className={`dropdown-item ${isCategoryActive('Travel') ? 'active' : ''}`}
                id="nav-cat-travel"
              >
                <span>Travel</span>
                <span className="badge category-badge-travel">Stories</span>
              </Link>
              <Link 
                to="/writing?category=Technology" 
                className={`dropdown-item ${isCategoryActive('Technology') ? 'active' : ''}`}
                id="nav-cat-tech"
              >
                <span>Technology</span>
                <span className="badge category-badge-technology">Code & AI</span>
              </Link>
              <Link 
                to="/writing?category=Life" 
                className={`dropdown-item ${isCategoryActive('Life') ? 'active' : ''}`}
                id="nav-cat-life"
              >
                <span>Life</span>
                <span className="badge category-badge-life">Reflections</span>
              </Link>
            </div>
          </div>

          <Link 
            to="/projects" 
            className={`nav-link ${isProjectsActive ? 'active' : ''}`}
            id="nav-projects-link"
          >
            Projects
          </Link>

          <Link 
            to="/notes" 
            className={`nav-link ${isNotesActive ? 'active' : ''}`}
            id="nav-notes-link"
          >
            Notes
          </Link>

          <Link 
            to="/about" 
            className={`nav-link ${isAboutActive ? 'active' : ''}`}
            id="nav-about-link"
          >
            About
          </Link>

          {isAdminLoggedIn && (
            <Link 
              to="/admin" 
              className={`admin-nav-pill ${isAdminActive ? 'active' : ''}`}
              id="nav-admin-link"
              title="Admin Dashboard (Active)"
            >
              <PenTool size={13} />
              <span>Admin</span>
            </Link>
          )}

          {/* Right side search bar with search icon */}
          <div className="navbar-search-wrapper" id="navbar-search-wrapper">
            <Search size={14} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="navbar-search-input"
              id="navbar-search-input"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={clearSearch} 
                className="navbar-search-clear-btn"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Header Right: Search toggle icon */}
        <div className="mobile-header-right">
          <button
            type="button"
            className="mobile-search-toggle-btn"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search bar"
            id="btn-mobile-search-toggle"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar underneath Header */}
      {mobileSearchOpen && (
        <div className="mobile-search-expand-bar" id="mobile-search-expand-bar">
          <Search size={15} className="mobile-search-icon" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mobile-search-input"
            id="mobile-search-input"
            autoFocus
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={clearSearch} 
              className="navbar-search-clear-btn"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Mobile Drawer Navigation (Left-side slide in) */}
      {mobileOpen && (
        <>
          <div 
            className="mobile-drawer-backdrop" 
            onClick={() => setMobileOpen(false)}
            id="mobile-drawer-overlay"
          />
          <aside className="mobile-drawer" id="mobile-drawer-panel">
            <div className="mobile-drawer-header">
              <span className="brand-logo">SANTHERI</span>
              <button 
                className="mobile-drawer-close-btn" 
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                id="btn-close-mobile-menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Drawer Search Bar with Search Icon */}
            <div className="navbar-search-wrapper" style={{ marginBottom: '16px', width: '100%' }}>
              <Search size={15} className="navbar-search-icon" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="navbar-search-input"
                style={{ width: '100%' }}
                id="drawer-search-input"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={clearSearch} 
                  className="navbar-search-clear-btn"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <nav className="mobile-nav-menu">
              <Link 
                to="/" 
                className={`mobile-nav-link ${isHomeActive ? 'active' : ''}`}
                id="mobile-nav-home"
              >
                Home
              </Link>

              {/* Writing section with dropdown arrow */}
              <div className="mobile-nav-group">
                <div className="mobile-nav-header-row">
                  <Link 
                    to="/writing" 
                    className={`mobile-nav-link ${isWritingActive ? 'active' : ''}`}
                    id="mobile-nav-writing"
                  >
                    Writing
                  </Link>

                  {/* Dropdown toggle button for subsections (just an arrow) */}
                  <button
                    type="button"
                    className="mobile-dropdown-toggle-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMobileWritingDropdownOpen(!mobileWritingDropdownOpen);
                    }}
                    aria-label="Toggle writing categories dropdown"
                    id="btn-toggle-writing-subsections"
                  >
                    <ChevronDown 
                      size={18} 
                      className={`dropdown-chevron ${mobileWritingDropdownOpen ? 'rotated' : ''}`}
                    />
                  </button>
                </div>

                {/* Sub sections visible only when dropdown arrow is clicked */}
                {mobileWritingDropdownOpen && (
                  <div className="mobile-sub-menu" id="mobile-writing-subsections">
                    <Link 
                      to="/writing?category=Travel" 
                      className={`mobile-sub-link ${isCategoryActive('Travel') ? 'active' : ''}`}
                      id="mobile-nav-travel"
                    >
                      Travel
                    </Link>
                    <Link 
                      to="/writing?category=Technology" 
                      className={`mobile-sub-link ${isCategoryActive('Technology') ? 'active' : ''}`}
                      id="mobile-nav-technology"
                    >
                      Technology
                    </Link>
                    <Link 
                      to="/writing?category=Life" 
                      className={`mobile-sub-link ${isCategoryActive('Life') ? 'active' : ''}`}
                      id="mobile-nav-life"
                    >
                      Life
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                to="/projects" 
                className={`mobile-nav-link ${isProjectsActive ? 'active' : ''}`}
                id="mobile-nav-projects"
              >
                Projects
              </Link>

              <Link 
                to="/notes" 
                className={`mobile-nav-link ${isNotesActive ? 'active' : ''}`}
                id="mobile-nav-notes"
              >
                Notes
              </Link>

              <Link 
                to="/about" 
                className={`mobile-nav-link ${isAboutActive ? 'active' : ''}`}
                id="mobile-nav-about"
              >
                About
              </Link>

              {isAdminLoggedIn && (
                <div className="mobile-nav-footer">
                  <Link 
                    to="/admin" 
                    className={`admin-nav-pill ${isAdminActive ? 'active' : ''}`}
                    id="mobile-nav-admin"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                  >
                    <PenTool size={14} />
                    <span>Admin Portal</span>
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}
