#!/bin/bash
set -euo pipefail

APP_DIR=/var/www/billing-ui
BRANCH=main
DIST=dist            # nginx serves $APP_DIR/dist/billing_ui/browser
NEXT=dist-next       # fresh build goes here first
PREV=dist-prev       # previous build, kept for quick rollback

echo "🚀 Deploying Frontend..."

cd "$APP_DIR"

if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "❌ Server checkout is not on '$BRANCH'" >&2
  exit 1
fi

echo "📥 Pulling latest changes..."
OLD_HEAD=$(git rev-parse HEAD)
git fetch origin "$BRANCH"
# Fails instead of overwriting manual edits made on the server.
git merge --ff-only "origin/$BRANCH"

# Bash keeps running the old script after git replaces it, so restart with the pulled version.
if [[ "$(git rev-parse HEAD)" != "$OLD_HEAD" && -z "${DEPLOY_REEXEC:-}" ]]; then
  DEPLOY_REEXEC=1 exec bash "$APP_DIR/deploy.sh"
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building Angular app..."
# Build into a separate folder so a failed build never leaves the live site empty.
rm -rf "$NEXT"
npm run build -- --output-path "$NEXT/billing_ui"

if [[ ! -f "$NEXT/billing_ui/browser/index.html" ]]; then
  echo "❌ Build output is missing index.html" >&2
  exit 1
fi

echo "🔁 Switching to the new build..."
rm -rf "$PREV"
if [[ -d "$DIST" ]]; then
  mv "$DIST" "$PREV"
fi
mv "$NEXT" "$DIST"

echo "✅ Frontend deployment complete!"
echo "🌐 Visit: https://sthm23.uz"
echo "↩️  Rollback: cd $APP_DIR && mv $DIST $NEXT && mv $PREV $DIST"
