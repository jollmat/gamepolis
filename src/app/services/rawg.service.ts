import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformsPageInterface } from '../model/rawg/platforms-page.interface';
import moment from 'moment';
import { GamesPageInterface } from '../model/rawg/games-page.interface';
import { GameDetailInterface } from '../model/rawg/game-detail.interface';
import { GameScreenshotInterface } from '../model/rawg/game-screenshot.interface';
import { GameMoviesInterface } from '../model/rawg/game-movies.interface';
import { GenresPageInterface } from '../model/rawg/genres-page.interface';
import { GenreInterface } from '../model/rawg/genre.interface';

@Injectable({
  providedIn: 'root'
})
export class RawgService {

  apiKey = '2486793c78c74e168e2ff12f9d5fe22c';

  constructor(
    private readonly http: HttpClient
  ) { }

  getPlatforms(page = 1): Observable<PlatformsPageInterface> {
    return this.http.get<PlatformsPageInterface>(`https://api.rawg.io/api/platforms?key=${this.apiKey}&page=${page}`).pipe(map((_page) => {
      _page.pageNumber = page;
      return _page;
    }));
  }

  getGenres(): Observable<GenresPageInterface> {
    return this.http.get<GenresPageInterface>(`https://api.rawg.io/api/genres?key=${this.apiKey}`);
  }

  getGamesByDeveloper(developerId: number) : Observable<GamesPageInterface> {
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&developers=${developerId}`);
  }

  getLastMonthGames(platformId: number): Observable<GamesPageInterface> {
    const startOfLastMonth = moment().subtract(1, 'month');
    const endOfLastMonth = moment();

    // Format as string
    const fromDate = startOfLastMonth.format('YYYY-MM-DD');
    const toDate = endOfLastMonth.format('YYYY-MM-DD');
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&dates=${fromDate},${toDate}`+(platformId>-1?`&platforms=${platformId}`:``));
  }

  getLastYearGames(platformId: number): Observable<GamesPageInterface> {
    const startOfLastMonth = moment().subtract(1, 'year');
    const endOfLastMonth = moment();

    // Format as string
    const fromDate = startOfLastMonth.format('YYYY-MM-DD');
    const toDate = endOfLastMonth.format('YYYY-MM-DD');
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&dates=${fromDate},${toDate}`+(platformId>-1?`&platforms=${platformId}`:``));
  }

  getTopRatedGames(platformId: number): Observable<GamesPageInterface> {
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&ordering=-rating&page_size=25`+(platformId>-1?`&platforms=${platformId}`:``));
  }

  getUpcomingGameReleases(platformId: number): Observable<GamesPageInterface> {
    const from = moment();
    const to = moment().add(1, 'year');

    // Format as string
    const fromDate = from.format('YYYY-MM-DD');
    const toDate = to.format('YYYY-MM-DD');
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&dates=${fromDate},${toDate}&ordering=-added&page_size=25`+(platformId>-1?`&platforms=${platformId}`:``));
  }

  paginateGameList(url: string): Observable<GamesPageInterface> {
    return this.http.get<GamesPageInterface>(url);
  }

  getGameDetail(gameId: number): Observable<GameDetailInterface> {
    return this.http.get<GameDetailInterface>(`https://api.rawg.io/api/games/${gameId}?key=${this.apiKey}`);
  }

  getGameScreenshots(gameId: number): Observable<GameScreenshotInterface[]> {
    return this.http.get<{
      count: number,
      next: string,
      previous: string,
      results: GameScreenshotInterface[]
    }>(`https://api.rawg.io/api/games/${gameId}/screenshots?key=${this.apiKey}`).pipe(map((_screenshotsResult) => {
      return _screenshotsResult.results;
    }));
  }

  getGameMovies(gameId: number): Observable<GameMoviesInterface> {
    return this.http.get<GameMoviesInterface>(`https://api.rawg.io/api/games/${gameId}/movies?key=${this.apiKey}`);
  }

  searchGame(text: string, platformId: number): Observable<GamesPageInterface> {
    // By platform
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&search=${text}`+(platformId>-1?`&platforms=${platformId}`:``));
    //return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&search=${text}`);
  }

  searchGamesByGenre(genre: GenreInterface, platformId: number): Observable<GamesPageInterface> {
    return this.http.get<GamesPageInterface>(`https://api.rawg.io/api/games?key=${this.apiKey}&genres=${genre.slug}`+(platformId>-1?`&platforms=${platformId}`:``));
  }

}
