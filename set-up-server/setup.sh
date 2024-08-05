sudo apt-get update

# Install NodeJS
sudo apt-get install -y git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 21
npm install -g yarn
npm install -g pm2

# ENV
cp ./env/fe.env ../frontend/.env
cp ./env/be.env ../backend/.env

# Run App
chmod +x ./run-app-pm2.sh
./run-app-pm2.sh


# Redis
sudo apt-get install -y redis-server

# Nginx
sudo apt-get install -y nginx
sudo cp ./nginx/game.conf /etc/nginx/sites-available/game
sudo cp ./nginx/game-api.conf /etc/nginx/sites-available/game-api
sudo ln -s /etc/nginx/sites-available/game /etc/nginx/sites-enabled/game
sudo ln -s /etc/nginx/sites-available/game-api /etc/nginx/sites-enabled/game-api
sudo systemctl restart nginx





