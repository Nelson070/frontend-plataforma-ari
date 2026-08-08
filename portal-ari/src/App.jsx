import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Pagamento from './pages/Pagamento';
import Dashboard from './pages/Dashboard';
import Simulados from './pages/Simulados';
import Lives from './pages/Lives';
import PlayerAulas from './pages/PlayerAulas';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminNovaQuestao from './pages/AdminNovaQuestao';
import BancoQuestoes from './pages/BancoQuestoes';
import Desempenho from './pages/Desempenho';
import PlanoEstudos from './pages/PlanoEstudos';
import AssuntosEnem from './pages/AssuntosEnem';
import Ranking from './pages/Ranking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simulados" element={<Simulados />} />
        <Route path="/lives" element={<Lives />} />
        <Route path="/player" element={<PlayerAulas />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/questao" element={<AdminNovaQuestao />} />
        <Route path="/admin/nova-questao" element={<AdminNovaQuestao />} />
        <Route path="/banco-questoes" element={<BancoQuestoes />} />
        <Route path="/desempenho" element={<Desempenho />} />
        <Route path="/plano-estudos" element={<PlanoEstudos />} />
        <Route path="/assuntos-enem" element={<AssuntosEnem />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;