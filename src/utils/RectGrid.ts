/**
 * RectGrid.ts
 * Rectangular grid utility functions for vertical slot system
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
 * Row 0 is at BOTTOM, higher rows go UP
 */
export function gridToPixel(col: number, row: number, gridStartX: number, gridStartY: number): PixelCoord {
    const x = gridStartX + col * (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing) + GAME_CONFIG.cellWidth / 2;
    // Invert row: row 0 should be at bottom
    const totalRows = GAME_CONFIG.maxRows;
    const invertedRow = totalRows - 1 - row;
    const y = gridStartY + invertedRow * (GAME_CONFIG.cellHeight + GAME_CONFIG.spacing) + GAME_CONFIG.cellHeight / 2;
    
    return { x, y };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(x: number, y: number, gridStartX: number, gridStartY: number): GridCoord {
    const col = Math.floor((x - gridStartX) / (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing));
    const relativeY = y - gridStartY;
    const cellTotalHeight = GAME_CONFIG.cellHeight + GAME_CONFIG.spacing;
    const invertedRow = Math.floor(relativeY / cellTotalHeight);
    // Convert back to bottom-up indexing
    const row = GAME_CONFIG.maxRows - 1 - invertedRow;
    
    return { 
        col: Math.max(0, Math.min(col, GAME_CONFIG.columns - 1)),
        row: Math.max(0, Math.min(row, GAME_CONFIG.maxRows - 1))
    };
}

/**
 * Get column center X coordinate
 */
export function getColumnCenterX(col: number, gridStartX: number): number {
    return gridStartX + col * (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing) + GAME_CONFIG.cellWidth / 2;
}

/**
 * Get row center Y coordinate (row 0 is at bottom)
 */
export function getRowCenterY(row: number, gridStartY: number): number {
    const totalRows = GAME_CONFIG.maxRows;
    const invertedRow = totalRows - 1 - row;
    return gridStartY + invertedRow * (GAME_CONFIG.cellHeight + GAME_CONFIG.spacing) + GAME_CONFIG.cellHeight / 2;
}

/**
 * Get column index from X coordinate
 */
export function getColumnFromX(x: number, gridStartX: number): number {
    const relativeX = x - gridStartX;
    const col = Math.floor(relativeX / (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing));
    return Math.max(0, Math.min(col, GAME_CONFIG.columns - 1));
}

/**
 * Find the lowest empty row in a column (bottom-up stacking)
 * Returns -1 if column is full
 */
export function findLowestEmptyRow(
    grid: (Phaser.GameObjects.Container | null)[][],
    col: number
): number {
    // Start from bottom (row 0 is base)
    for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
        if (grid[row] && grid[row][col] === null) {
            return row;
        }
    }
    return -1; // Column full
}

/**
 * Check if can slide left from current column
 */
export function canSlideLeft(
    grid: (Phaser.GameObjects.Container | null)[][],
    currentCol: number
): boolean {
    if (currentCol <= 0) return false;
    const leftCol = currentCol - 1;
    return findLowestEmptyRow(grid, leftCol) !== -1;
}

/**
 * Check if can slide right from current column
 */
export function canSlideRight(
    grid: (Phaser.GameObjects.Container | null)[][],
    currentCol: number
): boolean {
    if (currentCol >= GAME_CONFIG.columns - 1) return false;
    const rightCol = currentCol + 1;
    return findLowestEmptyRow(grid, rightCol) !== -1;
}

/**
 * Find nearest available column from a given column
 * Returns -1 if no columns available
 */
export function findNearestAvailableColumn(
    grid: (Phaser.GameObjects.Container | null)[][],
    fromColumn: number
): number {
    let searchRadius = 1;
    
    while (searchRadius < GAME_CONFIG.columns) {
        // Check left
        const leftCol = fromColumn - searchRadius;
        if (leftCol >= 0 && findLowestEmptyRow(grid, leftCol) !== -1) {
            return leftCol;
        }
        
        // Check right
        const rightCol = fromColumn + searchRadius;
        if (rightCol < GAME_CONFIG.columns && findLowestEmptyRow(grid, rightCol) !== -1) {
            return rightCol;
        }
        
        searchRadius++;
    }
    
    return -1; // No available columns
}

/**
 * Get all valid neighbor coordinates for a rectangular grid cell (4-directional)
 */
export function getRectNeighbors(col: number, row: number): GridCoord[] {
    const neighbors: GridCoord[] = [];
    
    // Up, Down, Left, Right
    const offsets = [
        [0, 1],   // Up (higher row number)
        [0, -1],  // Down (lower row number)
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
 * Get the bottom-most available row in a column (DEPRECATED: use findLowestEmptyRow)
 * Returns -1 if column is full
 */
export function getAvailableRowInColumn(
    grid: (Phaser.GameObjects.Container | null)[][],
    col: number
): number {
    return findLowestEmptyRow(grid, col);
}
