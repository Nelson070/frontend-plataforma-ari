import React, { useState } from 'react';
import { Loader2, CreditCard, QrCode, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Pagamento() {
  const [loading, setLoading] = useState(false);
  const [metodo, setMetodo] = useState('cartao'); // 'cartao' ou 'pix'

  const handlePagarStripe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // Chama a Edge Function do Supabase que cria a sessão do Stripe
      const { data, error } = await supabase.functions.createCheckoutSession({
        userId: user.id,
        email: user.email,
      });

      if (error) throw error;

      // Redireciona o aluno para o ambiente seguro de pagamento do Stripe
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err);
      alert('Erro ao conectar com o gateway de pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-3 font-black text-xl">
            A
          </div>
          <h2 className="text-2xl font-black">Finalize sua Matrícula</h2>
          <p className="text-sm text-slate-400 mt-1">Acesso completo ao Portal do Ari</p>
        </div>

        {/* Seletor de Método */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMetodo('cartao')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              metodo === 'cartao'
                ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-orange-500/20'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Cartão
          </button>
          <button
            onClick={() => setMetodo('pix')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              metodo === 'pix'
                ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-orange-500/20'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" /> Pix
          </button>
        </div>

        {metodo === 'cartao' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 text-center mb-2">
              Você será redirecionado para o ambiente seguro do Stripe para preencher os dados do cartão.
            </p>
            <button
              onClick={handlePagarStripe}
              disabled={loading}
              className="w-full py-4 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ir para o Checkout Seguro'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center text-slate-900 font-bold">
              [ QR Code Pix Gerado ]
            </div>
            <p className="text-xs text-slate-400">Escaneie o QR Code com o aplicativo do seu banco para liberar o acesso na hora.</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Pagamento 100% criptografado e seguro
        </div>
      </div>
    </div>
  );
}