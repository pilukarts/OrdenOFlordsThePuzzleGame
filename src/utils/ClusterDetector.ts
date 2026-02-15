/**
 * ClusterDetector.ts
 * Match detection for vertical slot system - supports horizontal, vertical, and cluster matching
 */

import type { GridCoord } from './RectGrid';
import { getRectNeighbors, isValidGrid } from './RectGrid';
import { GAME_CONFIG } from '../config/GameConfig';
import Phaser from 'phaser';

export interface Cluster {
    gems: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }>;
    color: string;
    size: number;
    type?: 'horizontal' | 'vertical' | 'cluster';
}

/**
 * Find all horizontal matches in a specific row
 * Detects 3+ consecutive gems of same color
 */
export function findHorizontalMatches(
    grid: (Phaser.GameObjects.Container | null)[][],
    row: number
): Cluster[] {
    const matches: Cluster[] = [];
    let currentMatch: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> = [];
    let lastType: string | null = null;
    
    for (let col = 0; col < GAME_CONFIG.columns; col++) {
        const gem = grid[row]?.[col];
        
        if (gem === null || !gem) {
            // Empty space breaks combo
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'horizontal'
                });
            }
            currentMatch = [];
            lastType = null;
            continue;
        }
        
        const gemType = gem.getData('color');
        
        // Skip black gems
        if (gemType === 'black') {
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'horizontal'
                });
            }
            currentMatch = [];
            lastType = null;
            continue;
        }
        
        // Wilds match anything
        if (gemType === 'wild' || lastType === 'wild' || gemType === lastType) {
            currentMatch.push({ col, row, container: gem });
            if (gemType !== 'wild') lastType = gemType;
        } else {
            // Different type
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'horizontal'
                });
            }
            currentMatch = [{ col, row, container: gem }];
            lastType = gemType;
        }
    }
    
    // Check last combo
    if (currentMatch.length >= 3) {
        matches.push({
            gems: [...currentMatch],
            color: lastType || 'unknown',
            size: currentMatch.length,
            type: 'horizontal'
        });
    }
    
    return matches;
}

/**
 * Find all vertical matches in a specific column
 * Detects 3+ consecutive gems of same color
 */
export function findVerticalMatches(
    grid: (Phaser.GameObjects.Container | null)[][],
    col: number
): Cluster[] {
    const matches: Cluster[] = [];
    let currentMatch: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> = [];
    let lastType: string | null = null;
    
    for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
        const gem = grid[row]?.[col];
        
        if (gem === null || !gem) {
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'vertical'
                });
            }
            currentMatch = [];
            lastType = null;
            continue;
        }
        
        const gemType = gem.getData('color');
        
        // Skip black gems
        if (gemType === 'black') {
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'vertical'
                });
            }
            currentMatch = [];
            lastType = null;
            continue;
        }
        
        if (gemType === 'wild' || lastType === 'wild' || gemType === lastType) {
            currentMatch.push({ col, row, container: gem });
            if (gemType !== 'wild') lastType = gemType;
        } else {
            if (currentMatch.length >= 3) {
                matches.push({
                    gems: [...currentMatch],
                    color: lastType || 'unknown',
                    size: currentMatch.length,
                    type: 'vertical'
                });
            }
            currentMatch = [{ col, row, container: gem }];
            lastType = gemType;
        }
    }
    
    if (currentMatch.length >= 3) {
        matches.push({
            gems: [...currentMatch],
            color: lastType || 'unknown',
            size: currentMatch.length,
            type: 'vertical'
        });
    }
    
    return matches;
}

/**
 * Detect all matches (horizontal and vertical) in the grid
 */
export function detectAllMatches(
    grid: (Phaser.GameObjects.Container | null)[][]
): Cluster[] {
    const allMatches: Cluster[] = [];
    
    // Check horizontal matches in ALL rows
    for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
        const horizontalMatches = findHorizontalMatches(grid, row);
        allMatches.push(...horizontalMatches);
    }
    
    // Check vertical matches in ALL columns
    for (let col = 0; col < GAME_CONFIG.columns; col++) {
        const verticalMatches = findVerticalMatches(grid, col);
        allMatches.push(...verticalMatches);
    }
    
    // Remove duplicates (gems that are part of multiple matches)
    // Keep all matches for now, duplicates will be handled during explosion
    
    return allMatches;
}

/**
 * Find all clusters of 3 or more matching gems on rectangular grid (LEGACY - for flood fill matching)
 */
export function findClusters(
    grid: (Phaser.GameObjects.Container | null)[][]
): Cluster[] {
    const visited = new Set<string>();
    const clusters: Cluster[] = [];
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const gem = grid[row][col];
            if (!gem) continue;
            
            const key = `${col},${row}`;
            if (visited.has(key)) continue;
            
            const color = gem.getData('color');
            if (!color || color === 'black') continue; // Skip black gems
            
            const cluster = floodFill(grid, col, row, color, visited);
            
            if (cluster.length >= 3) {
                clusters.push({
                    gems: cluster,
                    color,
                    size: cluster.length,
                    type: 'cluster'
                });
            }
        }
    }
    
    return clusters;
}

/**
 * Flood fill algorithm to find connected gems of same color on rectangular grid
 * Supports Wild (W) gems that match any color
 */
function floodFill(
    grid: (Phaser.GameObjects.Container | null)[][],
    startCol: number,
    startRow: number,
    targetColor: string,
    visited: Set<string>
): Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> {
    const cluster: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> = [];
    const queue: GridCoord[] = [{ col: startCol, row: startRow }];
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        
        const key = `${current.col},${current.row}`;
        
        if (visited.has(key)) continue;
        if (!isValidGrid(current.col, current.row)) continue;
        
        const gem = grid[current.row][current.col];
        if (!gem) continue;
        
        const gemColor = gem.getData('color');
        
        // Wild gems match anything, or check for color match
        if (gemColor === 'wild' || targetColor === 'wild' || gemColor === targetColor) {
            visited.add(key);
            cluster.push({ col: current.col, row: current.row, container: gem });
            
            // Check 4 neighbors (up, down, left, right)
            const neighbors = getRectNeighbors(current.col, current.row);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.col},${neighbor.row}`;
                if (!visited.has(neighborKey)) {
                    queue.push(neighbor);
                }
            }
        }
    }
    
    return cluster;
}

/**
 * Check if a Lord gem touches any mascot of matching color
 */
export function checkLordPower(
    grid: (Phaser.GameObjects.Container | null)[][],
    lordCol: number,
    lordRow: number
): { triggered: boolean; matchingColor: string | null } {
    const lordGem = grid[lordRow][lordCol];
    if (!lordGem) return { triggered: false, matchingColor: null };
    
    const lordType = lordGem.getData('lordType');
    if (!lordType) return { triggered: false, matchingColor: null };
    
    const matchColor = lordGem.getData('color');
    const neighbors = getRectNeighbors(lordCol, lordRow);
    
    for (const neighbor of neighbors) {
        const neighborGem = grid[neighbor.row][neighbor.col];
        if (!neighborGem) continue;
        
        const neighborColor = neighborGem.getData('color');
        const neighborType = neighborGem.getData('gemType');
        
        if (neighborColor === matchColor && neighborType?.startsWith('mascot_')) {
            return { triggered: true, matchingColor: matchColor };
        }
    }
    
    return { triggered: false, matchingColor: null };
}

/**
 * Find all gems of a specific color (for Lord power or color bomb)
 */
export function findAllGemsOfColor(
    grid: (Phaser.GameObjects.Container | null)[][],
    color: string
): Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> {
    const gems: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> = [];
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const gem = grid[row][col];
            if (!gem) continue;
            
            const gemColor = gem.getData('color');
            if (gemColor === color) {
                gems.push({ col, row, container: gem });
            }
        }
    }
    
    return gems;
}

/**
 * Get gems in bomb explosion pattern
 */
export function getBombExplosionGems(
    grid: (Phaser.GameObjects.Container | null)[][],
    col: number,
    row: number,
    bombType: 'small' | 'medium' | 'large' | 'line' | 'color'
): Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> {
    const gems: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }> = [];
    
    if (bombType === 'color') {
        // Find a random color and explode all of that color
        const colors = ['red', 'green', 'blue', 'yellow'];
        const targetColor = Phaser.Math.RND.pick(colors);
        return findAllGemsOfColor(grid, targetColor);
    }
    
    if (bombType === 'line') {
        // Explode entire row or column (randomly choose)
        const isRow = Math.random() > 0.5;
        
        if (isRow) {
            for (let c = 0; c < grid[row].length; c++) {
                const gem = grid[row][c];
                if (gem) gems.push({ col: c, row, container: gem });
            }
        } else {
            for (let r = 0; r < grid.length; r++) {
                const gem = grid[r][col];
                if (gem) gems.push({ col, row: r, container: gem });
            }
        }
        
        return gems;
    }
    
    // Area bombs (small, medium, large)
    const radiusMap = {
        small: 1,
        medium: 2,
        large: 3
    };
    
    const radius = radiusMap[bombType];
    
    for (let r = Math.max(0, row - radius); r <= Math.min(grid.length - 1, row + radius); r++) {
        for (let c = Math.max(0, col - radius); c <= Math.min(grid[r].length - 1, col + radius); c++) {
            const gem = grid[r][c];
            if (gem) gems.push({ col: c, row: r, container: gem });
        }
    }
    
    return gems;
}
