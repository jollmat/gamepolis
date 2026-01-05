export interface PlatformInterface {
    id: number,
    name: string,
    slug: string,
    games_count?: number,
    image_background?: string,
    image?: string,
    year_start?: number,
    year_end?: number
}