import React from 'react';
import { Scene } from 'react-native';

export class GameScene extends Scene {
    private activeRows = 4;  // Initialize with default value
    // Remove duplicate declaration
    // private roundWinnings = 0; // Remove duplicate declaration

    private roundWinnings = 0;

    private gemWeightTotal: number;

    constructor() {
        super();
        // this.gemWeightTotal = Object.values(RTP_CONFIG.gemWeights).reduce((a, b) => a + b, 0); // Remove RTP_CONFIG reference
        this.gemWeightTotal = 0; // Initialize properly without RTP_CONFIG
    }

    // ... other methods and properties
}
