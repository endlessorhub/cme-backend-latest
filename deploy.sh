echo "Cloning Repo"
mkdir /home/gitlab-ci
cd /home/gitlab-ci
git clone https://gitlab+deploy-token-635521:PSUbjHSvT4s9DYBkS4Pm@gitlab.com/samy.f/cme-backend.git
cd cme-backend

echo "Pulling Repo"
git pull https://gitlab+deploy-token-635521:PSUbjHSvT4s9DYBkS4Pm@gitlab.com/samy.f/cme-backend.git

echo "Making executables"
chmod u+x /home/gitlab-ci/cme-backend/init.sh
chmod u+x /home/gitlab-ci/cme-backend/boot.sh

echo "Building dockers"
sudo ./init.sh

echo "Booting dockers"
sudo ./boot.sh