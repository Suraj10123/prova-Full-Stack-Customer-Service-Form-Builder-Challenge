// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import './index.css';               // make sure you have the styles we added
import FormList    from './pages/FormList';
import FormBuilder from './pages/FormBuilder';
import FormFill    from './pages/FormFill';
import Submissions from './pages/Submissions';

export default function App() {
  // load initial theme from localStorage (default to light)
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true');

  // whenever `dark` changes, toggle the .dark class on <html> & persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark', dark);
  }, [dark]);

  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: 'var(--nav-bg)' }}>
        <Link to="/">Forms</Link> |{' '}
        <Link to="/builder">Builder</Link>
        <button
          onClick={() => setDark(d => !d)}
          style={{
            float: 'right',
            padding: '0.5rem',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {dark ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </nav>

      <main style={{ padding: '1rem', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <Routes>
          <Route path="/" element={<FormList />} />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/forms/:id" element={<FormFill />} />
          <Route path="/forms/:id/submissions" element={<Submissions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
