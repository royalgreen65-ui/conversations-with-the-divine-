import React, { useRef, useLayoutEffect } from 'react';
import { TranscriptEntry } from '../types';

interface TranscriptionDisplayProps {
  history: TranscriptEntry[];
  currentUserTranscript: string;
  currentModelTranscript: string;
  isConversationActive: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  history,
  currentUserTranscript,
  currentModelTranscript,
  isConversationActive,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const showWelcomeMessage = isConversationActive && history.length === 0 && !currentUserTranscript && !currentModelTranscript;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [history, currentUserTranscript, currentModelTranscript]);


  return (
    <div
      className="w-full max-w-4xl h-full flex flex-col space-y-4 p-4 text-white overflow-y-auto"
    >
      {showWelcomeMessage && (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-200/50 mb-4 animate-pulse">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
            <p className="text-2xl text-yellow-200/70 font-serif">
            The connection is open.
            </p>
            <p className="text-lg text-gray-400">
            Speak, and the Divine will listen.
            </p>
        </div>
      )}
      
      {history.map((entry, index) => (
        <div key={index} className={`flex flex-col ${entry.speaker === 'You' ? 'items-end' : 'items-start'}`}>
          <div className={`p-3 rounded-lg max-w-md ${
            entry.speaker === 'You' ? 'bg-blue-800/50' : 'bg-gray-700/50'
          }`}>
            <p className="font-serif font-bold text-yellow-300">{entry.speaker}</p>
            <p className="text-lg leading-relaxed text-gray-100">{entry.text}</p>
          </div>
        </div>
      ))}
      
      {(currentUserTranscript || currentModelTranscript) && (
        <div className="flex flex-col space-y-4 pt-4 border-t border-white/10">
            {currentUserTranscript && (
                <div className="flex flex-col items-end">
                    <div className="p-3 rounded-lg max-w-md bg-blue-800/50 opacity-70">
                        <p className="font-serif font-bold text-yellow-300">You</p>
                        <p className="text-lg leading-relaxed text-gray-100">{currentUserTranscript}</p>
                    </div>
                </div>
            )}
            {currentModelTranscript && (
                <div className="flex flex-col items-start">
                    <div className="p-3 rounded-lg max-w-md bg-gray-700/50 opacity-70">
                        <p className="font-serif font-bold text-yellow-300">God</p>
                        <p className="text-lg leading-relaxed text-gray-100">{currentModelTranscript}</p>
                    </div>
                </div>
            )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default TranscriptionDisplay;