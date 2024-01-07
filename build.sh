#!/bin/bash

rm -r dist/

mkdir -p dist/bot
mkdir -p dist/web

cp -r ./apps/bot/bin/bellatrix ./dist/bot/
cp -r ./apps/web/.output/* ./dist/web/
