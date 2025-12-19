import React from 'react';
import { useWikipediaPageLink } from '../hooks';
import parse from 'html-react-parser';
import styles from './WikipediaPage.module.css';
import DistanceVisualizer from './DistanceVisualizer';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function ImageCarousel({ page }) {
  const images = page?.pageimages ?? (page?.thumbnail ? [{ source: page.thumbnail.source }] : []);
  const [index, setIndex] = React.useState(0);
  const total = images.length;

  React.useEffect(() => {
    if (!total) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  React.useEffect(() => {
    setIndex(0);
  }, [page?.pageid]);

  if (!images.length) return null;

  const current = images[index];
  const caption = current?.caption;

  const next = () => {
    setIndex((idx) => (idx + 1) % total);
  };

  const prev = () => {
    setIndex((idx) => (idx - 1 + total) % total);
  };

  return (
    <div className={styles.carousel}>
      <a href={current?.source} target="_blank" rel="noopener noreferrer" title={caption ?? undefined}>
        <img src={current?.source} alt={page.title} className={styles.hero} />
      </a>
      <div className={styles.carouselBar}>
        <div className={styles.carouselControls}>
          <button type="button" onClick={prev} aria-label="Previous image">‹</button>
          <div className={styles.carouselStatus}>
            <span>{index + 1} / {total}</span>
          </div>
          <button type="button" onClick={next} aria-label="Next image">›</button>
        </div>
      </div>
    </div>
  );
}

const WikipediaPage = ({ page, closestPoint }) => {
  const link = useWikipediaPageLink(page);

  return (
    <article className={styles.page}>
      <ImageCarousel page={page} />
      {closestPoint && (
        <div className={styles.metaRow}>
          <DistanceVisualizer point={closestPoint} />
        </div>
      )}
      <div className={styles.text}>
        <Extract page={page} />
      </div>
    </article>
  );
};

export default React.memo(WikipediaPage);
