export interface CheapSharkDealInterface {
    gameInfo: {
        storeID: string,
        storeName: string,
        gameID: string,
        name: string,
        steamAppID: string,
        salePrice: string,
        retailPrice: string,
        steamRatingText: string,
        steamRatingPercent: string,
        steamRatingCount: string,
        metacriticScore: string,
        metacriticLink: string,
        releaseDate: Date,
        publisher: string,
        steamworks: string,
        thumb: string
    },
    cheaperStores: {
        dealID: string,
        storeID: string,
        salePrice: string,
        retailPrice: string,
        storeName?: string
    }[],
    cheapestPrice: {
        price?: string,
        date?: Date
    }
}