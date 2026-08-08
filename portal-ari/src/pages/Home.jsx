import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, GraduationCap, Calculator, ChevronRight, Quote, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import logoAri from '../assets/logo-ari.jpeg';

function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

const NICHE_STORAGE_KEY = 'selectedNiche';

const NICHES = [
  {
    id: 'enem',
    title: 'ENEM',
    description: 'Domine a matemática e alcance a nota mil no Exame Nacional do Ensino Médio.',
    icon: BookOpen,
    accent: 'orange',
  },
  {
    id: 'concursos',
    title: 'Concursos',
    description: 'Raciocínio lógico e matemática gabaritados para garantir a sua posse.',
    icon: Target,
    accent: 'blue',
  },
  {
    id: 'pre-ifma',
    title: 'Pré-IFMA',
    description: 'Preparação completa e focada para o Instituto Federal e Colégio Militar.',
    icon: GraduationCap,
    accent: 'emerald',
  },
  {
    id: 'pre-cmt-6',
    title: '6° Ano (CMT)',
    description: 'Construindo uma matemática forte e base sólida para os alunos do sexto ano.',
    icon: Calculator,
    accent: 'purple',
  },
  {
    id: 'Isodala de Matemática',
    title: 'Isodala de Matemática',
    description: 'Aprofunde seus conhecimentos e domine a matemática com o Isodala.',
    icon: Sparkles,
    accent: 'emerald',
  }
];

const ACCENT_STYLES = {
  orange: {
    iconBg: 'bg-orange-50 text-brand-orange group-hover:bg-brand-orange group-hover:text-white',
    border: 'hover:border-brand-orange',
    glow: 'hover:shadow-brand-orange/20',
    gradient: 'from-brand-orange/5',
    ctaText: 'text-brand-orange',
    ring: 'ring-brand-orange',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    border: 'hover:border-blue-500',
    glow: 'hover:shadow-blue-500/20',
    gradient: 'from-blue-500/5',
    ctaText: 'text-blue-600',
    ring: 'ring-blue-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    border: 'hover:border-emerald-500',
    glow: 'hover:shadow-emerald-500/20',
    gradient: 'from-emerald-500/5',
    ctaText: 'text-emerald-600',
    ring: 'ring-emerald-500',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    border: 'hover:border-purple-500',
    glow: 'hover:shadow-purple-500/20',
    gradient: 'from-purple-500/5',
    ctaText: 'text-purple-600',
    ring: 'ring-purple-500',
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedNiche, setSelectedNiche] = React.useState(null);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleSelectNiche = (nicheId) => {
    setSelectedNiche(nicheId);
    setIsNavigating(true);

    localStorage.setItem(NICHE_STORAGE_KEY, nicheId);

    setTimeout(() => {
      if (isAuthenticated()) {
        navigate('/dashboard', { state: { niche: nicheId } });
      } else {
        navigate(`/login?niche=${nicheId}`, { state: { niche: nicheId } });
      }
    }, 250);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-x-hidden selection:bg-brand-orange selection:text-white">

      <section className="relative bg-slate-950 text-white pt-20 pb-20 px-6 sm:px-12 overflow-hidden">

        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand-orange/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center text-center mb-16">
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
              <img 
                src={logoAri} 
                alt="Ícone Arimatica " 
                className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-cover border-2 border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
              />
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-wide sm:text-left text-center">
                ARIMATICA<br />
                <span className="text-brand-orange">GABARITANDO</span>
              </h1>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-brand-orange rounded-full"
            />
          </motion.div>

          <div className="space-y-8 text-slate-300 text-lg md:text-xl font-medium leading-relaxed">

            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white leading-tight text-center mb-12">
              Seja bem-vindo(a)! <br />
              <span className="text-brand-orange">É um grande prazer ter você aqui.</span>
            </motion.h2>

            <motion.p variants={fadeUp}>
              Você acaba de entrar em um ambiente criado especialmente para tornar seus estudos mais eficientes, organizados e objetivos. Na Plataforma Aritmatica Gabaritando, você encontrará conteúdos de alta qualidade, materiais cuidadosamente elaborados, <strong className="text-white">banco de questões, questões comentadas, simulados, LIVES, Videoaulas</strong> e recursos que irão fortalecer seu aprendizado e acelerar sua preparação.
            </motion.p>

            <motion.p variants={fadeUp}>
              Nosso compromisso é oferecer uma experiência de estudo clara, prática e direcionada, permitindo que você desenvolva seus conhecimentos com segurança e alcance um excelente desempenho em <strong className="text-white">provas, concursos públicos, ENEM e demais processos seletivos</strong>.
            </motion.p>

            <motion.p variants={fadeUp}>
              Cada ferramenta disponível foi pensada para facilitar sua jornada, ajudando você a aprender com eficiência, revisar os principais conteúdos e acompanhar sua evolução de forma simples e inteligente.
            </motion.p>

            <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 mt-10 relative overflow-hidden group shadow-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-brand-orange/10 to-brand-orange/0"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <Quote className="absolute top-6 right-6 w-16 h-16 text-white/5 rotate-180 transition-transform duration-700 group-hover:scale-110" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                <div className="shrink-0 relative">
                  <img 
                    src={logoAri} 
                    alt="Prof. Ari" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-slate-900 shadow-lg uppercase">
                    Mentor
                  </div>
                </div>

                <div>
                  <p className="text-brand-orange font-bold text-xl md:text-2xl italic leading-snug mb-4">
                    "Acredite no seu potencial, mantenha a disciplina e aproveite ao máximo tudo o que esta plataforma oferece. Estamos ao seu lado nessa caminhada rumo à sua aprovação."
                  </p>
                  <p className="text-white font-bold uppercase tracking-wider">Prof. Ari</p>
                  <p className="text-slate-400 text-sm font-medium">Fundador & Mentor</p>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      <section className="relative z-20 bg-[#f8fafc] px-6 sm:px-12 py-20 pb-32">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >

          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-100 mb-6">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Próximo Passo</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Qual é a sua meta?
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Selecione a sua turma abaixo para personalizarmos sua trilha de estudos, organizar suas questões e adaptar os seus simulados.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={staggerContainer}>
            {NICHES.map((niche) => {
              const Icon = niche.icon;
              const styles = ACCENT_STYLES[niche.accent];
              const isSelected = selectedNiche === niche.id;
              const isDisabled = isNavigating && !isSelected;

              return (
                <motion.button
                  key={niche.id}
                  variants={cardVariant}
                  whileHover={!isNavigating ? { scale: 1.03, y: -8 } : {}}
                  whileTap={!isNavigating ? { scale: 0.98 } : {}}
                  onClick={() => !isNavigating && handleSelectNiche(niche.id)}
                  disabled={isNavigating}
                  aria-pressed={isSelected}
                  className={`group bg-white p-8 rounded-[2.5rem] border transition-all text-left flex flex-col justify-between h-72 relative overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl
                    ${styles.border} ${styles.glow}
                    ${isSelected ? `border-transparent ring-2 ${styles.ring}` : 'border-slate-200'}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} to-transparent transition-opacity duration-500
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors duration-300 relative z-10 shadow-sm ${styles.iconBg}`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  <div className="relative z-10 mt-6">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{niche.title}</h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-3">{niche.description}</p>
                  </div>

                  <div className={`flex items-center font-bold mt-6 transition-all transform relative z-10 ${styles.ctaText}
                    ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                    {isSelected ? 'Selecionado...' : 'Acessar Turma'}
                    <motion.div initial={{ x: 0 }} whileHover={{ x: 5 }}>
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}