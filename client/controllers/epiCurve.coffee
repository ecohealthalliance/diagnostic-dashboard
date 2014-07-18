Template.epiCurve.rendered = (content) ->
  Deps.autorun ()->
    debouncedRenderEpiCurve(grits.Girder.Items.find().fetch())

offsetDifference = (a,b)->
  if a['textOffsets'][0][0] > b['textOffsets'][0][0]
    return offsetDifference(b,a)
  return b['textOffsets'][0][0] - a['textOffsets'][0][1]

countTypes = ["caseCount", "hospitalizationCount", "deathCount"]

renderEpiCurve = (reports)->
  $("#epiCurve").text("fetching data...")
  allCounts = []
  reports.forEach (report)->
    counts = []
    datetimes = []
    report.meta.diagnosis?.features.forEach (f)->
      if f.type == 'datetime'
        datetimes.push(f)
      if _.contains(countTypes, f.type)
        counts.push(f)
    
    # Annotate counts with datetimes based on proximity
    for count in counts
      for dt in datetimes
        if 'datetime' in count
          if offsetDifference(count, dt) >= offsetDifference(count['datetime'], dt)
            continue
        if offsetDifference(count, dt) < 300
            count['datetime'] = dt
            
    for count in counts
      if count.datetime?.value and count.value
        allCounts.push(_.extend(count, {
          x : Number(count.datetime.value) / 1000,
          y : count.value,
          # Rickshaw stringifies the objects that it plots
          # for some reason. Putting the report properties
          # in the prototype prevent them from being stringified
          # and creating a circular structure.
          report : Object.create(report)
        }))
  
  allCounts = _.sortBy(allCounts, (c)-> c.x)
  
  series = []
  if allCounts.length > 0
    min = _.first(allCounts).x
    max = _.last(allCounts).x
    stepSize = (max - min) / 16
    timeRange = _.range(min, max, stepSize).concat(max)
    createAproxData = (type)->
      _.map(timeRange, (x)->
          counts = []
          for count in allCounts
            if count.x <= x - stepSize
              continue
            if count.x > x + stepSize
              break
            if count.type == type
              counts.push(count.y)
          median = 0
          if counts.length > 0
            median = _.sortBy(counts, _.identity)[Math.floor(counts.length / 2)]
          return {
            x : x,
            y : median
          }
      )
    caseCounts = _.where(allCounts, {type : 'caseCount'})
    if caseCounts.length > 0
      series.push({
        color: "#50c020",
        data: caseCounts,
        name: 'Case Counts',
        renderer: 'scatterplot'
      })
      series.push({
        color: "#90c050",
        data: createAproxData('caseCount'),
        name: 'Case Count Aprox.',
        renderer: 'line'
      })
    deathCounts = _.where(allCounts, {type : 'deathCount'})
    if deathCounts.length > 0
      series.push({
        color: "#c05020",
        data: deathCounts,
        name: 'Death Counts',
        renderer: 'scatterplot'
      })
      series.push({
        color: "#c09050",
        data: createAproxData('deathCount'),
        name: 'Death Count Aprox.',
        renderer: 'line'
      })
  
    hospitalizationCounts = _.where(allCounts, {type : 'hospitalizationCount'})
    if hospitalizationCounts.length > 0
      series.push({
        color: "#5020c0",
        data: hospitalizationCounts,
        name: 'Hospitalization Counts',
        renderer: 'scatterplot'
      })
      series.push({
        color: "#9050c0",
        data: createAproxData('hospitalizationCount'),
        name: 'Hospitalization Count Aprox.',
        renderer: 'line'
      })
  
  $("#cc-chart-container").html """
  <div id="y_axis"></div>
  <div id="timeseries-plot"></div>
  <div id="legend"></div>
  """
  
  graph = new Rickshaw.Graph({
    element: $("#timeseries-plot")[0],
    renderer: 'multi',
    series: series
  })
  
  y_ticks = new Rickshaw.Graph.Axis.Y({
    graph: graph,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axis')
  })
  
  time = new Rickshaw.Fixtures.Time()
  x_axis = new Rickshaw.Graph.Axis.Time({
    graph: graph,
    timeUnit: time.unit('year')
  })

  if series.length > 0
    legend = new Rickshaw.Graph.Legend({
    	graph: graph,
    	element: $('#legend')[0]
    })
  
  hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph,
    formatter: (series, x, y, xstr, ystr, obj) =>
      date = new Date(x  * 1000).toUTCString()
      count = parseInt(y)
      cumulative = if obj.value.cumulative then "(cumulative)" else ""
      report = obj.value.report
      repDesc = if report then "Report: #{report.description}" else ""
      """
      <span class="detail_swatch" style="background-color:#{series.color}"></span>
      #{series.name} : #{count} #{cumulative}<br>
      <span class="date">#{date}</span><br>
      #{repDesc}
      """
  })
  
  graph.render()

# Debouncing prevents this from running on every element
# insertion.
debouncedRenderEpiCurve = _.debounce(renderEpiCurve, 300)
