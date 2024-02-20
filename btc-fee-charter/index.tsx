import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App2';

const rootElement = document.getElementById('root');
createRoot(rootElement!).render(<App />);
