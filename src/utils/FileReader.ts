var fs = require('fs');

export const readJsonFile = (file: string) => {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
