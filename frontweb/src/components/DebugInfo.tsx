import React, { useEffect, useState } from 'react';
import axios from '../api/apiConfig';

const DebugInfo: React.FC = () => {
  const [info, setInfo] = useState({
    apiUrl: '',
    baseUrl: '',
    envVar: '',
  });

  /*
  Importado no App.tsx:
  somente para debug de quais as vars do env de produção
  
  useEffect(() => {
    setInfo({
      apiUrl: axios.defaults.baseURL || 'Not set',
      baseUrl: window.location.origin,
      envVar: process.env.REACT_APP_API_URL || 'Not set',
    });
  }, []);*/
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: '#eee',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      <div>API URL: {info.apiUrl}</div>
      <div>Base URL: {info.baseUrl}</div>
      <div>Env Var: {info.envVar}</div>
    </div>
  );
};

export default DebugInfo;
