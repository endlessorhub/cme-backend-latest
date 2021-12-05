#Should be executed as sudo and be downloaded apart

echo "Deleting previous repo"
rm -r /home/gitlab-ci/cme-backend
echo "Cloning Repo"
mkdir /home/gitlab-ci
cd /home/gitlab-ci
git clone https://gitlab+deploy-token-635521:PSUbjHSvT4s9DYBkS4Pm@gitlab.com/samy.f/cme-backend.git
chown -R admin:admin cme-backend
cd cme-backend

#echo "Pulling Repo"
#git pull https://gitlab+deploy-token-635521:PSUbjHSvT4s9DYBkS4Pm@gitlab.com/samy.f/cme-backend.git

echo "Making executables"
chmod u+x /home/gitlab-ci/cme-backend/init.sh
chmod u+x /home/gitlab-ci/cme-backend/boot.sh

echo "Deleting previous api"
docker container rm api

echo "Building dockers"
./init.sh

echo "Booting dockers"
./boot.sh
