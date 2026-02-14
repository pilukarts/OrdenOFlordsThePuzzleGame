/**
 * HexGrid.ts
 * Hexagonal grid utility functions for coordinate conversion and neighbor detection
 */

import { GAME_CONFIG } from '../config/GameConfig';

export interface HexCoord {
    col: number;
    row: number;
}

export interface PixelCoord {
    x: number;
    y: number;
}

/**
 * Convert hex grid coordinates to pixel coordinates
 */
export function hexToPixel(col: number, row: number): PixelCoord {
    const hexWidth = GAME_CONFIG.hexWidth;
    const hexHeight = GAME_CONFIG.hexHeight;
    
    const x = col * hexWidth + (row % 2) * (hexWidth / 2);
    const y = row * hexHeight * 0.75;
    
    return { x, y };
}

/**
 * Convert pixel coordinates to hex grid coordinates (approximate)
 */
export function pixelToHex(x: number, y: number): HexCoord {
    const hexWidth = GAME_CONFIG.hexWidth;
    const hexHeight = GAME_CONFIG.hexHeight;
    
    const row = Math.round(y / (hexHeight * 0.75));
    const col = Math.round((x - (row % 2) * (hexWidth / 2)) / hexWidth);
    
    return { col, row };
}

/**
 * Get all valid neighbor coordinates for a hex cell
 */
export function getHexNeighbors(col: number, row: number): HexCoord[] {
    const neighbors: HexCoord[] = [];
    const isEvenRow = row % 2 === 0;
    
    // Define neighbor offsets based on row parity
    const offsets = isEvenRow ? [
        [-1, -1], [0, -1],  // Top-left, Top-right
        [-1, 0], [1, 0],    // Left, Right
        [-1, 1], [0, 1]     // Bottom-left, Bottom-right
    ] : [
        [0, -1], [1, -1],   // Top-left, Top-right
        [-1, 0], [1, 0],    // Left, Right
        [0, 1], [1, 1]      // Bottom-left, Bottom-right
    ];
    
    for (const [dc, dr] of offsets) {
        const newCol = col + dc;
        const newRow = row + dr;
        
        if (isValidHex(newCol, newRow)) {
            neighbors.push({ col: newCol, row: newRow });
        }
    }
    
    return neighbors;
}

/**
 * Check if hex coordinates are valid within grid bounds
 */
export function isValidHex(col: number, row: number): boolean {
    return col >= 0 && col < GAME_CONFIG.hexCols && 
           row >= 0 && row < GAME_CONFIG.hexRows;
}

/**
 * Get distance between two hex cells (Manhattan distance in hex space)
 */
export function hexDistance(col1: number, row1: number, col2: number, row2: number): number {
    const dx = Math.abs(col2 - col1);
    const dy = Math.abs(row2 - row1);
    const dz = Math.abs((col1 - row1) - (col2 - row2));
    
    return Math.max(dx, dy, dz);
}

/**
 * Get all hex cells within a certain radius
 */
export function getHexesInRadius(col: number, row: number, radius: number): HexCoord[] {
    const hexes: HexCoord[] = [];
    
    for (let c = 0; c < GAME_CONFIG.hexCols; c++) {
        for (let r = 0; r < GAME_CONFIG.hexRows; r++) {
            if (hexDistance(col, row, c, r) <= radius) {
                hexes.push({ col: c, row: r });
            }
        }
    }
    
    return hexes;
}
