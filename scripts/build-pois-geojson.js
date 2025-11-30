const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const poisBase = path.join(repoRoot, 'pois');

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

function buildTarget({ inputDir, outputFile, files, mode }) {
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

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  outputDirs.forEach((dir) => {
    const outputPath = path.join(dir, outputFile);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
    console.log(`Wrote ${features.length} features to ${outputPath}`);
  });
}

targets.forEach(buildTarget);
