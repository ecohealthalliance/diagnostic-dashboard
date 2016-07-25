Template.map.rendered = () ->
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images'
  lMap = L.map(@$('#map')[0]).setView([49.25044, -123.137], 10)
  layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: """
    Map tiles by <a href="http://cartodb.com/attributions#basemaps">CartoDB</a>,
    nder <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.
    Data by <a href="http://www.openstreetmap.org/">OpenStreetMap</a>, under ODbL.
    <br>
    CRS:
    <a href="http://wiki.openstreetmap.org/wiki/EPSG:3857" >
    EPSG:3857
    </a>,
    Projection: Spherical Mercator""",
    subdomains: '1234',
    #This doesn't work, maybe due to the library update.
    #noWrap: true,
    minZoom: 1,
    maxZoom: 18
  }).addTo(lMap)
  L.control.scale().addTo(lMap)
  markers = new L.FeatureGroup()

  updateMarkers = ()=>
    locations = Session.get('locations')
    features = Session.get('features') || []

    lMap.removeLayer(markers)
    markers = new L.FeatureGroup()

    # Highlight selected features on the visulization
    selectedLocations = features.filter((feature)->
      feature.type == 'location'
    )

    locations.forEach((location)->
      color = if _.find(selectedLocations, (sl)->
        sl.geoname.name == location.location
      ) then @grits.services.adjustValue(location.color, -5) else '#9564BF'

      L.marker([location.latitude, location.longitude], {
        icon: L.divIcon({
          className: 'map-marker-container'
          iconSize:null
          html:"""
          <div class="map-marker" style="color:#{color};">
          </div>
          """
        })
      }).addTo(markers).bindPopup(
        Blaze.toHTMLWithData(Template.mapPopup, {
          location: location
        })
      )
    )
    markers.addTo(lMap)

  updateMarkers()
  lMap.fitBounds(markers.getBounds())
  @autorun updateMarkers
