import api from './api';

class WikipediaRepository {
  constructor(api, storage) {
    this.api = api;
    this.storage = storage;
  }

  async getPagesByGeoLocation(edition, lat, lng, radius, limit = 100) {
    // TODO: Caching
    return await this.api.getPagesByGeoLocation(edition, lat, lng, radius, limit);
  }
}

const instance = new WikipediaRepository(api, window.localStorage);

export default instance;
