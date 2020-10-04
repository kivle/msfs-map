class WikipediaApi {
  getWikipediaApiUrl(edition, queryParams) {
    const query = Object.keys(queryParams).reduce(
      (aggr, key) => {
        if (aggr) aggr += '&';
        return `${aggr} ${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`;
      }, ''
    );

    return `https://${edition}.wikipedia.org/w/api.php?${query}`;
  }

  async getPagesByGeoLocation(edition, lat, lng, radius, limit = 100) {
    const query = {
      format: 'json',
      action: 'query',
      generator: 'geosearch',
      ggslimit: limit,
      ggsradius: radius,
      ggscoord: lat + '|' + lng,
      origin: '*',
      prop: 'extracts|pageimages|coordinates',
      exsentences: '10',
      pithumbsize: '400',
      imlimit: '10'
    };
    
    const url = this.getWikipediaApiUrl(edition, query);
    const resp = await fetch(url);
    const data = await resp.json();
    
    return data;
  }
}

const instance = new WikipediaApi();

export default instance;
