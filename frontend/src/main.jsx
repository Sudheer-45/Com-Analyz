import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css' // <-- DELETE OR COMMENT OUT THIS LINE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <AuthProvider>
       <App />
     </AuthProvider>
  </React.StrictMode>,
);