import * as React from 'react';

import { useSelector } from 'react-redux';
import parse from 'html-react-parser';

import styles from './Wikipedia.module.css';
import { selectCurrentPage } from '../../wikipedia/wikipediaSlice';
import RateArticle from './components/RateArticle';
import { useWikipediaPageLink } from '../../wikipedia/hooks';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? <img src={page.thumbnail.source} alt={page.title} />
    : null;
}

const WikipediaPanelView = React.memo(({
  link, page
}) =>
  <div className={styles.main}>
    <div className={styles.title}>
      <div><a href={link} target="_blank" rel="noopener noreferrer">{page.title}</a></div>
      <Thumbnail page={page} />
    </div>
    <div className={styles.text}>
      <Extract page={page} />
    </div>
    <RateArticle page={page} />
  </div>
);

export default function WikipediaPanel() {
  const page = useSelector(selectCurrentPage);
  const link = useWikipediaPageLink(page);

  if (!page) return null;

  return <WikipediaPanelView link={link} page={page} />;
}
