import React from 'react';
import { motion } from 'motion/react';
import { HOST_CITIES } from '../constants';
import { Card, CardContent } from './ui/card';
import { MapPin, Users, Globe } from 'lucide-react';

export const HostCities: React.FC = () => {
  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Villes Hôtes</h2>
        <p className="text-zinc-500 font-medium max-w-2xl px-4">
          Découvrez les 16 métropoles qui accueilleront les 104 matchs du tournoi le plus grandiose de l'histoire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {HOST_CITIES.map((city, index) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="overflow-hidden border-none glass-card group cursor-pointer h-full hover-glow transition-all duration-500 rounded-[2rem]">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                    <Globe className="h-3 w-3" />
                    {city.country}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{city.name}</h3>
                </div>
              </div>
              
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Stade</p>
                      <p className="font-bold text-zinc-200">{city.stadium}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Capacité</p>
                      <p className="font-bold text-zinc-200">{city.capacity.toLocaleString()} sièges</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed italic">
                  "{city.description}"
                </p>

                <div className="pt-4 border-t border-white/5">
                  <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary hover:bg-white/5 rounded-2xl transition-all border border-white/5 hover:border-primary/30">
                    Voir sur la carte
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
