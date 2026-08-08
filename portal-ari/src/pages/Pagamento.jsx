import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, QrCode, ShieldCheck, Lock, ArrowLeft, 
  CheckCircle2, AlertCircle, ChevronRight 
} from 'lucide-react';

export default function Pagamento() {
  const navigate = useNavigate();
  const [metodoPagamento, setMetodoPagamento] = useState('cartao'); // 'cartao' ou 'pix'
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulando um tempo de processamento de API
    setTimeout(() => {
      console.log(`Processando pagamento via: ${metodoPagamento}`);
      setIsProcessing(false);
      // Após o pagamento, redireciona para o Dashboard
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      
      {/* Container Principal */}
      <div className="max-w-5xl w-full mx-auto">
        
        {/* Navegação Topo */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para o início
          </Link>
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
            Portal<span className="text-brand-orange">Ari</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LADO ESQUERDO: Resumo da Compra */}
          <div className="bg-slate-900 p-8 lg:p-12 lg:w-2/5 flex flex-col relative overflow-hidden text-white">
            {/* Efeito de Fundo */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-orange rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs mb-8 border border-orange-500/20">
                <ShieldCheck className="w-4 h-4" /> Compra 100% Segura
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Acesso Premium</h2>
              <p className="text-slate-400 text-sm mb-10">Assinatura Anual - PortalAri</p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 font-medium">Acesso imediato a todas as trilhas e módulos.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 font-medium">Simulados inéditos com tecnologia anti-cópia.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 font-medium">Correção instantânea e estatísticas de desempenho.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-slate-800 pt-8 mt-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 font-medium">Total a pagar</span>
                <span className="text-4xl font-black text-white">R$ 197<span className="text-xl text-brand-orange">,00</span></span>
              </div>
              <p className="text-xs text-right text-slate-500">ou em até 12x no cartão de crédito</p>
            </div>
          </div>

          {/* LADO DIREITO: Formulário de Pagamento */}
          <div className="p-8 lg:p-12 lg:w-3/5 bg-white">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Como você prefere pagar?</h3>

            {/* Abas de Método de Pagamento */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setMetodoPagamento('cartao')}
                className={`flex-1 flex flex-col items-center justify-center py-4 px-4 rounded-2xl border-2 transition-all ${
                  metodoPagamento === 'cartao' 
                    ? 'border-brand-orange bg-orange-50/50 text-brand-orange shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className={`w-6 h-6 mb-2 ${metodoPagamento === 'cartao' ? 'text-brand-orange' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Cartão de Crédito</span>
              </button>
              
              <button
                onClick={() => setMetodoPagamento('pix')}
                className={`flex-1 flex flex-col items-center justify-center py-4 px-4 rounded-2xl border-2 transition-all ${
                  metodoPagamento === 'pix' 
                    ? 'border-brand-orange bg-orange-50/50 text-brand-orange shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode className={`w-6 h-6 mb-2 ${metodoPagamento === 'pix' ? 'text-brand-orange' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Pix (Aprovação na hora)</span>
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              
              {/* Renderização Condicional: Cartão */}
              {metodoPagamento === 'cartao' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Número do Cartão</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required
                        maxLength="19"
                        placeholder="0000 0000 0000 0000"
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome impresso no cartão</label>
                    <input 
                      type="text" 
                      required
                      placeholder="NOME SOBRENOME"
                      className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium uppercase"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vencimento</label>
                      <input 
                        type="text" 
                        required
                        maxLength="5"
                        placeholder="MM/AA"
                        className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">CVC</label>
                      <input 
                        type="text" 
                        required
                        maxLength="4"
                        placeholder="123"
                        className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Renderização Condicional: Pix */}
              {metodoPagamento === 'pix' && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-orange-100">
                    <QrCode className="w-8 h-8 text-brand-orange" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Liberação Imediata</h4>
                  <p className="text-sm text-slate-600 font-medium">
                    Ao clicar no botão abaixo, vamos gerar o seu QR Code e o código Pix Copia e Cola. O acesso chega no seu e-mail na mesma hora.
                  </p>
                </div>
              )}

              {/* Alerta de Garantia */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Garantia incondicional de 7 dias. Ao prosseguir, você concorda com nossos <a href="#" className="text-brand-orange hover:underline">Termos de Uso</a> e <a href="#" className="text-brand-orange hover:underline">Políticas de Privacidade</a>.
                </p>
              </div>

              {/* Botão de Finalizar */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-brand-orange hover:bg-orange-600 text-white text-base font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processando...
                  </span>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {metodoPagamento === 'cartao' ? 'Pagar R$ 197,00 e Acessar' : 'Gerar Código Pix'}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center gap-6 opacity-40 grayscale">
              <span className="text-[10px] font-black tracking-widest uppercase">Pagamento Seguro</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}