import { Lord } from "./player";

// Renderiza el avatar y datos del Lord junto al tablero
export function renderLordAvatar(
    lord: Lord,
    position: { x: number; y: number },
    ctx: CanvasRenderingContext2D
) {
    const img = new window.Image();
    img.src = `/assets/lords/${lord.image}`;
    img.onload = () => {
        ctx.drawImage(img, position.x, position.y, 128, 128);
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = lord.color;
        ctx.fillText(lord.name, position.x, position.y + 140);
        ctx.fillText(`${lord.season} (${lord.region})`, position.x, position.y + 160);
    };
}
