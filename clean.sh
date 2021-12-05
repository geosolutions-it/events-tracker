docker-compose down
cd client
apps=(*/)
for app in "${apps[@]}"; 
do 
  rm -rf $app/dist
done