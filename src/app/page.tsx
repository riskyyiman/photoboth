'use client';

import { useBoothStore } from '@/lib/store';
import PhotoBoothEditor from '@/components/both/PhotoBoothEditor';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera } from 'lucide-react';

export default function Home() {
  const { mode, setMode } = useBoothStore();

  if (mode === 'studio') {
    return <PhotoBoothEditor />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-pink-500/20 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="z-10 text-center max-w-4xl px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">AI-Powered Photo Experience</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          Capture.
          <br />
          Create. Share.
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">Buat foto strip bergaya photobooth estetis langsung dari browser Anda. Tanpa antre, kualitas HD, dan privasi terjamin.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform" onClick={() => setMode('studio')}>
            <Camera className="mr-2 w-5 h-5" />
            Mulai Photo Booth
          </Button>

          <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full">
            Lihat Galeri
          </Button>
        </div>
      </motion.div>

      {/* Floating Mockups (Decorative) */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} className="absolute bottom-10 right-10 hidden lg:block opacity-50 z-0">
        <div className="w-48 h-64 border-4 border-white bg-pink-200 rotate-12 shadow-xl rounded-lg"></div>
      </motion.div>
    </div>
  );
}
