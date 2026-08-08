import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ListOrdered, Target, PlayCircle, Radio, TrendingUp,
  Trophy, LogOut, Calendar,
} from 'lucide-react';

// IMPORTANDO A LOGO AQUI 👇
import logoAri from '../assets/logo-ari.jpeg';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/banco-questoes', label: 'Banco de Questões', icon: FileText },
  { to: '/assuntos-enem', label: 'Assuntos do ENEM', icon: ListOrdered },
  { to: '/simulados', label: 'Simulados', icon: Target },
  { to: '/player', label: 'Videoaulas', icon: PlayCircle },
  { to: '/lives', label: 'Lives', icon: Radio },
];

const NAV_ITEMS_SECONDARY = [
  { to: '/desempenho', label: 'Meu Desempenho', icon: TrendingUp },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/plano-estudos', label: 'Plano de Estudos', icon: Calendar },
];

const navLinkClass = ({ isActive }) =>
  `flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
    isActive
      ? 'bg-brand-orange/10 text-brand-orange'
      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
  }`;

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-slate-950 flex-col hidden lg:flex shrink-0">
      
      {/* LOGO E TEXTO ALINHADOS LADO A LADO 👇 */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/60 gap-3">
        <img 
          src={logoAri} 
          alt="Logo Arimatica Gabaritando" 
          className="h-10 w-10 object-cover rounded-xl border border-brand-orange/50 shadow-md" 
        />
        <div className="flex flex-col">
          <span className="text-sm font-black text-white tracking-wide leading-none mb-1">
            ARIMATICA
          </span>
          <span className="text-[11px] font-black text-brand-orange tracking-widest leading-none">
            GABARITANDO
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">
          Plataforma
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            {label}
          </NavLink>
        ))}

        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-6 mb-2">
          Acompanhamento
        </p>
        {NAV_ITEMS_SECONDARY.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-full py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold text-sm transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" /> Sair
        </button>
      </div>
    </aside>
  );
}