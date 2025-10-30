import React from 'react';
import { ConversationState } from '../types';

interface StatusIndicatorProps {
  state: ConversationState;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  const getStatusContent = () => {
    switch (state) {
      case ConversationState.CONNECTING:
        return {
          text: 'Connecting...',
          color: 'text-yellow-300',
          icon: <SpinnerIcon />,
        };
      case ConversationState.CONNECTED:
        return {
          text: 'Listening...',
          color: 'text-green-300',
          icon: <MicIcon />,
        };
      case ConversationState.ERROR:
        return {
          text: 'Error',
          color: 'text-red-400',
          icon: <AlertTriangleIcon />,
        };
      case ConversationState.IDLE:
      default:
        return {
          text: 'Ready',
          color: 'text-gray-400',
          icon: <PowerIcon />,
        };
    }
  };

  const { text, color, icon } = getStatusContent();

  return (
    <div className={`flex items-center justify-center space-x-2 p-2 rounded-full bg-black/30 text-sm ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
);

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" x2="12" y1="9" y2="13"></line>
    <line x1="12" x2="12.01" y1="17" y2="17"></line>
  </svg>
);

const PowerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path>
    </svg>
);


export default StatusIndicator;
