import React from 'react';
import { TranscriptEntry } from '../types';

interface TranscriptionDisplayProps {
  history: TranscriptEntry[];
  currentUserTranscript: string;
  currentModelTranscript: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  history,
  currentUserTranscript,
  currentModelTranscript,
}) => {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col space-y-4 p-4 text-white overflow-y-auto">
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
    </div>
  );
};

export default TranscriptionDisplay;
