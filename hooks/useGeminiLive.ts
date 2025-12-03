import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { MODEL_NAME } from '../constants';

interface GeminiLiveProps {
  onTensionChange: (tension: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useGeminiLive = ({ onTensionChange, videoRef }: GeminiLiveProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const frameIntervalRef = useRef<number | null>(null);

  // Define the tool for the model to report tension
  const tensionTool: FunctionDeclaration = {
    name: 'setHandTension',
    description: 'Updates the tension level based on user hand gestures. 0 is relaxed/open hands, 1 is tight/closed fists.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tension: {
          type: Type.NUMBER,
          description: 'A value between 0.0 (relaxed) and 1.0 (tense)',
        },
      },
      required: ['tension'],
    },
  };

  const connect = async () => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY not found in environment.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);
            startVideoStreaming(sessionPromise);
          },
          onmessage: (message: LiveServerMessage) => {
            // Handle Tool Calls (this is where we get the tension)
            if (message.toolCall) {
              message.toolCall.functionCalls.forEach((fc) => {
                if (fc.name === 'setHandTension') {
                  const args = fc.args as any;
                  if (typeof args.tension === 'number') {
                    onTensionChange(args.tension);
                  }
                  
                  // Must respond to the tool call
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "OK" }
                      }
                    });
                  });
                }
              });
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            setIsConnected(false);
            stopVideoStreaming();
          },
          onerror: (err) => {
            console.error('Gemini Live Error:', err);
            setError(err.message || 'Unknown error');
            setIsConnected(false);
            stopVideoStreaming();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO], // We must accept audio to use Live, even if we ignore it
          tools: [{ functionDeclarations: [tensionTool] }],
          systemInstruction: `
            You are a real-time vision system. 
            Analyze the video stream of the user. 
            Focus on their hands.
            Detect the "tension" of the hands.
            - If hands are open and relaxed, tension is 0.0.
            - If hands are closed into fists, tension is 1.0.
            - If hands are half-closed, estimate the value between 0.0 and 1.0.
            - If no hands are visible, set tension to 0.0.
            
            CONTINUOUSLY and FREQUENTLY call the function 'setHandTension' with the detected value.
            Do not speak. Just call the function. 
            Update as fast as possible.
          `,
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      setError(e.message);
      console.error(e);
    }
  };

  const startVideoStreaming = (sessionPromise: Promise<any>) => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Send frames at ~5 FPS to keep latency low but avoid overwhelming bandwidth
    frameIntervalRef.current = window.setInterval(async () => {
      if (!video || video.paused || video.ended) return;

      canvas.width = 320; // Low res for speed
      canvas.height = 240;
      
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
      
      try {
        const session = await sessionPromise;
        session.sendRealtimeInput({
          media: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      } catch (err) {
        console.error("Error sending frame:", err);
      }
    }, 200); // 200ms = 5fps
  };

  const stopVideoStreaming = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const disconnect = async () => {
    if (sessionRef.current) {
      const session = await sessionRef.current;
      // Close session if method exists (it usually does on the session object)
      // The SDK types might vary, but we can try-catch it.
      try {
        // session.close() is not always exposed directly on the promise result in all SDK versions,
        // but typically the client handles close. 
        // For this demo, we'll just stop streaming and let the GC/UI unmount handle it mostly,
        // or trigger a close via the client if stored.
        // The instruction says "session.close()" is valid.
        session.close();
      } catch (e) {
        console.warn("Could not close session cleanly", e);
      }
      sessionRef.current = null;
    }
    stopVideoStreaming();
    setIsConnected(false);
  };

  return { connect, disconnect, isConnected, error };
};