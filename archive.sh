#!/bin/bash
echo "📦 Starting archive process..."
echo "⚠️  Make sure Xcode is CLOSED before running this"
echo ""

cd ios

# Clean first
echo "🧹 Cleaning..."
xcodebuild clean -workspace housetabzrn.xcworkspace -scheme housetabzrn -configuration Release

# Archive
echo "📦 Archiving (this may take 5-10 minutes)..."
xcodebuild archive \
  -workspace housetabzrn.xcworkspace \
  -scheme housetabzrn \
  -configuration Release \
  -archivePath ~/housetabz-archive.xcarchive \
  -allowProvisioningUpdates \
  EXCLUDED_ARCHS="arm64" \
  ONLY_ACTIVE_ARCH=NO

echo ""
if [ -d ~/housetabz-archive.xcarchive ]; then
  echo "✅ Archive created successfully at: ~/housetabz-archive.xcarchive"
  echo "📊 Archive size: $(du -sh ~/housetabz-archive.xcarchive | cut -f1)"
  echo ""
  echo "Next steps:"
  echo "1. Open Xcode → Window → Organizer"
  echo "2. Select your archive"
  echo "3. Click 'Distribute App'"
else
  echo "❌ Archive failed - check errors above"
fi

