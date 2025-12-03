import React, { useState, useRef, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { ShapeType } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';
import { DEFAULT_COLOR } from './constants';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [currentColor, setCurrentColor] = useState<string>(DEFAULT_COLOR);
  const [tension, setTension] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Smooth tension updates to avoid jitter
  const targetTension = useRef(0);
  
  // Update current tension smoothly
  useEffect(() => {
    let animationFrameId: number;
    
    const animateTension = () => {
      setTension(prev => {
        const diff = targetTension.current - prev;
        if (Math.abs(diff) < 0.01) return targetTension.current;
        return prev + diff * 0.1; // Smooth interpolation factor
      });
      animationFrameId = requestAnimationFrame(animateTension);
    };
    
    animateTension();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleTensionUpdate = useCallback((newTension: number) => {
    // Clamp between 0 and 1
    const clamped = Math.max(0, Math.min(1, newTension));
    targetTension.current = clamped;
  }, []);

  const { connect, disconnect, isConnected, error } = useGeminiLive({
    onTensionChange: handleTensionUpdate,
    videoRef
  });

  const toggleConnection = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  // Setup video stream for the hook to use
  useEffect(() => {
    const setupCamera = async () => {
      if (isConnected && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240, frameRate: 15 } 
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (err) {
          console.error("Camera access denied or failed", err);
        }
      } else if (!isConnected && videoRef.current) {
        // Stop tracks
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
    
    setupCamera();
  }, [isConnected]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Hidden Video Element for Analysis */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none top-0 left-0"
        playsInline
        muted
      />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene 
          shape={currentShape} 
          tension={tension} 
          color={currentColor} 
        />
      </div>

      {/* UI Overlay */}
      <Controls
        currentShape={currentShape}
        setShape={setCurrentShape}
        currentColor={currentColor}
        setColor={setCurrentColor}
        isConnected={isConnected}
        toggleConnection={toggleConnection}
        tension={tension}
      />

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-xl backdrop-blur z-50">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default App;
