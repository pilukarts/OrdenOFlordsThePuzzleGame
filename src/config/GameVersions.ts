export const GAME_VERSIONS = {
    current: 'ignis',
    
    versions: {
        ignis: {
            title: 'ORDEN OF LORDS',
            subtitle: 'IGNIS THE BRAVE',
            mainLord: 'lord_ignis',
            color: 0xFF4500,
            element: 'fire'
        },
        ventus: {
            title: 'ORDEN OF LORDS',
            subtitle: 'VENTUS THE SWIFT',
            mainLord: 'lord_ventus',
            color: 0x00CED1,
            element: 'wind'
        },
        aqua: {
            title: 'ORDEN OF LORDS',
            subtitle: 'AQUA THE WISE',
            mainLord: 'lord_aqua',
            color: 0x4169E1,
            element: 'water'
        },
        terra: {
            title: 'ORDEN OF LORDS',
            subtitle: 'TERRA THE STRONG',
            mainLord: 'lord_terra',
            color: 0x8B4513,
            element: 'earth'
        }
    },
    
    getAllLords() {
        return Object.values(this.versions).map(v => v.mainLord);
    },
    
    getCurrentVersion() {
        return this.versions[this.current as keyof typeof this.versions];
    }
};
