#!/bin/sh

DIR="Pick-O"
VERSION=`grep \"version\" ${DIR}/manifest.json | cut -f 2 -d : | cut -f1 -d , | sed s/\"\//g | sed s/\s//g | tr '.' '_'| sed 's/ //g'`
echo "Publishing -- Pickem - $VERSION"

DEST="${DIR}_${VERSION}"
if [ -e $DEST ]
then 
	echo "$DEST already exist"
	exit
fi

echo "mkdir $DEST"
mkdir $DEST

for FILE in extension.js webActions.js manifest.json images/
do
	echo "(cd ${DIR}; cp -pr $FILE ../${DEST}/)"
	(cd ${DIR}; cp -pr $FILE ../${DEST}/)
done

echo ""
echo "List Files"
echo "-----------------------------------------------------------------------"
find ${DEST} -print
