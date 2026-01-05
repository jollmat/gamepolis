import { GameInterface } from "./game.interface";

export interface GamesPageInterface {
    count: number,
    user_platforms: boolean,
    next?: string,
    previous?: string,
    results?: GameInterface[],
    pageNumber?: number
}