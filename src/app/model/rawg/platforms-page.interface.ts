import { PlatformInterface } from "./platform.interface";

export interface PlatformsPageInterface {
    count: number,
    next?: string,
    previous?: string,
    results?: PlatformInterface[],
    pageNumber?: number
}