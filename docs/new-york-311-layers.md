## New York layers and variables

### event

Reports locations of each event, with a type and a date expressed as a number in ``YYYYMM`` format.
This layer ddirectly publishes the event table from the database.

#### event.type
  - Noise - Residential
  - Illegal Parking
  - Noise - Street/Sidewalk
  - HEAT/HOT WATER
  - Blocked Driveway

![event](img/311_event.png)

### event_full

Same as event, but provides information about the region and the group name.

### region

The region, with name and population.

![region](img/311_region.png)


### event_region

Reports the region, the event count, and the event count per 1000 inhabitants.

![event region](img/311_event_region.png)

This layer is a SQL view based on the ``event_region`` function. It accepts the following variables:

* ``max_mo``: maximum month for time filters, expressed as ``YYYYmm``. Defaults to 202112.
* ``min_mo``: minimum month for time filters, expressed as ``YYYYmm``. Defaults to 202101.
* ``event_type``: comma separated list of event types, expressed as SQL strings. Defaults to ``'Noise', 'Noise - Commercial', 'Noise - Helicopter', 'Noise - House of Worship', 'Noise - Park', 'Noise - Residential', 'Noise - Street/Sidewalk', 'Noise - Vehicle'``.

### hex_cluster_ytd

Reports a count of event in hexagonal areas.

![hex cluster](img/311_hex_cluster_ytd.png)

This layer is a SQL view and accepts the following variables:

* ``r``: the hexagon radius, defaults to ``0.003`` (in decimal degrees)
* ``max_mo``: maximum month for time filters, expressed as ``YYYYmm``. Defaults to 202102.
* ``min_mo``: minimum month for time filters, expressed as ``YYYYmm``
* ``event_type``: comma separated list of event types, expressed as SQL strings. Defaults to ``'Noise', 'Noise - Commercial', 'Noise - Helicopter', 'Noise - House of Worship', 'Noise - Park', 'Noise - Residential', 'Noise - Street/Sidewalk', 'Noise - Vehicle'``.

### point_cluster_ytd

Clusters points over a regular grid, and reports for each grid cell the count of event, with a point whose position is the centroid of the event accumulated in the cell.

![point cluster](img/311_point_cluster_ytd.png)

This layer is a SQL view and accepts the following variables:

* ``r``: the cell width, defaults to ``0.005`` (in decimal degrees)
* ``max_mo``: maximum month for time filters, expressed as ``YYYYmm``. Defaults to 202102.
* ``min_mo``: minimum month for time filters, expressed as ``YYYYmm``
* ``event_type``: comma separated list of event types, expressed as SQL strings. Defaults to ``'Noise', 'Noise - Commercial', 'Noise - Helicopter', 'Noise - House of Worship', 'Noise - Park', 'Noise - Residential', 'Noise - Street/Sidewalk', 'Noise - Vehicle'``.

### square_cluster_ytd

Clusters points over a regular grid, and reports for each grid cell the count of event.

![square cluster](img/311_square_cluster_ytd.png)

This layer is a SQL view and accepts the following variables:

* ``r``: the cell width, defaults to ``0.005`` (in decimal degrees)
* ``max_mo``: maximum month for time filters, expressed as ``YYYYmm``. Defaults to 202102.
* ``min_mo``: minimum month for time filters, expressed as ``YYYYmm``
* ``event_type``: comma separated list of event types, expressed as SQL strings. Defaults to ``'Noise', 'Noise - Commercial', 'Noise - Helicopter', 'Noise - House of Worship', 'Noise - Park', 'Noise - Residential', 'Noise - Street/Sidewalk', 'Noise - Vehicle'``.

### "_gt" views

The layers ending with "_gt" are copies of the aggregating layers listed above, but provide for each aggregation unit
a detail of event aggregated by type, rather than full count. The base layer and the one grouped by type typically share
some attributes to relate them with each other. For the ``event_region_gt`` the ``region.name`` attribute is the obvious choice.
For others, which are grid based, a rounded coordinate or a grid row/col indication is provided instead.

## Providing parameters to SQL views

The SQL View parameters can be provided, in WMS and WFS requests, as part of the URL, using the ``viewparams`` parameter. The various parameters are separated by semicolon, while the comma is used to separate the groups of parameters belonging to different layers (should there be multiple SQL View based layers in the same request). 

This poses a challenge if one of the parameter values requires to use a comma. For this case, the comma can be escaped with a backslash, which also needs to be percent encoded in the URL.

Here is an example viewparam:

``viewparams=mo_min:202012;mo_max:202101;event_type:%27Noise%20-%20Residential%27%5C,%27Noise%20-%20Vehicle%27``

It sets the following values:
* ``mo_min``: ``202012``
* ``mo_max``: ``202101``
* ``event_type``: ``'Noise - Residential', 'Noise - Vehicle'``
