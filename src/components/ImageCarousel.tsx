import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sprout, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarouselSlide {
  id: string;
  image: string;
  fallbackUrl: string;
  title: string;
  subtitle: string;
  tag: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    image: '/femme-africaine-recolte-legumes_23-2151441225.jpg',
    fallbackUrl: 'https://img.freepik.com/photos-gratuite/femme-africaine-recolte-legumes_23-2151441225.jpg',
    title: 'Cultures & Récoltes Maraîchères Bio',
    subtitle: 'Production de tomates et légumes de serre de haute qualité',
    tag: 'Récolte Durable'
  },
  {
    id: 'slide-2',
    image: '/ouvrier-agricole-afro-americain-joyeux-tenant-caisse-pleine-legumes-verts-murs-locaux-ecologiques-provenant-recolte-durable-ferme-serre-bio-permaculture-entrepreneuriale_482257-64585.jpg',
    fallbackUrl: 'https://img.freepik.com/photos-gratuite/ouvrier-agricole-afro-americain-joyeux-tenant-caisse-pleine-legumes-verts-murs-locaux-ecologiques-provenant-recolte-durable-ferme-serre-bio-permaculture-entrepreneuriale_482257-64585.jpg',
    title: 'Serres Écologiques & Permaculture',
    subtitle: 'Légumes verts bio et circuits courts d\'approvisionnement',
    tag: 'Serres Agroprofit'
  },
  {
    id: 'slide-3',
    image: '/travailleur-serre-femme-caucasienne-ombrageant-yeux-main-tout-parlant-homme-afro-americain-pointant-dans-ferme-laitue-biologique-diverses-personnes-prenant-pause-dans-culture-legumes-bio_482257-47494.jpg',
    fallbackUrl: 'https://img.freepik.com/photos-gratuite/travailleur-serre-femme-caucasienne-ombrageant-yeux-main-tout-parlant-homme-afro-americain-pointant-dans-ferme-laitue-biologique-diverses-personnes-prenant-pause-dans-culture-legumes-bio_482257-47494.jpg',
    title: 'Expertise Agronomique & Synergie',
    subtitle: 'Équipes d\'ingénieurs et techniciens au cœur des exploitations',
    tag: 'Développement Durable'
  },
  {
    id: 'slide-4',
    image: '/vue-photorealiste-africains-recoltant-legumes-cereales_23-2151487424.jpg',
    fallbackUrl: 'https://img.freepik.com/photos-gratuite/vue-photorealiste-africains-recoltant-legumes-cereales_23-2151487424.jpg',
    title: 'Grandes Productions Agricoles & Maraîchage',
    subtitle: 'Rendements élevés et valorisation des récoltes locales',
    tag: 'Rendements 24h'
  },
  {
    id: 'slide-5',
    image: '/face-machinerie-agricole-beau-homme-afro-americain-est-dans-domaine-agricole_146671-106020.jpg',
    fallbackUrl: 'https://img.freepik.com/photos-gratuite/face-machinerie-agricole-beau-homme-afro-americain-est-dans-domaine-agricole_146671-106020.jpg',
    title: 'Mécanisation & Équipements de Pointe',
    subtitle: 'Tracteurs et moissonneuses pour grands domaines agricoles',
    tag: 'Machinerie VIP'
  }
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Défilement automatique toutes les 3.8s
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const currentSlide = CAROUSEL_SLIDES[currentIndex];

  return (
    <div 
      className="w-full relative group select-none mt-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="home-image-carousel"
    >
      {/* En-tête de section - Intégration naturelle sans cadre lourd */}
      <div className="flex items-center justify-between px-1 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950/70 border border-cyan-500/25 text-cyan-300 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-100 font-mono luminous-text-soft">
            Entreprises & Exploitations Partenaires
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/25 text-cyan-300 text-[9px] font-bold uppercase tracking-wider font-mono">
          En activité
        </span>
      </div>

      {/* Conteneur de l'image (Responsive 16:9 / 21:9) - Bordure fine et discrète */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg border border-cyan-500/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image exacte fournie par l'utilisateur */}
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center block"
              referrerPolicy="no-referrer"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== currentSlide.fallbackUrl) {
                  target.src = currentSlide.fallbackUrl;
                }
              }}
            />

            {/* Dégradé subtil pour la lisibilité des textes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Superposition textuelle */}
            <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between text-left pointer-events-none">
              {/* Tag & Indicateur de page */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold tracking-wider shadow-sm border border-emerald-400/30">
                  <Sprout className="w-3 h-3" />
                  <span>{currentSlide.tag}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-mono font-medium">
                  {currentIndex + 1} / {CAROUSEL_SLIDES.length}
                </span>
              </div>

              {/* Titre & Sous-titre */}
              <div className="space-y-1">
                <h4 className="text-white text-sm sm:text-base font-bold drop-shadow-md leading-tight">
                  {currentSlide.title}
                </h4>
                <p className="text-slate-200 text-[10px] sm:text-xs leading-snug drop-shadow-sm font-medium line-clamp-1">
                  {currentSlide.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bouton Précédent */}
        <button
          onClick={handlePrev}
          id="btn-carousel-prev"
          aria-label="Image précédente"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Bouton Suivant */}
        <button
          onClick={handleNext}
          id="btn-carousel-next"
          aria-label="Image suivante"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Indicateurs à points - Sans bordure de séparation */}
      <div className="flex items-center justify-center gap-1.5 py-2">
        {CAROUSEL_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? 'w-6 h-1.5 bg-cyan-400'
                : 'w-1.5 h-1.5 bg-cyan-950/80 hover:bg-cyan-800'
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
