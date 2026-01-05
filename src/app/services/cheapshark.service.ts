import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CheapSharkStoreInterface } from '../model/cheapshark/cheapshark-store.interface';
import { CheapSharkPriceInterface } from '../model/cheapshark/cheapshark-price.interface';
import { CheapSharkDealInterface } from '../model/cheapshark/cheapshark-deal.interface';

@Injectable({
  providedIn: 'root'
})
export class CheapsharkService {

  APP_CHEAPSHARK_LOCAL_STORAGE_STORES = 'APP_CHEAPSHARK_LOCAL_STORAGE_STORES';
  stores = new BehaviorSubject<CheapSharkStoreInterface[]>([]);

  constructor(
    private readonly http: HttpClient
  ) {
    this.loadStores();
  }

  getGamePrices(gameName: string): Observable<CheapSharkPriceInterface[]> {
    return this.http.get<CheapSharkPriceInterface[]>(`https://www.cheapshark.com/api/1.0/games?title=${gameName}&limit=100`);
  }

  getGameCheapestDealData(gamePrice: CheapSharkPriceInterface): Observable<CheapSharkPriceInterface> {
    return this.http.get<CheapSharkDealInterface>(`https://www.cheapshark.com/api/1.0/deals?id=${gamePrice.cheapestDealID}`).pipe(map((_gameDeals) => {
      gamePrice.deals = _gameDeals;
      const stores: CheapSharkStoreInterface[] | undefined = this.stores.getValue();
      if (stores) {
        const dealStore: CheapSharkStoreInterface | undefined = stores.find((_store) => {
          return _store.storeID===_gameDeals.gameInfo.storeID;
        });
        if (dealStore) {
          gamePrice.deals.gameInfo.storeName = dealStore.storeName;
        }
      }
      
      if (gamePrice.deals && gamePrice.deals?.cheaperStores) {
        gamePrice.deals.cheaperStores.forEach((_cheaperStore) => {
          const store: CheapSharkStoreInterface | undefined = this.stores.getValue().find((_store) => {
            return _store.storeID===_cheaperStore.storeID;
          });
          if (store) {
            _cheaperStore.storeName = store.storeName;
          }
        });
      }
      return gamePrice;
    }));
  }

  private getStore(storeId: string): CheapSharkStoreInterface | undefined {
    const store: CheapSharkStoreInterface | undefined = this.stores.getValue().find((_store) => {
      return _store.storeID===storeId;
    });
    return store;
  }

  loadStores() {
    const storedStores = localStorage.getItem(this.APP_CHEAPSHARK_LOCAL_STORAGE_STORES);
    if (storedStores) {
      this.stores.next(JSON.parse(storedStores) as CheapSharkStoreInterface[]);
      console.log('CheapsharkService.loadStores() [localStorage]', this.stores.getValue());
    } else {
      this.http.get<CheapSharkStoreInterface[]>(`https://www.cheapshark.com/api/1.0/stores`).subscribe((_stores) => {
        console.log('CheapsharkService.loadStores()', _stores);
        this.stores.next(_stores);
        localStorage.setItem(this.APP_CHEAPSHARK_LOCAL_STORAGE_STORES, JSON.stringify(this.stores.getValue()));
      });
    }
    
  }
}
