# Events Tracking Map Demo - GeoServer/PostGIS/MapStore 

- [Events tracking map demo](#events-tracking-map-demo)
  - [Tested environments](#tested-environments)
  - [Denver Crime layers and variables](./denver-crime.md#denver-layers-and-variables)
    - [crime_location](./denver-crime.md#crime_location)
    - [crime_location_full](./denver-crime.md#crime_location_full)
    - [precints](./denver-crime.md#precints)
    - [crimes_precint](./denver-crime.md#crimes_precint)
    - [hex_cluster_ytd](./denver-crime.md#hex_cluster_ytd)
    - [point_cluster_ytd](./denver-crime.md#point_cluster_ytd)
    - [square_cluster_ytd](./denver-crime.md#square_cluster_ytd)
    - [Providing parameters to SQL views](./denver-crime.md##providing-parameters-to-sql-views)  
  - [New York Crime layers and variables](./new-york-crime.md#new-york-layers-and-variables)
    - [event](./new-york-crime.md#event)
    - [region](./new-york-crime.md#region)
    - [event_region](./new-york-crime.md#event_region)
    - [hex_cluster_ytd](./new-york-crime.md#hex_cluster_ytd)
    - [point_cluster_ytd](./new-york-crime.md#point_cluster_ytd)
    - [square_cluster_ytd](./new-york-crime.md#square_cluster_ytd)
    - [Providing parameters to SQL views](./new-york-crime.md##providing-parameters-to-sql-views)
  - [New York 311 layers and variables](./new-york-311.md#new-york-layers-and-variables)
    - [event](./new-york-311.md#event)
    - [region](./new-york-311.md#region)
    - [event_region](./new-york-311.md#event_region)
    - [hex_cluster_ytd](./new-york-311.md#hex_cluster_ytd)
    - [point_cluster_ytd](./new-york-311.md#point_cluster_ytd)
    - [square_cluster_ytd](./new-york-311.md#square_cluster_ytd)
    - [Providing parameters to SQL views](./new-york-311.md##providing-parameters-to-sql-views)

## Events tracking map demo

This repository contains a GeoServer data directory for the event demo map. In particular, it provides:
- A ``datadir`` with the definition of workspaces, database connections, layers and styles to create the layers for the Denver Crime Map, New York Crime Map and New York 311 Service Request Map.
- A `sql` folder containing scripts to load New York and Denver crime locations and police precincts as well as 311 SR locations and community districts.
- A Docker compose file that sets up a GeoServer running on said data directory, and a PostgreSQL/PostGIS database loaded with the data, already setup to talk with each other

Before using the machinery above, a ``.env`` file needs to be created, in this directory. The file will contain a couple of 
setup parameters for the PostgreSQL database, e.g.:

```
POSTGRES_PASSWORD=secretpassword
POSTGRES_DB=events-tracker
```

For the time being, keep the file as above, as the GeoServer data directory is using those exact values. This is suitable for development, we'll make it fully parametric later down the road.

Before starting the project you will need to download the New York crime data from NYC Open Data by following [these instruction](./nyc-open-data-crime.md) as well as the 311 data by following [these instruction](./nyc-open-data-311.md).

Once you have an ``new-york-crime.csv`` file downloaded to the ``sql`` folder in this project, just run ``start.sh`` to build the web clients and start up PostgreSQL and GeoServer.

You will know that your data has been completely loaded wehen your console contains all three of the following messages:

  ```
  ...
  postgres_1   |
  postgres_1   | Denver Crime data load COMPLETED!
  postgres_1   |
  ...
  postgres_1   |
  postgres_1   | New York Crime data load COMPLETED!
  postgres_1   |
  ...
  postgres_1   |
  postgres_1   | New York 311 data load COMPLETED!
  postgres_1   |
  ...
  ```
GeoServer runs at http://localhost:8888/geoserver
Denver -Crime Map runs at http://localhost:8888/denver
New York - Crime Map runs at http://localhost:8888/new-york
New York - 311 SR Map runs at http://localhost:8888/nyc-311

 `CTRL-C` will Kill the process and shut down the two docker containers. Use ``clean.sh`` to remove the clients, containers and PostgreSQL data.  ``clean.sh --saveData`` will allow the PostgreSQL data to persist and avoid reloading on the next start.

## Tested environments

Linux machine: 
- Linux Mint 20.1
- Docker version 20.10.5, build 55c4c88
- docker-compose version 1.25.0

Windows machine
- Microsoft Windows [Version 10.0.19042.1348]
- Ubuntu 20.04.2 LTS (WSL 2 distro)
- Docker version 20.10.10, build b485636
- docker-compose version 1.29.2, build 5becea4c
