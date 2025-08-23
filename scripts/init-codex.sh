#! /bin/bash

set -e
npm install -g @openai/codex
cd /workspace
nvm use 22
yarn install
codex --sandbox danger-full-access
