import { Lord } from "./player";
import { renderLordAvatar } from "./render";

// Renderiza el tablero y el Lord seleccionado
export function renderPlayerBoard(
    ctx: CanvasRenderingContext2D,
    lord: Lord,
    boardData: any,
    boardPosition: { x: number; y: number },
    avatarPosition: { x: number; y: number }
) {
    renderLordAvatar(lord, avatarPosition, ctx);

    // Aquí iría la lógica de renderizado del tablero
    // Por ejemplo: drawBoard(ctx, boardData, boardPosition);
}
