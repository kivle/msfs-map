import { createSlice } from '@reduxjs/toolkit';

import repository from './repository';

function worthwhile(text) {
  if (!text) return false;
  
  // try to determine if an extract is even worth reading
  return text.length > 100 && (text.match(/\./g) || []).length > 1;
}

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    availableEditions: [
      'en','ceb','sv','de','fr','nl','ru','it','es','pl','war','vi','ja','zh','arz','ar','uk',
      'pt','fa','ca','sr','id','no','ko','fi','hu','cs','sh','ro','zh-min-nan','tr','eu','ms',
      'ce','eo','he','hy','bg','da','azb','sk','kk','min','hr','et','lt','be','el','simple',
      'az','sl','gl','ur','nn','tt','hi','ka','th','uz','la','cy','ta','vo','mk','ast','lv',
      'zh-yue','tg','bn','af','mg','oc','bs','sq','ky','nds','new','be-tarask','ml','te','br',
      'tl','vec','pms','mr','su','ht','sw','lb','jv','pnb','ba','ga','szl','is','my','sco','fy',
      'cv','lmo','wuu','an','pa','ne','diq','ku','yo','bar','io','gu','ckb','als','kn','scn',
      'bpy','qu','ia','mn','bat-smg','si','nv','or','cdo','ilo','gd','xmf','yi','am','nap','bug',
      'wa','sd','hsb','mai','fo','map-bms','mzn','li','sah','eml','os','ps','sa','frr','bcl',
      'zh-classical','ace','mrj','mhr','avk','hif','gor','hak','roa-tara','pam','hyw','km','nso',
      'rue','crh','se','bh','as','shn','vls','mi','nds-nl','nah','sc','vep','gan','myv','sn',
      'ab','glk','bo','lrc','co','so','tk','fiu-vro','csb','ha','kv','ie','gv','udm','pcd','ay',
      'kab','zea','sat','nrm','ug','lij','zu','kw','frp','lez','ban','stq','lfn','gn','mwl',
      'gom','rm','mt','lo','lad','koi','fur','olo','ang','dty','dsb','bjn','ext','ln','cbk-zam',
      'dv','ksh','tyv','ary','gag','pfl','pag','pi','av','awa','haw','bxr','xal','krc','pap',
      'za','pdc','rw','kaa','szy','arc','to','nov','jam','tpi','kbp','kbd','ig','inh','na',
      'tet','wo','tcy','ki','atj','jbo','roa-rup','bi','lbe','kg','ty','lg','mdf','fj','srn',
      'xh','gcr','ltg','lld','chr','ak','om','sm','kl','got','pih','st','cu','ny','nqo','tn',
      'tw','ts','rmy','bm','mnw','chy','rn','tum','ss','ch','iu','pnt','ks','ady','ve','ee',
      'ik','ff','sg','dz','ti','cr','din','ng','cho','kj','mh','ho','ii','aa','mus','hz','kr'
    ],
    currentVoice: undefined,
    availableVoices: [],
    currentPage: undefined,
    pages: [],
    pagesViewed: []
  },
  reducers: {
    addPages: (state, action) => {
      const { data: { query: { pages } = {} } = {} } = action.payload;
      if (!pages) return;
      const geosearch = Object.keys(pages).reduce((a, p) => {
        a.push(pages[p]);
        return a;
      }, []);
      const pagesToAdd = geosearch.filter(
        p => p?.extract?.length > 100 &&
             worthwhile(p?.extract) &&
             p?.coordinates?.length > 0 &&
             !state.pages.some(p2 => p.pageid === p2.pageid) &&
             !state.pagesViewed.some(p2 => p.pageid === p2)
      );
      state.pages.push(...pagesToAdd);
      if (pagesToAdd.length && state.currentPage === undefined) {
        state.currentPage = pagesToAdd[0].pageid;
      }
    },
    nextPage: (state) => {
      if (state.currentPage !== undefined) {
        state.pages = state.pages.filter(p => p.pageid !== state.currentPage);
        state.pagesViewed.push(state.currentPage);
        while (state.pages.length > 10) {
          // Remove least worthwhile articles to not end up with a huge backlog
          const shortestArticle = Math.min(...state.pages.map(p => p.extract.length));
          const leastInteresting = state.pages.find(p => p.extract.length === shortestArticle);
          state.pages = state.pages.filter(p => p.pageid !== leastInteresting.pageid);
        }
      }
      const unreadPage = state.pages
        .sort(
          (a, b) => b?.extract?.length - a?.extract?.length
        ).find(
          p => !state.pagesViewed.some(v => p.pageid === v)
        );
      if (unreadPage) {
        state.currentPage = unreadPage.pageid;
      }
      else {
        state.currentPage = undefined;
      }
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
      state.currentPage = undefined;
      state.pages = [];
      state.pagesViewed = [];
    },
    setVoice: (state, action) => {
      const voice = action.payload;
      state.currentVoice = voice;
    },
    setAvailableVoices: (state, action) => {
      const voices = action.payload;
      state.availableVoices = voices;
      if (state.voice && !state.availableVoices.some(v => v === state.voice))
        state.voice = undefined;
    }
  },
});

export const {
  addPages,
  nextPage,
  setEdition,
  setVoice,
  setAvailableVoices
} = wikipediaSlice.actions;

export const getPages = (lat, lng, radius) => async (dispatch, getState) => {
  const state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data)
    dispatch(addPages({ data }));
};

export const selectEdition = (state) => state.wikipedia.edition;

export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;

export const selectVoice = (state) => state.wikipedia.currentVoice;

export const selectAvailableVoices = (state) => state.wikipedia.availableVoices;

export const selectPages = (state) => state.wikipedia.pages;

export const selectCurrentPage = (state) => 
  state.wikipedia.currentPage && state.wikipedia.pages.find(p => p.pageid === state.wikipedia.currentPage);

export default wikipediaSlice.reducer;
