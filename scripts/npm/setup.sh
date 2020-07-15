#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`

# $HYBRIXD/interface/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

NODEJS="$HYBRIXD/nodejs"
COMMON="$HYBRIXD/common"

if [  -e "$HYBRIXD/hybrix-jslib"  ]; then
    URL_COMMON="https://github.com/hybrix-io/common.git"
    URL_NODEJS="https://github.com/hybrix-io/nodejs.git"
    URL_NODE="https://github.com/hybrix-io/hybrixd.git"
    NODE="$HYBRIXD/hybrixd"
    INTERFACE="$HYBRIXD/hybrix-jslib"
    ENVIRONMENT="public"
    echo "[i] Environment is public..."
elif [  -e "$HYBRIXD/interface" ]; then
    URL_COMMON="https://gitlab.com/hybrix/hybrixd/common.git"
    URL_NODEJS="https://www.gitlab.com/hybrix/hybrixd/dependencies/nodejs.git"
    URL_NODE="https://www.gitlab.com/hybrix/hybrixd/node.git"
    INTERFACE="$HYBRIXD/interface"
    NODE="$HYBRIXD/node"
    ENVIRONMENT="dev"
    echo "[i] Environment is development..."
else
    echo "[!] Unknown Environment"
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1
fi

if [ "`uname`" = "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ "`uname -m`" = "i386" ] || [ "`uname -m`" = "i686" ] || [ "`uname -m`" = "x86_64" ]; then
    SYSTEM="linux-x64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1;
fi

# INTERFACE
if [ "$ENVIRONMENT" = "public" ]; then
    if [ ! -e "$HYBRIXD/interface" ];then
        echo "[i] linking hybrix-libjs to interface folder."
        ln -sf "$HYBRIXD/hybrix-libjs" "$HYBRIXD/interface"
    else
        echo "[i] interface folder exists."
    fi
fi

# NODE_BINARIES
if [ ! -e "$INTERFACE/node_binaries" ];then

    echo "[!] node_binaries not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIXD"
        echo "[i] Clone node js runtimes files"
        git clone "$URL_NODEJS"
    fi
    echo "[i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$INTERFACE/node_binaries"
fi
export PATH="$INTERFACE/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$INTERFACE/common" ];then

    echo "[!] common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIXD"
        echo "[i] Clone common files"
        git clone "$URL_COMMON"

    fi
    echo "[i] Link common files"
    ln -sf "$COMMON" "$INTERFACE/common"

fi

# NODE
if [ ! -e "$HYBRIXD/node" ];then
    echo "[!] node not found."
    cd "$HYBRIXD"
    echo "[i] Clone node files"
    git clone "$URL_NODE"
    ln -sf "hybrixd" "node"

    echo "[i] Run node setup"
    sh "$NODE/scripts/npm/setup.sh"
fi

# GIT HOOKS
sh "$COMMON/hooks/hooks.sh" "$INTERFACE"

export PATH="$OLDPATH"
cd "$WHEREAMI"
