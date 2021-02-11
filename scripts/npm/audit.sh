#!/bin/sh
WHEREAMI="`pwd`";
OLDPATH="$PATH"

# $INTERFACE/scripts/npm  => $INTERFACE
SCRIPTDIR="`dirname \"$0\"`"
INTERFACE="`cd \"$SCRIPTDIR/../..\" && pwd`"

export PATH="$INTERFACE/node_binaries/bin:$PATH"

cd "$INTERFACE"
echo "[.] Auditing interface..."
npm i
npm update
npm audit fix --force

export PATH="$OLDPATH"
cd "$WHEREAMI"
