<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
                       xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
                       xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
                       xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>stack</Name>
    <UserStyle>
      <Title>azure square point style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>azure point</Title>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#0033cc</CssParameter>
                  <CssParameter name="fill-opacity">0.5</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="fill">#0000cc</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Div>
                  <ogc:PropertyName>count</ogc:PropertyName>
                  <ogc:Literal>200</ogc:Literal>
                </ogc:Div>
              </Size>
            </Graphic>
          </PointSymbolizer>          
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>