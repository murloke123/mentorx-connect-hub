import Card, { resetCountdown, setCountdownStartDate, getCurrentStartDate } from '@/components/magicui/contador';
import React, { useState, useEffect } from 'react';

const ContadorTestPage: React.FC = () => {
  const [currentStartDate, setCurrentStartDate] = useState<Date>(new Date());
  const [newStartDate, setNewStartDate] = useState<string>('');

  useEffect(() => {
    // Carregar a data atual do contador
    const current = getCurrentStartDate();
    setCurrentStartDate(current);
    
    // Formato para datetime-local input (YYYY-MM-DDTHH:mm)
    const formatForInput = current.toISOString().slice(0, 16);
    setNewStartDate(formatForInput);
  }, []);

  const handleResetCountdown = () => {
    if (confirm('Tem certeza que deseja resetar o contador para AGORA (15 dias)?')) {
      resetCountdown();
    }
  };

  const handleSetCustomDate = () => {
    if (!newStartDate) {
      alert('Por favor, selecione uma data e hora');
      return;
    }
    
    const customDate = new Date(newStartDate);
    if (isNaN(customDate.getTime())) {
      alert('Data inválida');
      return;
    }

    if (confirm(`Tem certeza que deseja definir o início do contador para: ${customDate.toLocaleString()}?`)) {
      setCountdownStartDate(customDate);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#000000',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ 
          color: '#ffffff', 
          textAlign: 'center', 
          marginBottom: '40px',
          fontSize: '2rem',
          fontFamily: 'Arial, sans-serif'
        }}>
          Teste do Contador.tsx
        </h1>

        {/* Informações da data atual */}
        <div style={{ 
          backgroundColor: '#333', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px' }}>
            <strong>Data de início atual:</strong>
          </p>
          <p style={{ color: '#00ff00', margin: '0', fontSize: '16px', fontFamily: 'monospace' }}>
            {currentStartDate.toLocaleString()}
          </p>
        </div>

        {/* Contador */}
        <div style={{ marginBottom: '40px' }}>
          <Card />
        </div>
        
        {/* Controles */}
        <div style={{ 
          backgroundColor: '#222', 
          padding: '30px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>
            Controles do Contador
          </h3>

          {/* Definir data customizada */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#fff', 
              display: 'block', 
              marginBottom: '10px',
              fontSize: '14px'
            }}>
              Definir nova data de início:
            </label>
            <input
              type="datetime-local"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              style={{
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #555',
                backgroundColor: '#444',
                color: '#fff',
                marginRight: '10px',
                width: '200px'
              }}
            />
            <button 
              onClick={handleSetCustomDate}
              style={{
                backgroundColor: '#0066ff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                fontSize: '14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}
            >
              📅 Definir Data
            </button>
          </div>

          {/* Reset para agora */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid #444' }}>
            <button 
              onClick={handleResetCountdown}
              style={{
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff6666'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
            >
              🔄 Reset para AGORA
            </button>
          </div>

          <p style={{ 
            color: '#888', 
            fontSize: '12px', 
            marginTop: '15px',
            fontStyle: 'italic'
          }}>
            * F5 não reinicia o contador - apenas os botões acima
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContadorTestPage;