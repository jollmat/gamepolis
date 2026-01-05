import { GenreInterface } from "./genre.interface";
import { PlatformInterface } from "./platform.interface";

export interface GameInterface {
    id: number,
    slug: string,
    name: string,
    released: string,
    background_image?: string,
    short_screenshots?: {image: string}[],
    platforms: {platform: PlatformInterface, released_at?: string, requirements?: {minimum: string, recommended: string}}[],
    parent_platforms?: {platform: PlatformInterface, released_at?: string, requirements?: {minimum: string, recommended: string}}[],
    genres?: GenreInterface[],
    rating: number,
    rating_top: number,
    ratings: {id: number, title: string, count: number, percent: number}[]
}