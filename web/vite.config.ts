import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Define types for our data
export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'approved' | 'pending' | 'completed';
}

export interface Child {
  id: string;
  jarId: string;
  name: string;
  balance: number;
  imageUrl: string;
  goals: Goal[];
}

export interface Transaction {
  id: string;
  childName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8081,
    proxy: {
      // Proxy API requests to your backend server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // handle the case where the backend is not available
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
            if (res.headersSent) {
              return;
            }
            res.writeHead(404, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ error: 'Backend server not available' }));
          });
        },
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
