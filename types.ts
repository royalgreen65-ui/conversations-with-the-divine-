export enum ConversationState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface TranscriptEntry {
  speaker: 'You' | 'God';
  text: string;
}
