import api from './api';

class WikipediaRepository {
  constructor(api, storage) {
    this.api = api;
    this.storage = storage;
  }

  async getPagesByGeoLocation(edition, lat, lng, radius) {
    return await this.api.getPagesByGeoLocation(edition, lat, lng, radius);
  }
}

const instance = new WikipediaRepository(api, window.localStorage);

export default instance;
