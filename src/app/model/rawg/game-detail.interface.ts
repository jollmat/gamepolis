import { GameDeveloperInterface } from "./game-developer.interface";
import { GameTagInterface } from "./game-tag.interface";
import { GenreInterface } from "./genre.interface";
import { PlatformInterface } from "./platform.interface";

export interface GameDetailInterface {
    id: number,
    name: string,
    slug: string,
    background_image: string,
    background_image_additional: string,
    clip: any,
    description: string,
    description_raw: string,
    developers: GameDeveloperInterface[],
    genres: GenreInterface[],
    parentPlatforms: {platform: PlatformInterface}[],
    platforms: {platform: PlatformInterface, released_at?: string, requirements?: {minimum: string, recommended: string}}[],
    parent_platforms: {platform: PlatformInterface, released_at?: string, requirements?: {minimum: string, recommended: string}}[],
    rating: number,
    rating_top: number,
    ratings: {id: number, title: string, count: number, percent: number}[],
    released: string,
    metacritic_url?: string,
    tags: GameTagInterface[],
    website: string,
    screenshots_count: number,
    movies_count: number
}