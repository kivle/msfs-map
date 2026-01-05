const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || '0.0.0';

const payload = `${JSON.stringify({ version }, null, 2)}\n`;
fs.writeFileSync(publicVersionPath, payload, 'utf8');
