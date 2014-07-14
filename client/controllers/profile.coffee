Template.profile.username = () ->
  @user?.emails?[0]?.address

Template.profile.tableSettings = () ->
  fields: [
    {
      key: 'createDate'
      label: 'Date'
      sort: -1
      fn: (date) ->
        new Date(date).toDateString()
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

Template.profile.events
  "click .dashboard-list .reactive-table tbody tr" : (event) ->
    Router.go 'dash', {_id: @_id}
