import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.SERVER_PORT; 
export default defineConfig({
  
  server: {
    host:"0.0.0.0",
    port: port,
  },
  plugins: [react()],
});
