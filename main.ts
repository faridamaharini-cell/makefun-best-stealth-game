// LANTERNTHIEF entrypoint for make.fun (Node 22 stdlib only).
//
// What it does: copies this repo's game/ and screenshots/ into the output
// directory (or $MAKEFUN_OUTPUT_DIR when set, defaulting to /output) and writes
// out/dossier.json, built with the vendored make.fun library under the bounty
// caps: text 163840 bytes, at most 4 screenshots of 262144 bytes each, at most
// 993 game entries, 48 MiB of game files, and 1000-byte game paths.
//
// Run it from this directory with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameSource = join(repoRoot, 'game');
const shotSource = join(repoRoot, 'screenshots');
const gameTarget = join(outputDir, 'game');
const shotTarget = join(outputDir, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(gameSource, gameTarget, { recursive: true });
mkdirSync(shotTarget, { recursive: true });
if (existsSync(shotSource)) {
  cpSync(shotSource, shotTarget, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
