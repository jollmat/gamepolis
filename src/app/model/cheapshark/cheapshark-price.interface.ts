import { CheapSharkDealInterface } from "./cheapshark-deal.interface";

export interface CheapSharkPriceInterface {
    cheapest: string,
    cheapestDealID: string,
    external: string,
    gameID: string,
    internalName: string,
    steamAppID: string,
    thumb: string,
    deals?: CheapSharkDealInterface
}