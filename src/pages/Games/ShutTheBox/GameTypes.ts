export type PinState = 'OPEN' | 'SELECTED' | 'SHUT';
export type GamePhase = 'ROLL' | 'SELECT' | 'GAME_OVER';
export type GameMode = 'SOLO' | 'VS_AI';
export type Turn = 'PLAYER' | 'AI';
export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

export const PIN_SPACING = 1.25;
export const BOX_WIDTH = 15;
export const BOX_DEPTH = 9;

export const BOX_OFFSET_X = 18; // Distance between player and AI box