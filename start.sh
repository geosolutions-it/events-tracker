apps=( "new-york" )
for i in ${!apps[@]};
do
  app=${apps[$i]}
if [ ! -d ./client/$app/dist ]
then
  mapstore=$(grep -oP '(?<="mapstore-events-tracker": ")[^"]*' client/$app/package.json)
  echo building $app from mapstore-events-tracker $mapstore
  cd client/$app
  ./build.sh
  cd ../../
fi
done
CURRENT_UID=$(id -u):$(id -g) docker-compose up
