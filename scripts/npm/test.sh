#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIXD/interface/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

INTERFACE="$HYBRIXD/interface"

export PATH="$INTERFACE/node_binaries/bin:$PATH"

echo " [i] Running Interface tests"

node "$INTERFACE/test/lib/cli.js" --path="$INTERFACE/dist" | tee output

TEST_INTERFACE_OUTPUT=$(cat output)

SUCCESS_RATE=$(echo "$TEST_INTERFACE_OUTPUT" | grep "SUCCESS RATE")

# "      SUCCESS RATE :${PERCENTAGE}%' => "$PERCENTAGE"
PERCENTAGE=$(echo $SUCCESS_RATE| cut -d':' -f2  | cut -d'%' -f1)

if [ "$PERCENTAGE" -lt "80" ]; then
    echo " [!] Interface test failed!"
    echo "$TEST_INTERFACE_OUTPUT"
    rm output || true
    exit 1
else
    rm output || true
    echo " [v] Interface test succeeded."
    echo "$TEST_INTERFACE_OUTPUT"
fi


export PATH="$OLDPATH"
cd "$WHEREAMI"
