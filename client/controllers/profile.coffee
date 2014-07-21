Template.profile.username = () ->
  @user?.emails?[0]?.address

Template.profile.tableSettings = () ->
  fields: [
    {
      key: 'createDate'
      label: 'Date'
      sort: -1
      fn: (date) ->
        date = if date then new Date(date) else new Date(0)
        dateString = date.toDateString()
        isoString = date.toISOString()
        new Spacebars.SafeString("<span value=#{isoString}>#{dateString}</span>")
    },
    {
      key: 'diseases'
      label: 'Diagnosis'
      fn: (diseases) ->
        diseaseNames = (disease.name for disease in diseases)
        diseaseNames.join(", ")
    },
    {
      key: 'content'
      label: 'Content'
      fn: (content) ->
        if content.length > 100 then content.slice(0, 100) + '...' else content
    }
  ]
  group: 'profile'

Template.profile.events
  "click .dashboard-list .reactive-table tbody tr" : (event) ->
    Router.go 'dash', {_id: @_id}
