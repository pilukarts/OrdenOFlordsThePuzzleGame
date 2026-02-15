/**
 * ClusterDetector.ts
 * Flood-fill algorithm to detect clusters of matching gems on rectangular grid
 */

import type { GridCoord } from './RectGrid';
import { getRectNeighbors, isValidGrid } from './RectGrid';
import Phaser from 'phaser';

export interface Cluster {
    gems: Array<{ col: number; row: number; container: Phaser.GameObjects.Container }>;
    color: string;
    size: number;
}

/**
 * Find all clusters of 3 or more matching gems on rectangular grid
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
                    size: cluster.length
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
