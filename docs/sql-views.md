
# GeoServer SQL view layers statements

This section shows all the SQL view layers created starting from the `event` and `region` tables.

## event_full

```sql
SELECT
  event.id as id,
  event.the_geom,
  event.type,
  event.month,
  event.region_name,
  region.population as region_population,
  region.group_name
FROM  nyc311.event event
FULL JOIN nyc311.region region
ON event.region_name = region.name
```

## event_region

statement:
```sql
SELECT
  r.id,
  r.the_geom,
  r.group_name,
  r.population,
  r.name,
  COALESCE(e.event_count, 0)::bigint AS event_count
FROM (
    SELECT COUNT(*) as event_count, region_name
    FROM nyc311.event
    WHERE type IN (%event_type%)
          AND month BETWEEN %min_mo% AND %max_mo%
    GROUP BY region_name
  ) e
  FULL JOIN nyc311.region r ON r.name = e.region_name
```
parameters:
- event_type
- max_mo
- min_mo

statement:
```sql
SELECT
  r.id,
  r.the_geom,
  r.group_name,
  r.population,
  r.name,
  e.type,
  COALESCE(e.event_count, 0)::bigint AS event_count
FROM (
    SELECT COUNT(*) as event_count, type, region_name
    FROM nyc311.event
    WHERE type IN (%event_type%)
          AND month BETWEEN %min_mo% AND %max_mo%
    GROUP BY region_name, type
  ) e
  FULL JOIN nyc311.region r ON r.name = e.region_name
```

parameters:
- event_type
- max_mo
- min_mo

## hex_cluster_ytd

statement:
```sql
SELECT count(1),
  hexes.i,
  hexes.j,
  hexes.the_geom
FROM (
  SELECT ST_SetSRID(geom, 4326) AS the_geom, i, j
  FROM ST_HexagonGrid(%r%, ST_MakeEnvelope(-74.2, 40.4, -73.6, 41))) AS hexes
       INNER JOIN
         (SELECT * 
          FROM nyc311.event 
          WHERE month BETWEEN %mo_min% AND %mo_max%
          AND type IN (%event_type%)
          :where_clause:
) AS e ON ST_Intersects(hexes.the_geom, e.the_geom)
GROUP BY hexes.i, hexes.j, hexes.the_geom
```

parameters:
- r
- event_type
- max_mo
- min_mo

## hex_cluster_ytd_gt

statement:
```sql
SELECT count(1),
  hexes.i,
  hexes.j,
  hexes.the_geom,
  e.type
FROM (
  SELECT ST_SetSRID(geom, 4326) AS the_geom, i, j
  FROM ST_HexagonGrid(%r%, ST_MakeEnvelope(-74.2, 40.4, -73.6, 41))) AS hexes
       INNER JOIN
         (SELECT * 
          FROM nyc311.event 
          WHERE month BETWEEN %mo_min% AND %mo_max%
          AND type IN (%event_type%)
          :where_clause:) AS e
  ON ST_intersects(hexes.the_geom, e.the_geom)
GROUP BY hexes.i, hexes.j, hexes.the_geom, e.type
```

parameters:
- r
- event_type
- max_mo
- min_mo


## point_cluster_ytd

statement:
```sql
SELECT
  count(1) count,
  x_round, 
  y_round,
  ST_MakePoint(percentile_disc(0.5) WITHIN GROUP (ORDER BY x),
  percentile_disc(0.5) WITHIN GROUP (ORDER BY y)) as the_geom
FROM (
  SELECT
    the_geom,
    ST_X(the_geom) AS x,
    ST_Y(the_geom) AS y,
    round(ST_X(the_geom) / %r%) * %r% AS x_round,
    round(ST_Y(the_geom) / %r%) * %r% AS y_round
  FROM
    nyc311.event
  WHERE 
    month BETWEEN %mo_min% AND %mo_max%
    AND type IN (%event_type%)
    :where_clause:
) agg GROUP BY x_round, y_round
```

parameters:
- r
- event_type
- max_mo
- min_mo

## point_cluster_ytd_gt

statement:
```sql
select
  count(1) count,
  type,
  x_round, 
  y_round,
  st_makepoint(percentile_disc(0.5) WITHIN GROUP (ORDER BY x),
  percentile_disc(0.5) WITHIN GROUP (ORDER BY y)) as the_geom
FROM (
  select
    the_geom,
    type,
    ST_X(the_geom) AS x,
    ST_Y(the_geom) AS y,
    round(ST_X(the_geom) / %r%) * %r% AS x_round,
    round(ST_Y(the_geom) / %r%) * %r% AS y_round
  FROM
    nyc311.event
  WHERE 
    month between %mo_min% and %mo_max%
    and type IN (%event_type%)
    :where_clause:
) agg GROUP BY x_round, y_round, type
```

parameters:
- r
- event_type
- max_mo
- min_mo

## square_cluster_ytd

statement:
```sql
select
  count(1) count,
  x_round,
  y_round,
  st_makepolygon(st_makeline(
    ARRAY[
        st_makepoint(x_round - %r% / 2, y_round - %r% / 2),
        st_makepoint(x_round - %r% / 2, y_round + %r% / 2),
        st_makepoint(x_round + %r% / 2, y_round + %r% / 2),
        st_makepoint(x_round + %r% / 2, y_round - %r% / 2),
        st_makepoint(x_round - %r% / 2, y_round - %r% / 2)
    ]
 )) as the_geom 
FROM (
  select
    the_geom,
    ST_X(the_geom) AS x,
    ST_Y(the_geom) AS y,
    round(ST_X(the_geom) / %r%) * %r% AS x_round,
    round(ST_Y(the_geom) / %r%) * %r% AS y_round
  FROM
     nyc311.event 
  WHERE
   month between %mo_min% and %mo_max%
   and type IN (%event_type%)
   :where_clause:
) agg GROUP BY x_round, y_round
```
parameters:
- r
- event_type
- max_mo
- min_mo

## square_cluster_ytd_gt


statement:
```sql
SELECT
  count(1) count,
  type,
  x_round,
  y_round,
  ST_MakePolygon(st_makeline(
    ARRAY[
        ST_MakePoint(x_round - %r% / 2, y_round - %r% / 2),
        ST_MakePoint(x_round - %r% / 2, y_round + %r% / 2),
        ST_MakePoint(x_round + %r% / 2, y_round + %r% / 2),
        ST_MakePoint(x_round + %r% / 2, y_round - %r% / 2),
        ST_MakePoint(x_round - %r% / 2, y_round - %r% / 2)
    ]
 )) AS the_geom 
FROM (
  SELECT
    the_geom,
    type,    
    ST_X(the_geom) AS x,
    ST_Y(the_geom) AS y,
    round(ST_X(the_geom) / %r%) * %r% AS x_round,
    round(ST_Y(the_geom) / %r%) * %r% AS y_round
  FROM
    nyc311.event 
  WHERE
   month BETWEEN %mo_min% AND %mo_max%
   AND type IN (%event_type%)
   :where_clause:
) agg GROUP BY x_round, y_round, type
```

parameters:
- r
- event_type
- max_mo
- min_mo
