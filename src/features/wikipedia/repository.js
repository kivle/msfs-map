import api from './api';

import { throttle } from '../../utils/throttle';

class WikipediaRepository {
  constructor(api, storage) {
    this.api = api;
    this.storage = storage;
    this.getPagesByGeoLocation = throttle(this.getPagesByGeoLocation.bind(this), 10000);
  }

  async getPagesByGeoLocation(edition, lat, lng, radius) {
    // TODO: Caching
    return await this.api.getPagesByGeoLocation(edition, lat, lng, radius);
  }
}

const instance = new WikipediaRepository(api, window.localStorage);

export default instance;
