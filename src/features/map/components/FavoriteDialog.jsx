import * as React from 'react';
import styles from './FavoriteDialog.module.css';

export default function FavoriteDialog({
  mode,
  position,
  favorite,
  onSave,
  onDelete,
  onClose
}) {
  const [name, setName] = React.useState('');
  const isCreate = mode === 'create';

  React.useEffect(() => {
    if (isCreate) {
      setName('');
      return;
    }
    setName(favorite?.name ?? '');
  }, [favorite, isCreate]);

  const coords = favorite
    ? { lat: favorite.lat, lng: favorite.lng }
    : position;

  if (!coords) return null;

  const formattedCoords = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

  const handleBackdropClick = () => {
    onClose?.();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isCreate) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave?.(trimmed);
  };

  const isSaveDisabled = !name.trim();

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className={styles.dialog} onClick={stopPropagation}>
        <div className={styles.header}>
          <h2>{isCreate ? 'Add favorite' : 'Favorite details'}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>Close</button>
        </div>
        <div className={styles.content}>
          {isCreate ? (
            <form className={styles.row} onSubmit={handleSubmit}>
              <label htmlFor="favoriteName">Name</label>
              <input
                id="favoriteName"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Grand Canyon overlook"
                autoFocus
              />
              <div className={styles.row}>
                <label>Coordinates</label>
                <div className={styles.coords}>{formattedCoords}</div>
              </div>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.ghostButton} onClick={onClose}>Cancel</button>
                <button type="submit" className={styles.primaryButton} disabled={isSaveDisabled}>Save</button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.row}>
                <label>Name</label>
                <div>{favorite?.name}</div>
              </div>
              <div className={styles.row}>
                <label>Coordinates</label>
                <div className={styles.coords}>{formattedCoords}</div>
              </div>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.ghostButton} onClick={onClose}>Close</button>
                <button type="button" className={styles.dangerButton} onClick={() => onDelete?.(favorite)}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
