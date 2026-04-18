import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, Smartphone, Info } from 'lucide-react';
import { Button } from './ui/button';

interface InstallBannerProps {
  onInstall: () => void;
  canInstall: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, canInstall }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-[400px]"
      >
        <div className="glass-dark border border-primary/20 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Smartphone className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Installer l'App</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Accédez au calendrier United 2026 instantanément depuis votre écran d'accueil.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {canInstall ? (
              <Button 
                onClick={onInstall}
                className="flex-1 bg-primary text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Download className="mr-2 h-4 w-4" /> Installer Maintenant
              </Button>
            ) : isIOS ? (
              <Button 
                onClick={() => setShowIOSGuide(true)}
                className="flex-1 bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl hover:bg-white/20 transition-all"
              >
                <Info className="mr-2 h-4 w-4" /> Comment Installer ?
              </Button>
            ) : null}
          </div>
        </div>

        {/* iOS Installation Guide Modal */}
        <AnimatePresence>
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-dark border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mx-auto">
                    <Smartphone className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-widest">Installation iOS</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-primary">1</div>
                    <p className="text-sm font-medium">Appuyez sur le bouton <span className="text-primary font-bold inline-flex items-center gap-1"><Share className="h-4 w-4" /> Partager</span> dans Safari.</p>
                  </div>
                  <div className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-primary">2</div>
                    <p className="text-sm font-medium">Faites défiler et choisissez <span className="text-primary font-bold">"Sur l'écran d'accueil"</span>.</p>
                  </div>
                  <div className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-primary">3</div>
                    <p className="text-sm font-medium">Appuyez sur <span className="text-primary font-bold">"Ajouter"</span> en haut à droite.</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl"
                >
                  J'ai compris
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
