export interface GameMoviesInterface {
    count: number,
    results: {
      id: number,
      name: string,
      preview: string,
      data: {
        480: string,
        max: string
      }
    }[]
}