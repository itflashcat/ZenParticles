import React from 'react';
import { ShapeType } from '../types';
import { COLORS } from '../constants';

interface ControlsProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  currentColor: string;
  setColor: (c: string) => void;
  isConnected: boolean;
  toggleConnection: () => void;
  tension: number;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  setShape,
  currentColor,
  setColor,
  isConnected,
  toggleConnection,
  tension
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            ZenParticles
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gemini Live Powered
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={toggleConnection}
            className={`px-6 py-2 rounded-full font-semibold transition-all shadow-lg backdrop-blur-md border ${
              isConnected 
                ? 'bg-red-500/20 border-red-500 text-red-100 hover:bg-red-500/30' 
                : 'bg-green-500/20 border-green-500 text-green-100 hover:bg-green-500/30'
            }`}
          >
            {isConnected ? 'Stop Camera' : 'Start Camera'}
          </button>
          
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Tension</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${tension * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono w-8 text-right">{(tension * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Instructions Overlay if not connected */}
      {!isConnected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
          <p className="text-xl text-white font-light">Press "Start Camera" to control particles with your hands.</p>
          <p className="text-sm text-gray-400 mt-2">Open Hands = Expand • Closed Fists = Compress</p>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="pointer-events-auto flex flex-col gap-4 md:flex-row md:items-end justify-between w-full max-w-4xl mx-auto">
        
        {/* Shape Selectors */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Shape Template</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(ShapeType).map((shape) => (
              <button
                key={shape}
                onClick={() => setShape(shape)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentShape === shape
                    ? 'bg-white text-black shadow-lg scale-105 font-bold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selectors */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Particle Color</h3>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 ${
                  currentColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Controls;
