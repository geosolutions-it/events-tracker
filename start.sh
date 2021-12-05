docker-compose down
cd client
apps=(*/)
for app in "${apps[@]}"; 
do
  if [ ! -d ./client/$app/dist ]
  then
    echo building mapstore-events-tracker ${app::-1}
    cd $app
    ./build.sh
    cd ../
  fi
done
cd ../
CURRENT_UID=$(id -u):$(id -g) docker-compose up
