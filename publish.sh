#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/quartz-source"
OUT="$ROOT/garden"

if [ ! -d "$SRC" ]; then
    echo "Erreur : $SRC introuvable." >&2
    exit 1
fi

echo "→ Build Quartz..."
cd "$SRC"
npx quartz build

echo "→ Copie vers $OUT..."
rm -rf "$OUT"
cp -R public "$OUT"

echo "✓ Garden publié dans garden/. Pense à git add/commit/push."
