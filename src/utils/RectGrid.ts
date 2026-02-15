/**
 * RectGrid.ts
 * Rectangular grid utility functions for vertical column system
 */

import { GAME_CONFIG } from '../config/GameConfig';

export interface GridCoord {
    col: number;
    row: number;
}

export interface PixelCoord {
    x: number;
    y: number;
}

/**
 * Convert grid coordinates to pixel coordinates
 * For vertical columns: each column has fixed x, rows stack vertically
 */
export function gridToPixel(col: number, row: number, gridStartX: number, gridStartY: number): PixelCoord {
    const x = gridStartX + col * GAME_CONFIG.columnWidth + GAME_CONFIG.columnWidth / 2;
    const y = gridStartY + row * (GAME_CONFIG.gemSize + GAME_CONFIG.spacing);
    
    return { x, y };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(x: number, y: number, gridStartX: number, gridStartY: number): GridCoord {
    const col = Math.floor((x - gridStartX) / GAME_CONFIG.columnWidth);
    const row = Math.floor((y - gridStartY) / (GAME_CONFIG.gemSize + GAME_CONFIG.spacing));
    
    return { 
        col: Math.max(0, Math.min(col, GAME_CONFIG.columns - 1)),
        row: Math.max(0, Math.min(row, GAME_CONFIG.maxRows - 1))
    };
}

/**
 * Get all valid neighbor coordinates for a rectangular grid cell (4-directional)
 */
export function getRectNeighbors(col: number, row: number): GridCoord[] {
    const neighbors: GridCoord[] = [];
    
    // Up, Down, Left, Right
    const offsets = [
        [0, -1],  // Up
        [0, 1],   // Down
        [-1, 0],  // Left
        [1, 0]    // Right
    ];
    
    for (const [dc, dr] of offsets) {
        const newCol = col + dc;
        const newRow = row + dr;
        
        if (isValidGrid(newCol, newRow)) {
            neighbors.push({ col: newCol, row: newRow });
        }
    }
    
    return neighbors;
}

/**
 * Check if grid coordinates are valid within grid bounds
 */
export function isValidGrid(col: number, row: number): boolean {
    return col >= 0 && col < GAME_CONFIG.columns && 
           row >= 0 && row < GAME_CONFIG.maxRows;
}

/**
 * Get Manhattan distance between two grid cells
 */
export function gridDistance(col1: number, row1: number, col2: number, row2: number): number {
    return Math.abs(col2 - col1) + Math.abs(row2 - row1);
}

/**
 * Get all grid cells within a certain radius (Manhattan distance)
 */
export function getCellsInRadius(col: number, row: number, radius: number): GridCoord[] {
    const cells: GridCoord[] = [];
    
    for (let c = 0; c < GAME_CONFIG.columns; c++) {
        for (let r = 0; r < GAME_CONFIG.maxRows; r++) {
            if (gridDistance(col, row, c, r) <= radius) {
                cells.push({ col: c, row: r });
            }
        }
    }
    
    return cells;
}

/**
 * Get column for a given x coordinate
 */
export function getColumnFromX(x: number, gridStartX: number): number {
    const col = Math.floor((x - gridStartX) / GAME_CONFIG.columnWidth);
    return Math.max(0, Math.min(col, GAME_CONFIG.columns - 1));
}

/**
 * Get the bottom-most available row in a column
 * Returns -1 if column is full
 */
export function getAvailableRowInColumn(
    grid: (Phaser.GameObjects.Container | null)[][],
    col: number
): number {
    // Start from bottom and find first empty slot
    for (let row = GAME_CONFIG.maxRows - 1; row >= 0; row--) {
        if (grid[row] && grid[row][col] === null) {
            return row;
        }
    }
    return -1; // Column is full
}
