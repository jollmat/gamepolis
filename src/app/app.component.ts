import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RawgService } from './services/rawg.service';
import { Subscription } from 'rxjs';
import { PlatformInterface } from './model/rawg/platform.interface';
import { PlatformsPageInterface } from './model/rawg/platforms-page.interface';
import { CommonModule } from '@angular/common';
import { GameInterface } from './model/rawg/game.interface';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { GamesPageInterface } from './model/rawg/games-page.interface';
import { GameDetailInterface } from './model/rawg/game-detail.interface';
import { ScreenshotSliderComponent } from './components/screenshot-slider/screenshot-slider.component';
import { GameMoviesInterface } from './model/rawg/game-movies.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { GenresPageInterface } from './model/rawg/genres-page.interface';
import { GenreInterface } from './model/rawg/genre.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheapsharkService } from './services/cheapshark.service';
import { CheapSharkStoreInterface } from './model/cheapshark/cheapshark-store.interface';
import { CheapSharkPriceInterface } from './model/cheapshark/cheapshark-price.interface';
import { GameDeveloperInterface } from './model/rawg/game-developer.interface';
import { DeviceOrientation, DeviceType } from './types/devices';
import { DeviceService } from './services/device.service';
import { MenuInterface } from './model/menu.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatInputModule, MatTooltipModule, ScreenshotSliderComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Gamepolis';

  deviceType: DeviceType = 'DESKTOP';
  deviceOrientation: DeviceOrientation = 'HORIZONTAL';

  useStoredSamples = false;

  searchControl = new FormControl('');
  searching = signal(false);

  menus: MenuInterface[] = [
    {id:'top-rated-games', label:'Top rated games', iconClassOn: 'fas fa-trophy', iconClassOff: 'fas fa-trophy'},
    {id:'upcoming-releases', label:'Upcoming game releases', iconClassOn: 'fas fa-hourglass-start', iconClassOff: 'fas fa-hourglass-start'},
    {id:'last-month-games', label:'Last month games', iconClassOn: 'fas fa-calendar-day', iconClassOff: 'fas fa-calendar-day'},
    {id:'last-year-games', label:'Last year games', iconClassOn: 'fas fa-calendar-days', iconClassOff: 'far fa-calendar-days'},
    {id:'favourite-games', label:'Favourite games (all platforms)', iconClassOn: 'fas fa-star', iconClassOff: 'far fa-star'},
    {id:'wishlist-games', label:'Wishlist games (all platforms)', iconClassOn: 'fas fa-heart', iconClassOff: 'far fa-heart'}
  ];
  selectedMenu?: {id: string, label:string};
  selectedMenuId?: string;
  
  gameGridNumCols = 3;
  gameWidthPercent = Math.floor(100/this.gameGridNumCols);

  APP_RAWG_PLATFORMS = 'APP_RAWG_PLATFORMS';
  APP_RAWG_GENRES = 'APP_RAWG_GENRES';
  APP_RAWG_FAVOURITE_GAMES = 'APP_RAWG_FAVOURITE_GAMES';
  APP_RAWG_WISHLIST_GAMES = 'APP_RAWG_WISHLIST_GAMES';
  APP_RAWG_GAMES_PAGE = 'APP_RAWG_GAMES_PAGE';
  APP_RAWG_CURRENT_GAME = 'APP_RAWG_CURRENT_GAME';
  APP_RAWG_CURRENT_GAME_SCREENSHOTS = 'APP_RAWG_CURRENT_GAME_SCREENSHOTS';
  APP_RAWG_CURRENT_GAME_MOVIES = 'APP_RAWG_CURRENT_GAME_MOVIES';

  platformsSubscription?: Subscription;
  platformsPage?: PlatformsPageInterface;
  platforms: PlatformInterface[] = [];

  favouriteGames: GameDetailInterface[] = [];
  wishlistGames: GameDetailInterface[] = [];

  selectedPlatformId = 187;
  selectedPlatform?: PlatformInterface;

  gamesPageSubscription?: Subscription;
  gamesPage?: GamesPageInterface;
  gameDetailSubscription?: Subscription;
  gameDetail?: GameDetailInterface;
  gameScreenshotsSubscription?: Subscription;
  gameScreenshots?: any[];
  gameMoviesSubscription?: Subscription;
  gameMovies?: GameMoviesInterface;
  gamePricesSubscription?: Subscription;
  gamePrices?: CheapSharkPriceInterface[];
  gamePricesApiOn = signal(true); 

  genresPageSubscription?: Subscription;
  genresPage?: GenresPageInterface;
  selectedGenre?: GenreInterface;

  selectedDeveloper?: GameDeveloperInterface;

  stores: CheapSharkStoreInterface[] = [];
  storesSubscription?: Subscription;

  constructor(
    private readonly rawgService: RawgService,
    private readonly cheapSharkService: CheapsharkService,
    private readonly deviceService: DeviceService
  ) {
    this.deviceService.deviceType$.subscribe((_deviceType) => {
      this.deviceType = _deviceType;
      if (screen.width<=430 || screen.height<=430) {
        this.deviceType = 'MOBILE';
        if (screen.height>430) {
          this.deviceOrientation = 'VERTICAL';
          this.gameGridNumCols = 1;
          this.gameWidthPercent = Math.floor(100/this.gameGridNumCols);
        }
      } else {
        this.deviceType = 'DESKTOP';
      }
      console.log(this.deviceType, this.deviceOrientation);
    });
  }

  getAppBackgroundUrl(): string {
    return '';
  }

  selectMenu(menu: {id: string, label:string}, clear = true) {
    
    if (clear) {
      this.clearSelections();
    }

    this.selectedMenu = menu;

    const storedGamesPage = localStorage.getItem(this.APP_RAWG_GAMES_PAGE);
    if (this.selectedMenu.id!=='favourite-games' && this.useStoredSamples && storedGamesPage!=null) {
      this.gamesPage = JSON.parse(storedGamesPage) as GamesPageInterface;
    } else {
      switch(this.selectedMenu.id) {
        case 'top-rated-games':
          this.getTopRatedGames();
          break;
        case 'upcoming-releases':
          this.getUpcomingGameReleases();
          break;
        case 'last-month-games':
          this.getLastMonthGames();
          break;
        case 'last-year-games':
          this.getLastYearGames();
          break;
        case 'favourite-games':
          this.viewFavouriteGames();
          break;
        case 'wishlist-games':
          this.viewWishlistGames();
          break;
      }
    }
  }

  loadPlatforms(page = 1) {
    const storedPlatforms = localStorage.getItem(this.APP_RAWG_PLATFORMS);
    if (storedPlatforms==null) {
      this.platformsSubscription = this.rawgService.getPlatforms(page).subscribe((_platformsPage) => {
        this.platformsPage = _platformsPage;
        this.platforms = this.platforms.concat(_platformsPage.results || []);
        if (this.platforms.length<this.platformsPage.count && this.platformsPage.pageNumber) {
          this.loadPlatforms(this.platformsPage.pageNumber+1);
        } else {
          this.platforms = this.getSortedFilterPlatforms(this.platforms);
          localStorage.setItem(this.APP_RAWG_PLATFORMS, JSON.stringify(this.platforms));
          console.log('Platforms stored into localStorage', this.platforms);
        }
      });
    } else {
      this.platforms = this.getSortedFilterPlatforms(JSON.parse(storedPlatforms) as PlatformInterface[]);
      if (this.selectedPlatformId) {
        this.selectedPlatform = this.platforms.find((_platform) => _platform.id===this.selectedPlatformId);
      }
      console.log('loadPlatforms() [localStorage]', this.platforms);
    }
  }

  loadGenres() {
    const storedGenres = localStorage.getItem(this.APP_RAWG_GENRES);
    if (storedGenres==null) {
      this.genresPageSubscription = this.rawgService.getGenres().subscribe((_genresPage) => {
        this.genresPage = _genresPage;
        localStorage.setItem(this.APP_RAWG_GENRES, JSON.stringify(this.genresPage));
        console.log('loadGenres()', this.genresPage);
      });
    } else {
      this.genresPage = JSON.parse(storedGenres) as GenresPageInterface;
      console.log('loadGenres() [localStorage]', this.genresPage);
    }
  }

  loadFavouriteGames() {
    const storedFavouriteGames = localStorage.getItem(this.APP_RAWG_FAVOURITE_GAMES);
    if (storedFavouriteGames!=null) {
      this.favouriteGames = JSON.parse(storedFavouriteGames) as GameDetailInterface[];
      this.favouriteGames.sort((a,b) => a.name>b.name?1:-1);
    } else {
      this.saveFavouriteGames();
    }
  }

  saveFavouriteGames() {
    this.favouriteGames.sort((a,b) => a.name>b.name?1:-1);
    localStorage.setItem(this.APP_RAWG_FAVOURITE_GAMES, JSON.stringify(this.favouriteGames));
  }
  
  toggleFavouriteGame(game: GameDetailInterface) {
    if (this.isFavouriteGame(game)) {
      this.favouriteGames = this.favouriteGames.filter((_favGame) => _favGame.id!==game.id);
    } else {
      this.favouriteGames.push(game);
    }
    this.saveFavouriteGames();

    const favouritesMenu: {id: string, label:string} | undefined = this.menus.find((_menu) => _menu.id==='favourite-games');
    if (this.selectedMenu && this.selectedMenu.id==='favourite-games' && favouritesMenu) {
      this.selectMenu(favouritesMenu, false);
    }
  }

  isFavouriteGame(game: GameDetailInterface) {
    return this.favouriteGames.some((_favGame) => _favGame.id===game.id);
  }

  viewFavouriteGames() {
    this.selectedPlatform = this.platforms[0];
    this.selectedPlatformId = this.selectedPlatform.id;

    this.gamesPage = {
      count: this.favouriteGames.length,
      user_platforms: false,
      results: this.favouriteGames.map((_gameDetail) => {
        return {
          id: _gameDetail.id,
          slug: _gameDetail.slug,
          name: _gameDetail.name,
          released: _gameDetail.released,
          background_image: _gameDetail.background_image,
          platforms: _gameDetail.platforms,
          parent_platforms: _gameDetail.parentPlatforms,
          genres: _gameDetail.genres,
          rating: _gameDetail.rating,
          rating_top: _gameDetail.rating_top,
          ratings: _gameDetail.ratings
        } as GameInterface;
      }),
      pageNumber: 1
    };
    console.log('viewFavouriteGames()', this.gamesPage);
  }

  loadWishlistGames() {
    const storedWishlistGames = localStorage.getItem(this.APP_RAWG_WISHLIST_GAMES);
    if (storedWishlistGames!=null) {
      this.wishlistGames = JSON.parse(storedWishlistGames) as GameDetailInterface[];
      this.wishlistGames.sort((a,b) => a.name>b.name?1:-1);
    } else {
      this.saveWishlistGames();
    }
  }

  saveWishlistGames() {
    this.wishlistGames.sort((a,b) => a.name>b.name?1:-1);
    localStorage.setItem(this.APP_RAWG_WISHLIST_GAMES, JSON.stringify(this.wishlistGames));
  }
  
  toggleWishlistGame(game: GameDetailInterface) {
    if (this.isWishlistGame(game)) {
      this.wishlistGames = this.wishlistGames.filter((_favGame) => _favGame.id!==game.id);
    } else {
      this.wishlistGames.push(game);
    }
    this.saveWishlistGames();

    const wishlistMenu: {id: string, label:string} | undefined = this.menus.find((_menu) => _menu.id==='wishlist-games');
    if (this.selectedMenu && this.selectedMenu.id==='wishlist-games' && wishlistMenu) {
      this.selectMenu(wishlistMenu, false);
    }
  }

  isWishlistGame(game: GameDetailInterface) {
    return this.wishlistGames.some((_favGame) => _favGame.id===game.id);
  }

  viewWishlistGames() {
    this.selectedPlatform = this.platforms[0];
    this.selectedPlatformId = this.selectedPlatform.id;

    this.gamesPage = {
      count: this.wishlistGames.length,
      user_platforms: false,
      results: this.wishlistGames.map((_gameDetail) => {
        return {
          id: _gameDetail.id,
          slug: _gameDetail.slug,
          name: _gameDetail.name,
          released: _gameDetail.released,
          background_image: _gameDetail.background_image,
          platforms: _gameDetail.platforms,
          parent_platforms: _gameDetail.parentPlatforms,
          genres: _gameDetail.genres,
          rating: _gameDetail.rating,
          rating_top: _gameDetail.rating_top,
          ratings: _gameDetail.ratings
        } as GameInterface;
      }),
      pageNumber: 1
    };
    console.log('viewWishlistGames()', this.gamesPage);
  }

  isPlatformReleased(gameDetail: GameDetailInterface, platformSlug: string): boolean {
    let res = false;
    if (!gameDetail.platforms || gameDetail.platforms.length===0) {
      return res;
    }
    res = gameDetail.platforms.some((_platform) => {
      return _platform.platform.slug.includes(platformSlug) && _platform.released_at!=null;
    });
    return res;
  }

  getLastMonthGames() {
    if (this.selectedPlatform) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.getLastMonthGames(this.selectedPlatform.id).subscribe((_games) => {
        this.gamesPage = _games;
        if (this.useStoredSamples) {
          localStorage.setItem(this.APP_RAWG_GAMES_PAGE, JSON.stringify(this.gamesPage));
        }
        console.log('getLastMonthGames()', this.gamesPage);
        this.searching.set(false);
      });
    }
  }
  getLastYearGames() {
    if (this.selectedPlatform) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.getLastYearGames(this.selectedPlatform.id).subscribe((_games) => {
        this.gamesPage = _games;
        if (this.useStoredSamples) {
          localStorage.setItem(this.APP_RAWG_GAMES_PAGE, JSON.stringify(this.gamesPage));
        }
        console.log('getLastYearGames()', this.gamesPage);
        this.searching.set(false);
      });
    }
  }
  getTopRatedGames() {
    if (this.selectedPlatform) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.getTopRatedGames(this.selectedPlatform.id).subscribe((_games) => {
        this.gamesPage = _games;
        if (this.useStoredSamples) {
          localStorage.setItem(this.APP_RAWG_GAMES_PAGE, JSON.stringify(this.gamesPage));
        }
        console.log('getTopRated()', this.gamesPage);
        this.searching.set(false);
      });
    }
  }

  getUpcomingGameReleases() {
    if (this.selectedPlatform) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.getUpcomingGameReleases(this.selectedPlatform.id).subscribe((_games) => {
        this.gamesPage = _games;
        if (this.useStoredSamples) {
          localStorage.setItem(this.APP_RAWG_GAMES_PAGE, JSON.stringify(this.gamesPage));
        }
        console.log('getUpcomingGameReleases()', this.gamesPage);
        this.searching.set(false);
      });
    }
  }

  getGameDetail(gameId: number, index: number) {
    this.gameDetail = undefined;
    this.gameScreenshots = undefined;
    this.gameMovies = undefined;
    this.gamePrices = undefined;

    const storedGame = localStorage.getItem(this.APP_RAWG_CURRENT_GAME);
    if (this.useStoredSamples && storedGame!=null) {
      this.gameDetail = JSON.parse(storedGame) as GameDetailInterface;
      this.gameDetail.ratings.sort((a,b) => {
        return (a.id>b.id)? -1:1;
      });
      console.log('getGameDetail() [localStorage]', this.gameDetail);
      if (this.gameDetail.screenshots_count && this.gameDetail.screenshots_count>0) {
        this.getGameScreenshots(gameId);
      }
      if (this.gameDetail.movies_count && this.gameDetail.movies_count>0) {
        this.getGameMovies(gameId);
      }
      if (this.gameDetail.name) {
        this.getGamePrices(this.gameDetail.name);
      }
    } else {
      this.gameDetailSubscription = this.rawgService.getGameDetail(gameId).subscribe((_game) => {
        this.gameDetail = _game;
        console.log('getGameDetail()', this.gameDetail);
        if (this.gameDetail.screenshots_count && this.gameDetail.screenshots_count>0) {
          this.getGameScreenshots(gameId);
        }
        if (this.gameDetail.movies_count && this.gameDetail.movies_count>0) {
          this.getGameMovies(gameId);
        }
        if (this.gameDetail.name) {
          this.getGamePrices(this.gameDetail.name);
        }
        if (this.gameDetail.released) {
          const dateParts = this.gameDetail.released.split('-').reverse();
          this.gameDetail.released = dateParts.join('-');
        }
        if (this.gameDetail.ratings) {
          this.gameDetail.ratings.sort((a,b) => {
            return (a.id>b.id)? -1:1;
          });
        }
        localStorage.setItem(this.APP_RAWG_CURRENT_GAME, JSON.stringify(this.gameDetail));
      });
    }
  }

  getReleaseDateFormatted(dateStr: string, yearOnly = false): string {
    if (!dateStr || dateStr.length===0 || dateStr.split('-').length!==3) {
      return dateStr;
    }
    let dateParts =  dateStr.split('-');//.reverse().join('-')
    if (dateParts.length===3) {
      if (dateParts[0].length===4) {
        if (yearOnly) {
          return dateParts[0];
        }
        return dateParts.reverse().join('-');
      }
      if (yearOnly) {
        return dateParts[dateParts.length-1];
      }
      return dateParts.join('-');
    }
    return dateStr;
  }

  getGameScreenshots(gameId: number) {
    this.gameScreenshots = undefined;
    const storedScreenshots = localStorage.getItem(this.APP_RAWG_CURRENT_GAME_SCREENSHOTS);
    if (this.useStoredSamples && storedScreenshots!=null) {
      this.gameScreenshots= JSON.parse(storedScreenshots) as any[];
      console.log(`getGameScreenshots(${gameId}) [localStorage]`, this.gameScreenshots);
    } else {
      this.gameScreenshotsSubscription = this.rawgService.getGameScreenshots(gameId).subscribe((_gameScreenshots) => {
        this.gameScreenshots = _gameScreenshots;

        const gameDetailBg: { image: string } | undefined = this.gameDetail? { image: this.gameDetail.background_image } : undefined;
        if (gameDetailBg) {
          this.gameScreenshots.unshift(gameDetailBg);
        }

        console.log(`getGameScreenshots(${gameId})`, this.gameScreenshots);
        localStorage.setItem(this.APP_RAWG_CURRENT_GAME_SCREENSHOTS, JSON.stringify(this.gameScreenshots));
      });
    }
  }

  getGameMovies(gameId: number) {
    this.gameMovies = undefined;
    const storedMovies = localStorage.getItem(this.APP_RAWG_CURRENT_GAME_MOVIES);
    if (this.useStoredSamples && storedMovies!=null) {
      this.gameMovies = JSON.parse(storedMovies) as GameMoviesInterface;
      console.log(`getGameMovies(${gameId}) [localStorage]`, this.gameMovies);
    } else {
      this.gameMoviesSubscription = this.rawgService.getGameMovies(gameId).subscribe((_gameMovies) => {
        this.gameMovies = _gameMovies;
        console.log(`getGameMovies(${gameId})`, this.gameMovies);
        localStorage.setItem(this.APP_RAWG_CURRENT_GAME_MOVIES, JSON.stringify(this.gameMovies));
      });
    }
  }

  getGamePrices(gameName: string) {
    this.gamePrices = undefined;
    this.gamePricesSubscription = this.cheapSharkService.getGamePrices(gameName).subscribe((_gamePrices) => {
      this.gamePricesApiOn.set(true);
      this.gamePrices = _gamePrices.filter((_gamePrice) => {
        return this.gamePricesMatches(this.gameDetail?.name || '', _gamePrice.external);
      });
      if (this.gamePrices && this.gamePrices.length>0) {
        this.gamePrices.forEach((_gamePrice) => {
          this.cheapSharkService.getGameCheapestDealData(_gamePrice).subscribe((_gamePriceWithDeal) => {});
        });
      }
      console.log('getGamePrices()', this.gamePrices);
    },(_error) => {
      this.gamePricesApiOn.set(false);
    });
  }

  gamePricesMatches(gameName: string, priceGameName: string): boolean {
    if (gameName.trim().toLowerCase()===priceGameName.trim().toLowerCase()) {
      return true;
    } else {
      const set = new Set(gameName.toLowerCase().trim().split(' '));
      let count = 0;

      for (const item of priceGameName.toLowerCase().trim().split(' ')) {
        if (set.has(item)) {
          count++;
          if (count >= 2) return true;
        }
      }
      return false;
    }
  }

  clearSelections() {
    this.selectedMenu = undefined;
    this.selectedMenuId = undefined;
    this.gamesPage = undefined;
    this.gameDetail = undefined;
    this.gameScreenshots = undefined;
    this.gameMovies = undefined;
    this.gamePrices = undefined;
    this.selectedGenre = undefined;
    this.selectedDeveloper = undefined;
  }

  selectPlatform(platform: PlatformInterface) {
    this.clearSelections();
    this.selectedPlatform = platform;
    this.selectedPlatformId = platform.id;
    console.log('selectPlatform', platform)
  }

  selectGenre(genre: GenreInterface) {
    this.clearSelections();
    this.selectedGenre = genre;
    console.log('selectGenre()', genre);
    if (this.selectedPlatform) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.searchGamesByGenre(this.selectedGenre, this.selectedPlatform.id).subscribe((_res) => {
        console.log(_res.results);
        this.gamesPage = _res;
        this.searching.set(false);
      });
    }
  }

  selectDeveloper(developer: GameDeveloperInterface) {
    if (developer) {
      this.clearSelections();
      this.selectedDeveloper = developer;
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.getGamesByDeveloper(developer.id).subscribe((_games) => {
        this.gamesPage = _games;
        if (this.useStoredSamples) {
          localStorage.setItem(this.APP_RAWG_GAMES_PAGE, JSON.stringify(this.gamesPage));
        }
        console.log('getGamesByDeveloper()', this.gamesPage);
        this.searching.set(false);
      });
    }
  }

  onPlatformSelectChange(event: MatSelectChange) {
    const platform: PlatformInterface | undefined = this.platforms.find((_platform) => _platform.id===event.value);
    if (platform) {
      this.selectPlatform(platform);
      console.log('onPlatformSelectChange()', this.selectedPlatform);
    }
  }

  onMenuSelectChange(event: MatSelectChange) {
    const menu: MenuInterface | undefined = this.menus.find((_menu) => _menu.id===event.value);
    if (menu) {
      this.selectMenu(menu);
      console.log('onMenuSelectChange()', this.selectedMenu);
    }
  }

  getSortedFilterPlatforms(platforms: PlatformInterface[]): PlatformInterface[] {
    platforms = platforms.filter((_platform) => _platform.id!==-1).sort((a,b) => {
      return (a.name || '').toUpperCase()>(b.name || '').toUpperCase()?1:-1;
    });
    platforms.unshift({id: -1, name: 'All', slug: 'all'});
    return platforms;
  }

  getSortedPlatforms(platforms: {platform: PlatformInterface}[]): {platform: PlatformInterface}[] {
    platforms = platforms.filter((_platform) => _platform.platform.id!==-1).sort((a,b) => {
      return (a.platform.name || '').toUpperCase()>(b.platform.name || '').toUpperCase()?1:-1;
    });
    return platforms;
  }

  getSortedParentPlatforms(parentPlatforms: {platform: PlatformInterface}[]): {platform: PlatformInterface}[] {
    parentPlatforms = parentPlatforms.filter((_platform) => _platform.platform.id!==-1).sort((a,b) => {
      return (a.platform.name || '').toUpperCase()>(b.platform.name || '').toUpperCase()?1:-1;
    });
    return parentPlatforms;
  }

  trackByPlatform(index: number, platform: PlatformInterface) {
    return platform.id;
  }

  trackByGame(index: number, game: GameInterface) {
    return game.id;
  }

  getRatingClass(rating?: number): string {
    if (!rating || rating===0) {
      return '';
    }
    if (rating>0 && rating <=1) {
      return 'bg-danger ';
    } else if (rating>1 && rating<=3) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }

  onSearch(query: string) {
    console.log(`onSearch(${query})`);
    if (this.selectedPlatform) {
      this.selectedMenu = undefined;
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.searchGame(query, this.selectedPlatform.id).subscribe((_res) => {
        this.gameDetail = undefined;
        this.gameScreenshots = undefined;
        this.gameMovies = undefined;
        this.gamesPage = _res;
        console.log(`onSearch(${query})`, this.gamesPage);
        this.searching.set(false);
      });
    }
  }

  paginateGameList(url?: string) {
    if (url && url.length>0) {
      this.searching.set(true);
      this.gamesPageSubscription = this.rawgService.paginateGameList(url).subscribe((_gamesPage) => {
        if (this.gamesPage) {
          this.gamesPage.count = _gamesPage.count;
          this.gamesPage.next = _gamesPage.next;
          this.gamesPage.previous = _gamesPage.previous;
          this.gamesPage.user_platforms = _gamesPage.user_platforms;
          this.gamesPage.results = this.gamesPage.results?.concat(_gamesPage.results || []);
        }
        this.searching.set(false);
      });
    }
  }

  openUrl(url: string) {
    window.open(url);
  }
  
  ngOnInit(): void {
    this.loadPlatforms();
    this.loadGenres();
    this.loadFavouriteGames();
    this.loadWishlistGames();

    // Set selectedMenu
    if (this.favouriteGames.length>0) {
      const menu = this.menus.find((_menu) => _menu.id==='favourite-games' );
      if (menu) {
        this.selectMenu(menu);
      }
    }

    // Init search control
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),        // wait 500ms after user stops typing
        distinctUntilChanged()    // ignore same consecutive values
      )
      .subscribe(query => {
        console.log(query);
        if (query && query.trim().length>0) {
          this.onSearch(query);
        }
      });

    // Load stores
    this.storesSubscription = this.cheapSharkService.stores.subscribe((_stores) => {
      this.stores = _stores;
    });
  }

  ngOnDestroy(): void {
    if (this.platformsSubscription) {
      this.platformsSubscription.unsubscribe();
    }
    if (this.gamesPageSubscription) {
      this.gamesPageSubscription.unsubscribe();
    }
    if (this.gameDetailSubscription) {
      this.gameDetailSubscription.unsubscribe();
    }
    if (this.gameScreenshotsSubscription) {
      this.gameScreenshotsSubscription.unsubscribe();
    }
    if (this.gameMoviesSubscription) {
      this.gameMoviesSubscription.unsubscribe();
    }
    if (this.genresPageSubscription) {
      this.genresPageSubscription.unsubscribe();
    }
    if (this.gamePricesSubscription) {
      this.gamePricesSubscription.unsubscribe();
    }
    if (this.storesSubscription) {
      this.storesSubscription.unsubscribe();
    }
  }

}
