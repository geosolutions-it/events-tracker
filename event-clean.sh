docker-compose -f docker-compose.yml -f docker-compose.override.yml down;
cd client
apps=(*/)
for app in "${apps[@]}";
do
  rm -rf $app/dist
done
cd ..
if [ "${#@}" == "0" ] || [ "$1" != "--saveData" ]
then
  rm -rf ./data
else
  echo Postgres data folder saved
fi