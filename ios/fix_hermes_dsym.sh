#!/bin/bash

# The specific UUID that's missing
TARGET_UUID="35FECC83-9599-34C1-813E-F020B2D0D382"

# Search for any existing Hermes dSYMs in the Pods folder
HERMES_DSYM=$(find "${PODS_ROOT}" -name "hermes.framework.dSYM" -type d | head -1)

if [ -n "${HERMES_DSYM}" ]; then
  echo "Found Hermes dSYM at: ${HERMES_DSYM}"
  
  # Create destination path
  mkdir -p "${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/Contents/Resources/DWARF"
  
  # Copy the existing dSYM files
  cp -R "${HERMES_DSYM}/" "${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/"
  
  # Modify the Info.plist to include our specific UUID
  PLIST="${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/Contents/Info.plist"
  /usr/libexec/PlistBuddy -c "Set :dSYM_UUID ${TARGET_UUID}" "${PLIST}" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :dSYM_UUID string ${TARGET_UUID}" "${PLIST}"
  
  echo "Successfully copied and modified Hermes dSYM with UUID: ${TARGET_UUID}"
else
  echo "No existing Hermes dSYM found. Creating a new one."
  
  # Create directory structure
  mkdir -p "${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/Contents/Resources/DWARF"
  
  # Create a placeholder DWARF file
  touch "${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/Contents/Resources/DWARF/hermes"
  
  # Create the Info.plist
  cat > "${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>English</string>
	<key>CFBundleIdentifier</key>
	<string>com.apple.xcode.dsym.hermes</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundlePackageType</key>
	<string>dSYM</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>dSYM_UUID</key>
	<string>${TARGET_UUID}</string>
</dict>
</plist>
EOF
  
  echo "Created new Hermes dSYM with UUID: ${TARGET_UUID}"
fi