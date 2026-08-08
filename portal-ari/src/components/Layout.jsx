import React from 'react';
import { BookOpen, Video, Target, User, LogOut, Menu } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-brand-grayLight flex">
      
      <aside className="w-64 bg-white border-r border-brand-grayBorder hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-brand-grayBorder">
          <h1 className="text-2xl font-bold text-gray-800">
            Portal<span className="text-brand-orange">Ari</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 text-brand-grayText hover:bg-brand-grayLight hover:text-brand-orange rounded-lg transition-colors group font-medium">
            <BookOpen className="w-5 h-5 mr-3 text-gray-400 group-hover:text-brand-orange" />
            Meus Cursos
          </a>
          <a href="#" className="flex items-center px-4 py-3 bg-orange-50 text-brand-orange rounded-lg transition-colors group font-medium">
            <Target className="w-5 h-5 mr-3 text-brand-orange" />
            Simulados
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-brand-grayText hover:bg-brand-grayLight hover:text-brand-orange rounded-lg transition-colors group font-medium">
            <Video className="w-5 h-5 mr-3 text-gray-400 group-hover:text-brand-orange" />
            Aulas ao Vivo
          </a>
        </nav>

        <div className="p-4 border-t border-brand-grayBorder">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-brand-grayBorder flex items-center justify-between px-6">
          <button className="md:hidden text-gray-500 hover:text-brand-orange">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 md:flex-none"></div> {/* Spacer */}

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Olá, Aluno
            </span>
            <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}