#!/bin/sh
OLDPATH=$PATH
WHEREAMI=$(pwd)

echo "[i] Install sshpass"
apt-get -qq update
apt-get -qq install -y sshpass;

VERSION="v"$(cat package.json | grep version | cut -d'"' -f4)
echo "[i] Version $VERSION"

echo "[.] Copying to latest folder"
rsync -ra --rsh="$RELEASE_OPTIONS" "./hybrix-lib.web.js" "$RELEASE_TARGET/hybrix-jslib/latest/hybrix-lib.web.js"
rsync -ra --rsh="$RELEASE_OPTIONS" "./hybrix-lib.nodejs.js" "$RELEASE_TARGET/hybrix-jslib/latest/hybrix-lib.nodejs.js"

echo "[.] Copying to version folder"
rsync -ra --rsync-path="mkdir -p $RELEASE_DIR/hybrix-jslib/$VERSION/ && rsync" --rsh="$RELEASE_OPTIONS" "./hybrix-lib.web.js" "$RELEASE_TARGET/hybrix-jslib/$VERSION/hybrix-lib.web.js"
rsync -ra --rsh="$RELEASE_OPTIONS" "./hybrix-lib.nodejs.js" "$RELEASE_TARGET/hybrix-jslib/$VERSION/hybrix-lib.nodejs.js"

export PATH="$OLDPATH"
cd "$WHEREAMI"
exit 0
