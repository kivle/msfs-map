const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const poisBase = path.join(repoRoot, 'pois');
const outputDir = process.env.GEOJSON_OUTPUT_DIR || path.join(repoRoot, 'dist');

const targets = [
  {
    name: 'world_updates',
    inputDir: path.join(poisBase, 'World Updates'),
    output: path.join(outputDir, 'world_updates.geojson'),
    mode: 'all-files'
  },
  {
    name: 'city_updates',
    inputDir: path.join(poisBase, 'City Updates'),
    output: path.join(outputDir, 'city_updates.geojson'),
    mode: 'all-files'
  },
  {
    name: 'photogammetry',
    inputDir: path.join(poisBase, 'Core'),
    output: path.join(outputDir, 'photogammetry.geojson'),
    files: ['Core Sim - 3D_cities_Photogrammetry - Core Sim.csv']
  },
  {
    name: 'airports',
    inputDir: path.join(poisBase, 'Core'),
    output: path.join(outputDir, 'airports.geojson'),
    files: ['Core Sim - Airports_Standard_Deluxe_Premium.csv']
  },
  {
    name: 'pois',
    inputDir: path.join(poisBase, 'Core'),
    output: path.join(outputDir, 'pois.geojson'),
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

function buildTarget({ inputDir, output, files, mode }) {
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

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(geojson, null, 2));
  console.log(`Wrote ${features.length} features to ${output}`);
}

targets.forEach(buildTarget);
