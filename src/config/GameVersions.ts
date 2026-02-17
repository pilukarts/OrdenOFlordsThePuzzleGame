export const GAME_VERSIONS = {
    current: 'ignis',
    
    versions: {
        ignis: {
            title: 'ORDEN OF LORDS',
            subtitle: 'IGNIS THE BRAVE',
            mainLord: 'lord_ignis',
            color: 0xFF4500,
            element: 'fire',
            glowColor: 0xFFD700
        },
        ventus: {
            title: 'ORDEN OF LORDS',
            subtitle: 'VENTUS THE SWIFT',
            mainLord: 'lord_ventus',
            color: 0x00CED1,
            element: 'wind',
            glowColor: 0x87CEEB
        },
        aqua: {
            title: 'ORDEN OF LORDS',
            subtitle: 'AQUA THE WISE',
            mainLord: 'lord_aqua',
            color: 0x4169E1,
            element: 'water',
            glowColor: 0x1E90FF
        },
        terra: {
            title: 'ORDEN OF LORDS',
            subtitle: 'TERRA THE STRONG',
            mainLord: 'lord_terra',
            color: 0x8B4513,
            element: 'earth',
            glowColor: 0xDEB887
        }
    },
    
    getAllLords() {
        return Object.keys(this.versions);
    },
    
    getCurrentVersion() {
        return this.versions[this.current as keyof typeof this.versions];
    },
    
    getLordData(lordKey: string) {
        return this.versions[lordKey as keyof typeof this.versions];
    }
};
