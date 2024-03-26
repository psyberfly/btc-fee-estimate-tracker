import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const NavMenu = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate  // Close nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !(navRef.current as any).contains(event.target) && !(hamburgerRef.current as any).contains(event.target)) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);

  // Drag to close functionality
  useEffect(() => {
    const handleTouchStart = (e) => {
      const startX = e.touches[0].pageX;
      const handleTouchMove = (moveEvent) => {
        const moveX = moveEvent.touches[0].pageX;
        if (startX - moveX > 50) {
          setIsNavOpen(false);
          document.removeEventListener('touchmove', handleTouchMove);
        }
      };
      document.addEventListener('touchmove', handleTouchMove);

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      document.addEventListener('touchend', handleTouchEnd);
    };

    if (isNavOpen && navRef.current) {
      (navRef.current as any).addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (navRef.current) {
        (navRef.current as any).removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [isNavOpen]);
  const navigateTo = (path) => {
    navigate(path);
    setIsNavOpen(false);
  };

  return (
    <div>
      <button ref={hamburgerRef} className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
        <div /><div /><div />
      </button>
      <div ref={navRef} className={`nav ${isNavOpen ? 'nav-open' : ''}`}>
        <h2>Charts</h2>
        <button onClick={() => navigateTo('/chart/index')}>Index</button>
        <button onClick={() => navigateTo('/chart/movingAverage')}>Moving Average</button>
        <button onClick={() => navigateTo('/chart/feeEstimate')}>Fee Estimate</button>
        <h2>API</h2>
        <button onClick={() => navigateTo('/api')}>Docs</button>
        <h2>About</h2>
        <button onClick={() => navigateTo('/faq')}>FAQ</button>
      </div>
    </div>
  );
};
export default NavMenu;
