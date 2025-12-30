#!/bin/bash
cd /home/kavia/workspace/code-generation/browser-notes-51381-51390/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

