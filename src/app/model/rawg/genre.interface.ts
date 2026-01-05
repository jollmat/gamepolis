import { GameInterface } from "./game.interface";

export interface GenreInterface {
    id: number,
    name: string,
    slug: string,
    image_background?: string,
    games_count?: number,
    games?: GameInterface[]
}