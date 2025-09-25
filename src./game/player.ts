// Definición de Lords jugables y utilidad de selección

export type Lord = {
    name: string;
    image: string;
    color: string;
    season: string;
    region: string;
};

export const LORDS: Lord[] = [
    { name: "Lord Ignis", image: "ignis.png", color: "#e25822", season: "Summer", region: "South" },
    { name: "Lady Aqua", image: "aqua.png", color: "#3498db", season: "Winter", region: "North" },
    { name: "Sir Terra", image: "terra.png", color: "#27ae60", season: "Autumn", region: "West" },
    { name: "Dama Ventus", image: "ventus.png", color: "#f1c40f", season: "Spring", region: "East" }
];

export function getLordByName(name: string): Lord | undefined {
    return LORDS.find(lord => lord.name === name);
}
