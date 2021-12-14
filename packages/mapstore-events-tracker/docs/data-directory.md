
# Data directory

This section shows how to create a data directory

- clone the repository

```bash
git clone https://github.com/geosolutions-it/mapstore-events-tracker.git
```

- navigate in the repository folder and install the node dependencies

```bash
cd mapstore-events-tracker
```

```bash
npm install
```

- run the creation script with the destination folder as argument

```bash
npx mapstore-events-tracker create ../my-project
```

*This script creates a new folder with all the needed static configuration that can be overrides to fit the needs of a specific dataset*

- add a new .env file to mapstore-events-tracker folder

```bash
touch .env
```

- add the variable to define the new data directory target in the .env file

```bash
# targets path for static files overrides: assets, configs and translations
DATA_DIRECTORY_PATH=../my-project/data
```

This is the final directories structure with the new data directory. now it's possible to use the compile and start script inside the mapstore-events-tracker folder using the static file from the my-project/data directory

```
workspace/
|-- ...
|-- mapstore-events-tracker/
|    |-- ...
|    |-- .env
|    +-- ...
|-- my-project/
|    |-- data/
|    +-- ...
|-- ...
```
