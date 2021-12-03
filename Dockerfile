# Edit the Dockerfile according the the geoserver tag you want to build from and the plugins
# URL you need and then build the image with:
# 
# ```
# docker build . -t geosolutionsit/geoserver:C205
# ```
# 
# Then login on the docker hub and push the image
# 
# ```
# docker login
# docker push geosolutionsit/geoserver:C205
# ```

FROM geosolutionsit/geoserver:2.18.2

RUN mkdir ./plugins
RUN curl -L \
  'https://sourceforge.net/projects/geoserver/files/GeoServer/2.18.2/extensions/geoserver-2.18.2-vectortiles-plugin.zip/download' \
  -o ./geoserver-2.18.2-vectortiles-plugin.zip

RUN curl -L \
  'https://sourceforge.net/projects/geoserver/files/GeoServer/2.18.2/extensions/geoserver-2.18.2-wps-plugin.zip/download' \
  -o ./geoserver-2.18.2-wps-plugin.zip

RUN unzip -o './*zip' -d ${CATALINA_BASE}/webapps/geoserver/WEB-INF/lib/ \
  && rm -rf ./*zip

