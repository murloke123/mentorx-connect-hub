import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';

// 🧪 Importar funções de teste para disponibilizar no console
import './utils/testEmailService';

createRoot(document.getElementById("root")!).render(<App />);
