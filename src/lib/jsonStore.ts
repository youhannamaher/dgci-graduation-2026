import fs from 'fs';
import path from 'path';

export function readLocalJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading local JSON file ${filename}:`, error);
    return [] as unknown as T;
  }
}
