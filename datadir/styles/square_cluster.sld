<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
                       xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
                       xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
                       xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>square_cluster</Name>
    <UserStyle>
      <Title>A dark yellow polygon style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>dark yellow polygon</Title>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>count</ogc:PropertyName>

                  <ogc:Literal>0</ogc:Literal>
                  <ogc:Literal>#fefeee</ogc:Literal>

                  <ogc:Literal>1000</ogc:Literal>
                  <ogc:Literal>#00ff00</ogc:Literal>

                  <ogc:Literal>10000</ogc:Literal>
                  <ogc:Literal>#ff0000</ogc:Literal>

                  <ogc:Literal>color</ogc:Literal>
                </ogc:Function>
              </CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>

        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>