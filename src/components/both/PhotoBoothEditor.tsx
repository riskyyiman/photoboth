'use client';

import React, { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Camera, Upload, Undo, X, Image as ImageIcon, LayoutGrid, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBoothStore } from '@/lib/store';

// Import Canvas dinamis (No SSR)
const CanvasStage = dynamic(() => import('./CanvasStage'), {
  ssr: false,
  loading: () => <div className="flex h-[500px] w-full items-center justify-center text-slate-400 animate-pulse">Loading Studio...</div>,
});

const VIDEO_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export default function PhotoBoothEditor() {
  const { addPhoto, setMode, setLayout, setBackgroundColor, layout, backgroundColor } = useBoothStore();
  const webcamRef = useRef<Webcam>(null);
  const stageRef = useRef<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [cameraReady, setCameraReady] = useState(false); // Untuk cek apakah kamera sudah nyala
  const [cameraError, setCameraError] = useState<string | null>(null); // Untuk nampung error

  // Capture Function dengan efek flash visual
  const capture = useCallback(() => {
    setIsCapturing(true);
    const imageSrc = webcamRef.current?.getScreenshot();

    // Delay sedikit untuk efek visual
    setTimeout(() => {
      if (imageSrc) {
        addPhoto(imageSrc);
        setShowWebcam(false);
      }
      setIsCapturing(false);
    }, 200);
  }, [webcamRef, addPhoto]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => addPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (stageRef.current) {
      // Set pixelRatio tinggi agar hasil download tajam
      const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 font-sans">
      {/* === LEFT SIDEBAR (CONTROLS) === */}
      <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full lg:w-[360px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/30">P</div>
            <h2 className="font-bold text-lg tracking-tight">PhotoBooth AI</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMode('landing')} className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <Undo className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-8">
            {/* 1. Input Section */}
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 tracking-wider">Add Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-pink-500 hover:bg-pink-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all group" onClick={() => setShowWebcam(true)}>
                  <div className="p-3 rounded-full bg-pink-100 text-pink-600 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Open Cam</span>
                </Button>

                <label className="h-24 flex flex-col gap-2 items-center justify-center border border-slate-200 rounded-md hover:border-violet-500 hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer transition-all group">
                  <div className="p-3 rounded-full bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Upload</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </section>

            {/* 2. Customization Tabs */}
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 tracking-wider">Customize</h3>
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="w-full bg-slate-100 dark:bg-slate-800 p-1 mb-4 rounded-lg">
                  <TabsTrigger value="layout" className="flex-1">
                    <LayoutGrid className="w-4 h-4 mr-2" /> Layout
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" /> Style
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="layout" className="space-y-3">
                  <div
                    onClick={() => setLayout('strip-4')}
                    className={`cursor-pointer border-2 rounded-lg p-3 flex items-center gap-4 transition-all ${layout === 'strip-4' ? 'border-pink-500 bg-pink-50/50' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="w-8 h-16 border-2 border-slate-300 bg-white flex flex-col gap-0.5 p-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 bg-slate-200" />
                      ))}
                    </div>
                    <div>
                      <div className="font-medium">Photo Strip (4x1)</div>
                      <div className="text-xs text-slate-500">Classic photobooth style</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setLayout('grid-2x2')}
                    className={`cursor-pointer border-2 rounded-lg p-3 flex items-center gap-4 transition-all ${layout === 'grid-2x2' ? 'border-pink-500 bg-pink-50/50' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="w-12 h-10 border-2 border-slate-300 bg-white grid grid-cols-2 gap-0.5 p-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-200" />
                      ))}
                    </div>
                    <div>
                      <div className="font-medium">Grid (2x2)</div>
                      <div className="text-xs text-slate-500">Square social media post</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style">
                  <div className="grid grid-cols-5 gap-2">
                    {['#ffffff', '#000000', '#fecdd3', '#bae6fd', '#bbf7d0', '#ddd6fe', '#fde68a'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setBackgroundColor(c)}
                        className={`w-full aspect-square rounded-full border shadow-sm transition-transform hover:scale-110 ${backgroundColor === c ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Button size="lg" className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 transition-all shadow-lg shadow-pink-500/25 h-12 text-md" onClick={handleDownload}>
            <Download className="mr-2 w-5 h-5" /> Download Result
          </Button>
        </div>
      </motion.aside>

      {/* === RIGHT AREA (CANVAS WORKSPACE) === */}
      <main className="flex-1 relative flex flex-col bg-slate-100/50 dark:bg-slate-950/50">
        {/* Workspace Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Main Canvas Area */}
        <div className="flex-1 p-8 lg:p-12 w-full h-full flex items-center justify-center overflow-hidden z-10">
          <motion.div layout className="w-full h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <CanvasStage stageRef={stageRef} />
          </motion.div>
        </div>
      </main>

      {/* === MODALS / OVERLAYS === */}
      <AnimatePresence>
        {showWebcam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              {/* Header Modal */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                <span className="text-white/80 text-sm font-medium px-2">Sesuaikan posisi wajah Anda</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => {
                    setShowWebcam(false);
                    setCameraReady(false); // Reset state saat tutup
                    setCameraError(null);
                  }}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* AREA KAMERA */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {/* 1. Loading Spinner (Muncul jika kamera belum siap & tidak ada error) */}
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin" />
                    <p className="text-white/60 text-sm">Menghubungkan kamera...</p>
                  </div>
                )}

                {/* 2. Error Message (Muncul jika izin ditolak) */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-8 text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-white font-medium">Kamera tidak dapat diakses</p>
                    <p className="text-white/50 text-xs">{cameraError}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                      Refresh Halaman
                    </Button>
                  </div>
                )}

                {/* 3. Komponen Webcam yang Diperbaiki */}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: 'user',
                  }}
                  mirrored={true}
                  // Penting: Event Handlers untuk diagnosa
                  onUserMedia={() => {
                    console.log('Kamera aktif!');
                    setCameraReady(true);
                  }}
                  onUserMediaError={(err) => {
                    console.error('Kamera error:', err);
                    setCameraError('Pastikan Anda mengizinkan akses kamera di browser.');
                  }}
                  // Penting: Style objectFit cover agar tidak gepeng/hitam
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: cameraReady ? 1 : 0, // Sembunyikan kalau belum siap (biar ga glitch)
                    transition: 'opacity 0.5s ease',
                  }}
                />

                {/* Flash Effect saat foto diambil */}
                {isCapturing && <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-30" />}
              </div>

              {/* Footer Controls */}
              <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center items-center">
                <Button
                  disabled={!cameraReady} // Disable tombol jika kamera belum siap
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 border-4 border-slate-300 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                  onClick={capture}
                >
                  {/* Visual tombol shutter kamera */}
                  <div className="w-14 h-14 rounded-full border-2 border-slate-400 group-hover:border-pink-500 transition-colors" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
