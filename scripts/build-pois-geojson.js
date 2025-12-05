const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const poisBase = path.join(repoRoot, 'pois');
const globalAirportsJson = path.join(repoRoot, 'global-airports', 'airports.json');
const tileSizeDegrees = parseFloat(process.env.GEOJSON_TILE_DEGREES || '10');

function parseOutputDirs() {
  const multi = process.env.GEOJSON_OUTPUT_DIRS;
  if (multi) {
    return multi.split(',')
      .map((dir) => dir.trim())
      .filter(Boolean)
      .map((dir) => path.isAbsolute(dir) ? dir : path.join(repoRoot, dir));
  }
  const single = process.env.GEOJSON_OUTPUT_DIR;
  if (single) {
    return [path.isAbsolute(single) ? single : path.join(repoRoot, single)];
  }
  // Default: write to both dist (deploy) and public (dev server)
  return [path.join(repoRoot, 'dist'), path.join(repoRoot, 'public')];
}

const outputDirs = Array.from(new Set(parseOutputDirs()));

const targets = [
  {
    name: 'world_updates',
    inputDir: path.join(poisBase, 'World Updates'),
    outputFile: 'world_updates.geojson',
    mode: 'all-files'
  },
  {
    name: 'city_updates',
    inputDir: path.join(poisBase, 'City Updates'),
    outputFile: 'city_updates.geojson',
    mode: 'all-files'
  },
  {
    name: 'photogammetry',
    inputDir: path.join(poisBase, 'Core'),
    outputFile: 'photogammetry.geojson',
    files: ['Core Sim - 3D_cities_Photogrammetry - Core Sim.csv']
  },
  {
    name: 'airports',
    inputDir: path.join(poisBase, 'Core'),
    outputFile: 'airports.geojson',
    files: ['Core Sim - Airports_Standard_Deluxe_Premium.csv']
  },
  {
    name: 'global_airports',
    jsonInput: globalAirportsJson,
    outputFile: 'global_airports.geojson'
  },
  {
    name: 'pois',
    inputDir: path.join(poisBase, 'Core'),
    outputFile: 'pois.geojson',
    files: ['Core Sim - Points_of_Interest.csv']
  }
];

/**
 * Minimal CSV parser that supports quoted fields and newlines inside quotes.
 */
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };

  const pushRow = () => {
    if (row.length > 0) {
      rows.push(row);
      row = [];
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      pushField();
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1; // skip LF in CRLF
      }
      pushField();
      pushRow();
    } else {
      field += char;
    }
  }

  // flush trailing field/row
  pushField();
  pushRow();

  // drop trailing empty lines
  while (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }

  return rows;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(raw);
  const [header = [], ...dataRows] = rows;
  return dataRows.map((values) => {
    const entry = {};
    header.forEach((key, idx) => {
      entry[key] = values[idx] ?? '';
    });
    return entry;
  });
}

function listCsvFiles(dir) {
  return fs.readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith('.csv'))
    .map((file) => path.join(dir, file));
}

function buildCsvFeatures(inputDir, files, mode) {
  const inputFiles = mode === 'all-files'
    ? listCsvFiles(inputDir)
    : (files ?? []).map((f) => path.join(inputDir, f)).filter((f) => fs.existsSync(f));

  const features = [];

  inputFiles.forEach((filePath) => {
    const entries = readCsv(filePath);
    entries.forEach((entry) => {
      const lat = parseFloat(entry.Latitude);
      const lon = parseFloat(entry.Longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      const properties = {
        ...entry,
        sourceFile: path.basename(filePath)
      };

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties
      });
    });
  });

  return features;
}

function buildAirportJsonFeatures(jsonInput) {
  const raw = fs.readFileSync(jsonInput, 'utf8');
  const entries = JSON.parse(raw);
  const features = [];

  Object.entries(entries).forEach(([icao, entry]) => {
    const lat = parseFloat(entry.lat);
    const lon = parseFloat(entry.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const properties = {
      ...entry,
      icao: entry.icao || icao,
      Name: entry.name || entry.icao || icao,
      Ident: entry.icao || icao,
      Iata: entry.iata || '',
      City: entry.city || '',
      State: entry.state || '',
      Country: entry.country || '',
      ElevationFt: entry.elevation,
      Latitude: lat,
      Longitude: lon,
      Type: 'GlobalAirport',
      sourceFile: path.basename(jsonInput)
    };

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties
    });
  });

  return features;
}

function getTileKey(lat, lon) {
  const latBucket = Math.floor(lat / tileSizeDegrees) * tileSizeDegrees;
  const lonBucket = Math.floor(lon / tileSizeDegrees) * tileSizeDegrees;
  return {
    id: `lat${latBucket}_lon${lonBucket}`,
    bounds: {
      minLat: latBucket,
      maxLat: latBucket + tileSizeDegrees,
      minLon: lonBucket,
      maxLon: lonBucket + tileSizeDegrees
    }
  };
}

function writeTiledGeoJson(outputFile, features) {
  const baseName = path.basename(outputFile, path.extname(outputFile));

  const tileMap = new Map();
  features.forEach((feature) => {
    const [lon, lat] = feature.geometry?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const tile = getTileKey(lat, lon);
    if (!tileMap.has(tile.id)) {
      tileMap.set(tile.id, { ...tile, features: [] });
    }
    tileMap.get(tile.id).features.push(feature);
  });

  outputDirs.forEach((dir) => {
    const layerDir = path.join(dir, baseName);
    fs.mkdirSync(layerDir, { recursive: true });

    const manifest = {
      type: 'TiledGeoJSONManifest',
      layer: baseName,
      tileSizeDegrees,
      tileCount: tileMap.size,
      totalFeatures: features.length,
      tiles: []
    };

    tileMap.forEach((tile) => {
      const tileFile = `${tile.id}.geojson`;
      const outputPath = path.join(layerDir, tileFile);
      const geojson = {
        type: 'FeatureCollection',
        features: tile.features
      };
      fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
      manifest.tiles.push({
        id: tile.id,
        file: tileFile,
        bounds: tile.bounds,
        featureCount: tile.features.length
      });
    });

    const manifestPath = path.join(layerDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`Wrote ${features.length} features across ${tileMap.size} tiles to ${layerDir}`);
  });
}

function buildTarget({ inputDir, outputFile, files, mode, jsonInput }) {
  const features = jsonInput
    ? buildAirportJsonFeatures(jsonInput)
    : buildCsvFeatures(inputDir, files, mode);

  writeTiledGeoJson(outputFile, features);
}

targets.forEach(buildTarget);
