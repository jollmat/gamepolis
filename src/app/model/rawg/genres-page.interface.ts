import { GenreInterface } from "./genre.interface";

export interface GenresPageInterface {
    count: number,
    next?: string,
    previous?: string,
    results?: GenreInterface[]
}