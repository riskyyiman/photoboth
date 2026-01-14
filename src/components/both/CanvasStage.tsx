'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { useBoothStore } from '@/lib/store';
import Konva from 'konva';

// --- SUB COMPONENT: Draggable Image ---
const DraggableImage = ({ photo, isSelected, onSelect, onChange, stageWidth, stageHeight, layout }: any) => {
  const [img] = useImage(photo.url, 'anonymous');
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // LOGIC 1: Auto-Resize & Snap to TOP SLOT
  useEffect(() => {
    if (img && shapeRef.current) {
      // Cek apakah foto masih dalam posisi default (baru masuk)
      // Pastikan angka ini sesuai dengan default di store.ts (biasanya x:0, y:0 atau x:50, y:50)
      // Kita anggap default store adalah x:0, y:0 atau x:50, y:50.
      // Untuk keamanan, kita trigger jika scale masih 1 (belum diresize user).
      const isDefaultState = photo.scale === 1;

      if (isDefaultState) {
        // 1. Tentukan ukuran "Cell" (Satu Kotak Foto)
        let cellWidth, cellHeight;

        if (layout === 'strip-4') {
          // Strip (4x1): Lebar Penuh, Tinggi dibagi 4
          cellWidth = stageWidth;
          cellHeight = stageHeight / 4;
        } else {
          // Grid (2x2): Lebar dibagi 2, Tinggi dibagi 2
          cellWidth = stageWidth / 2;
          cellHeight = stageHeight / 2;
        }

        // 2. Berikan padding agar gambar tidak terlalu mepet garis frame
        const padding = 20;
        const targetW = cellWidth - padding;
        const targetH = cellHeight - padding;

        // 3. Hitung Scale agar muat di dalam SATU KOTAK (bukan stage penuh)
        const scaleW = targetW / img.width;
        const scaleH = targetH / img.height;

        // Pilih scale terkecil agar 'contain' (muat seluruh wajah)
        const newScale = Math.min(scaleW, scaleH);

        // 4. POSISI: Letakkan di tengah KOTAK PERTAMA (Slot 1)
        // Karena Slot 1 selalu mulai dari 0,0 (pojok kiri atas),
        // Kita cukup membagi sisa ruang cell dibagi 2.

        const newX = (cellWidth - img.width * newScale) / 2;
        const newY = (cellHeight - img.height * newScale) / 2;

        // Update Store
        onChange({
          x: newX,
          y: newY,
          scale: newScale,
          rotation: 0,
        });
      }
    }
  }, [img, stageWidth, stageHeight, layout]);

  // LOGIC 2: Transformer (Alat Resize Manual)
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={img}
        x={photo.x}
        y={photo.y}
        scaleX={photo.scale}
        scaleY={photo.scale}
        rotation={photo.rotation}
        draggable
        // Visual Style
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.2}
        shadowOffsetX={2}
        shadowOffsetY={4}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          onChange({
            x: node.x(),
            y: node.y(),
            scale: node.scaleX(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
          anchorSize={10}
          anchorCornerRadius={5}
          borderStroke="#ec4899"
          anchorStroke="#ec4899"
          anchorFill="#fff"
        />
      )}
    </>
  );
};

// --- MAIN COMPONENT ---
export default function CanvasStage({ stageRef }: { stageRef: any }) {
  const { photos, updatePhoto, selectedId, selectPhoto, backgroundColor, layout } = useBoothStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  // Base Sizes (Resolusi Tinggi untuk Download)
  const baseWidth = layout === 'strip-4' ? 400 : 800;
  const baseHeight = layout === 'strip-4' ? 1200 : 800;

  // Responsiveness Logic
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.offsetWidth;
      const containerH = containerRef.current.offsetHeight;
      const padding = 40;
      const scaleW = (containerW - padding) / baseWidth;
      const scaleH = (containerH - padding) / baseHeight;
      setScale(Math.min(scaleW, scaleH));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, baseWidth, baseHeight]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden bg-transparent relative"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) selectPhoto(null);
      }}
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
        }}
        className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] bg-white"
      >
        <Stage
          width={baseWidth}
          height={baseHeight}
          ref={stageRef}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) selectPhoto(null);
          }}
        >
          <Layer>
            <Rect width={baseWidth} height={baseHeight} fill={backgroundColor} />

            {photos.map((photo) => (
              <DraggableImage
                key={photo.id}
                photo={photo}
                stageWidth={baseWidth}
                stageHeight={baseHeight}
                layout={layout} // Pass layout agar child tahu ukuran slot
                isSelected={photo.id === selectedId}
                onSelect={() => selectPhoto(photo.id)}
                onChange={(newAttrs: any) => updatePhoto(photo.id, newAttrs)}
              />
            ))}

            {/* Overlay Frame */}
            <Group listening={false}>
              <Rect width={baseWidth} height={baseHeight} stroke="white" strokeWidth={layout === 'strip-4' ? 30 : 40} fillEnabled={false} />

              {layout === 'grid-2x2' && (
                <>
                  <Rect x={baseWidth / 2 - 10} width={20} height={baseHeight} fill="white" />
                  <Rect y={baseHeight / 2 - 10} width={baseWidth} height={20} fill="white" />
                </>
              )}

              {layout === 'strip-4' && (
                <>
                  <Rect y={baseHeight * 0.25 - 10} width={baseWidth} height={20} fill="white" />
                  <Rect y={baseHeight * 0.5 - 10} width={baseWidth} height={20} fill="white" />
                  <Rect y={baseHeight * 0.75 - 10} width={baseWidth} height={20} fill="white" />
                </>
              )}
            </Group>
          </Layer>
        </Stage>
      </div>

      <div className="absolute bottom-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium pointer-events-none opacity-60 shadow-lg">
        Canvas Size: {baseWidth}x{baseHeight}px ({Math.round(scale * 100)}%)
      </div>
    </div>
  );
}
