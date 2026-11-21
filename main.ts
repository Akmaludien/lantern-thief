// Hand-in program for The Lantern Thief.
// Copies game/ and screenshots/ from this repository into the output
// directory and writes the dossier buildDossier derives from them, so the
// scorer can check the entry byte for byte. Standard library only, and
// deterministic: two runs write the same bytes.

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function copyTree(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  const entries = readdirSync(fromDir).sort();
  for (const entry of entries) {
    const fromPath = join(fromDir, entry);
    const toPath = join(toDir, entry);
    const info = statSync(fromPath);
    if (info.isDirectory()) {
      copyTree(fromPath, toPath);
    } else if (info.isFile()) {
      copyFileSync(fromPath, toPath);
    }
  }
}

function main() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const gameDir = join(repoRoot, 'game');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(gameDir)) {
    throw new Error('game/ is missing from the repository');
  }
  copyTree(gameDir, join(outputDir, 'game'));
  if (existsSync(shotsDir)) {
    copyTree(shotsDir, join(outputDir, 'screenshots'));
  }

  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();
