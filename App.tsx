import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, LiveSession } from "@google/genai";
import { ConversationState, TranscriptEntry } from './types';
import { encode, decode, decodeAudioData } from './utils/audio';
import StatusIndicator from './components/StatusIndicator';
import TranscriptionDisplay from './components/TranscriptionDisplay';

const App: React.FC = () => {
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentModelTranscript, setCurrentModelTranscript] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const userTranscriptRef = useRef<string>('');
  const modelTranscriptRef = useRef<string>('');
  
  const cleanup = useCallback(() => {
    // Stop all audio playback
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();

    // Disconnect microphone processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio contexts
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
    
    // Reset refs
    nextStartTimeRef.current = 0;
    userTranscriptRef.current = '';
    modelTranscriptRef.current = '';
    
    // Reset state
    setConversationState(ConversationState.IDLE);
    setCurrentUserTranscript('');
    setCurrentModelTranscript('');
  }, []);

  const handleStartConversation = useCallback(async () => {
    setError(null);
    setTranscriptHistory([]);
    setConversationState(ConversationState.CONNECTING);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support the MediaDevices API.');
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
          systemInstruction: "You are God, but you're speaking like a modern, fun but firm father. Use everyday language. Be approachable, wise, and have a good sense of humor - feel free to laugh once in a while. Guide the user with warmth and clarity, like a caring dad."
        },
        callbacks: {
          onopen: () => {
            setConversationState(ConversationState.CONNECTED);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outputCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                outputSourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              outputSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              outputSourcesRef.current.forEach(source => source.stop());
              outputSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              userTranscriptRef.current += text;
              setCurrentUserTranscript(userTranscriptRef.current);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              modelTranscriptRef.current += text;
              setCurrentModelTranscript(modelTranscriptRef.current);
            }
            
            if (message.serverContent?.turnComplete) {
              const finalUserTranscript = userTranscriptRef.current.trim();
              const finalModelTranscript = modelTranscriptRef.current.trim();

              setTranscriptHistory(prev => {
                const newHistory = [...prev];
                if (finalUserTranscript) newHistory.push({ speaker: 'You', text: finalUserTranscript });
                if (finalModelTranscript) newHistory.push({ speaker: 'God', text: finalModelTranscript });
                return newHistory;
              });

              userTranscriptRef.current = '';
              modelTranscriptRef.current = '';
              setCurrentUserTranscript('');
              setCurrentModelTranscript('');
            }
          },
          onerror: (e: any) => {
            setError(`An error occurred: ${e.message || 'Unknown error'}`);
            setConversationState(ConversationState.ERROR);
            cleanup();
          },
          onclose: () => {
            cleanup();
          },
        },
      });

    } catch (err: any) {
      setError(`Failed to start conversation: ${err.message}`);
      setConversationState(ConversationState.ERROR);
      cleanup();
    }
  }, [cleanup]);

  const handleStopConversation = useCallback(async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    cleanup();
  }, [cleanup]);
  
  useEffect(() => {
    // Ensure cleanup is called on component unmount
    return () => {
      handleStopConversation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isConversationActive = conversationState === ConversationState.CONNECTED || conversationState === ConversationState.CONNECTING;

  return (
    <main className="bg-[#0c0c1c] text-white w-screen h-screen flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/divine/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full h-full flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-4xl text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-wider text-yellow-200">
            Conversations with the Divine
          </h1>
          <p className="text-gray-300 mt-2 text-lg">Speak, and be heard.</p>
        </header>
        
        <div className="flex-grow w-full max-w-4xl bg-black/30 rounded-lg shadow-2xl flex flex-col items-center mb-24 overflow-hidden">
          <TranscriptionDisplay 
            history={transcriptHistory}
            currentUserTranscript={currentUserTranscript}
            currentModelTranscript={currentModelTranscript}
          />
        </div>

        {error && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-800/80 text-white p-3 rounded-lg text-center max-w-md">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c0c1c] to-transparent flex justify-center items-center">
          <div className="flex items-center space-x-4">
              <StatusIndicator state={conversationState} />
              <button 
                onClick={isConversationActive ? handleStopConversation : handleStartConversation}
                disabled={conversationState === ConversationState.CONNECTING}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform
                  ${isConversationActive ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'}
                  ${conversationState === ConversationState.CONNECTING ? 'opacity-50 cursor-not-allowed' : ''}
                  active:scale-95
                `}
              >
                  {isConversationActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M7 7h10v10H7z"></path></svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line>
                      </svg>
                  )}
              </button>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default App;