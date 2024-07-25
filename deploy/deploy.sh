#!/bin/bash

# Delete all PM2 processes with names 'game-fe' and 'game-api'
pm2 delete game-fe
pm2 delete game-api

# Fetch and pull new source code
git fetch
git pull

# Navigate to the frontend directory, build the project, and start it with PM2
cd ./frontend
yarn build
pm2 start npm --name game-fe -- start

# Navigate to the backend directory, build the project, and start it with PM2
cd ../backend
yarn build
pm2 start npm --name game-api -- start

# Done
echo "Deployment completed!"
