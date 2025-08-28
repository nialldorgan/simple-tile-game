#!/usr/bin/env bash
set -e

echo "🔧 Adding layered app icon..."

ASSET_DIR="ios/$EAS_PROJECT_ROOT_NAME/Images.xcassets/AppIcon.appiconset"

# Ensure asset dir exists
mkdir -p "$ASSET_DIR"

# Copy layered icon set
cp -R ./assets/AppIcon.appiconset/* "$ASSET_DIR/"

echo "✅ Layered app icon copied"

#add to package.json under scripts
#"eas-build-post-install": "./scripts/ios-layered-icon.sh"