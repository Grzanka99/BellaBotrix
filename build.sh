#!/bin/bash

rm -r dist/

mkdir -p dist/bot

cp -r ./apps/bot/bin/bellatrix ./dist/bot/
