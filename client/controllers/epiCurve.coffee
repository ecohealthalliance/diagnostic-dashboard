Template.epiCurve.rendered = (content) ->
  $("#epiCurve").text("fetching data...")

  #api_url = window.location.host.replace(/(:\d+)?$/, ":5000")
  #disease = Session.get("disease")
  #Meteor.http.get api_url + "/beta/counts?disease=#{disease}", (err, res) -> renderData
  
  Meteor.subscribe('caseCounts')
  Deps.autorun ()->
    result = window.grits.caseCounts.find({diseases:"Dengue"}).fetch()
    debouncedRenderData(null, result)

renderData = (err, res)->
  caseCounts = []
  deathCounts = []
  res.forEach (count)->
    if count.type == 'caseCount'
      if count.datetime?.value and count.value
        x = Number(count.datetime.value) / 1000
        caseCounts.push({
          x : x,
          y: count.value,
          id: count.itemId
        })
    if count.type == 'deathCount'
      if count.datetime?.value and count.value
        x = Number(count.datetime.value) / 1000
        deathCounts.push({
          x : x,
          y: count.value,
          id: count.itemId
        })
  
  caseCounts = _.sortBy(caseCounts, (c)-> c.x)
  deathCounts = _.sortBy(deathCounts, (c)-> c.x)
  
  scale = d3.scale.log().domain([.001, 1000])
  
  series = []
  if caseCounts.length > 0
    series.push({
      color: "#50c020",
      data: caseCounts,
      name: 'Case Counts',
      scale: scale
    })
  if deathCounts.length > 0
    series.push({
      color: "#c05020",
      data: deathCounts,
      name: 'Death Counts',
      scale: scale
    })

  #console.log caseCounts, deathCounts
  
  if series.length == 0
    return
  
  width = 400
  
  $("#epiCurve-container").html """
  <div id="epiCurve" style="margin:20px auto;width:#{width}px;"></div>
  <div id="legend"></div>
  """
  
  graph = new Rickshaw.Graph({
    element: $("#epiCurve")[0],
    renderer: 'scatterplot',
    width: width,
    series: series,
  })
  
  time = new Rickshaw.Fixtures.Time()
  x_axis = new Rickshaw.Graph.Axis.Time({
    graph: graph,
    timeUnit: time.unit('month'),
  })

  legend = new Rickshaw.Graph.Legend({
  	graph: graph,
  	element: $('#legend')[0]
  })
  
  graph.render()
  
  hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph,
    formatter: (series, x, y, xstr, ystr, obj) =>
      date = new Date(x  * 1000).toUTCString()
      count = parseInt(y)
      """
      <span class="detail_swatch" style="background-color:#{series.color}"></span>
      #{series.name} : #{count} <br>
      <span class="date">#{date}</span><br>
      Report Id: #{obj.value.id._str}
      """
  })

debouncedRenderData = _.debounce(renderData, 100)