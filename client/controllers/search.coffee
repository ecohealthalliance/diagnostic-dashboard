DiagnosisResults = () =>
  @grits.Results

DiseaseNames = () =>
  @grits.Girder.DiseaseNames

Keywords = () =>
  @grits.Girder.Keywords

RESULTS_PER_PAGE = 10

# Temporary collections
DiseasesSelected = new Meteor.Collection(null)
AnyKeywordsSelected = new Meteor.Collection(null)
AllKeywordsSelected = new Meteor.Collection(null)

createDoQueryFunction = (doQuery) ->
  _.debounce(((query, options) ->
    Session.set('searching', true)
    callback = (error, results, total) ->
      if error
        console.error error
        Session.set('searching', false)
        return
      Session.set('searching', false)
      Session.set('searchResults', results)
      Session.set('totalResults', total)
    doQuery(query, options, callback)
  ), 1000)

createSearchAutorunFunction = (createQuery, doQuery) ->
  lastPage = null
  Session.set('searchPage', 0)
  return () ->
    # If the page did not change that means something else did
    # so we should reset the page.
    if Session.get('searchPage') == lastPage
      Session.set('searchPage', 0)
    else
      lastPage = Session.get('searchPage')

    query = createQuery(DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected)

    doQuery(query, {
      size: RESULTS_PER_PAGE
      from: Session.get('searchPage') * RESULTS_PER_PAGE
    })

@grits ?= {}
@grits.controllers ?= {}
@grits.controllers.search ?= {}
@grits.controllers.search.createRoute = (name, createQuery, doQuery) ->
  Router.route(name,
    path: "/#{name}"
    where: "client"
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      [
        Meteor.subscribe('diseaseNames')
        Meteor.subscribe('keywords')
        Meteor.subscribe('results', {_id: @params.diagnosisId})
      ]
    onAfterAction: () ->
      # Remove any previous selections which could exist
      # if the user navigates away from the search page and comes back.
      Session.set('searchView', 'listView')
      Session.set('searchSortBy', 'relevance')
      Session.set('searchResults', [])
      Session.set('totalResults', 0)

      DiseasesSelected.find({}, {reactive:false}).forEach (d)->
        DiseasesSelected.remove(d._id)
      AnyKeywordsSelected.find({}, {reactive:false}).forEach (k)->
        AnyKeywordsSelected.remove(k._id)
      if @params.diagnosisId
        diagnosis = DiagnosisResults().findOne(@params.diagnosisId)
        if diagnosis
          diagnosis.diseases.forEach (d)->
            DiseasesSelected.insert(d)
          if diagnosis.keywords
            diagnosis.keywords.forEach (k)->
              AnyKeywordsSelected.insert(k)

      this.searchAutorun = Deps.autorun(
        createSearchAutorunFunction(createQuery, 
          createDoQueryFunction(doQuery)))
    onStop: () ->
      $('.popover').remove()
      this.searchAutorun.stop()
  )


Template.searchInput.autocompleteSettings = () ->
  position: "top"
  limit: 5
  rules: [
    {
      collection: @autocompleteCollection
      field: "_id"
      template: Template.searchPill
    }
  ]

Template.search.eq = (a, b) ->
  a == b

Template.search.diseaseNames = () ->
  DiseaseNames()

Template.search.keywords = () ->
  Keywords()

Template.search.diseasesSelected = ()-> DiseasesSelected.find()
Template.search.anyKeywordsSelected = ()-> AnyKeywordsSelected.find()
Template.search.allKeywordsSelected = ()-> AllKeywordsSelected.find()

Template.search.useView = (viewTypes) ->
  Session.get('searchView')

Template.search.searching = () -> Session.get('searching')

Template.search.numResults = () -> 
  Session.get('searchResults')?.length or 0

Template.search.totalResults = () ->
  Session.get('totalResults') or 0

Template.search.sortBy = (sortMethods) ->
  Session.get('searchSortBy')

Template.search.pageNum = () ->
  Session.get('searchPage') or 0

Template.search.results = () ->
  Session.get('searchResults')

Template.searchInput.events
  "click #add-disease" : (event) ->
    kwName = $("#new-disease").val()
    if DiseaseNames().findOne({_id : kwName})
      DiseasesSelected.insert({name : kwName})
      $("#new-disease").val('')
    else
      alert("You can only search for terms in the auto-complete menu.")

  "click .remove-disease" : (event) ->
    DiseasesSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-any-keyword" : (event) ->
    kwName = $("#new-any-keyword").val()
    AnyKeywordsSelected.insert({name : kwName})
    $("#new-any-keyword").val('')

  "click .remove-any-keyword" : (event) ->
    AnyKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-all-keyword" : (event) ->
    kwName = $("#new-all-keyword").val()
    AllKeywordsSelected.insert({name : kwName})
    $("#new-all-keyword").val('')

  "click .remove-all-keyword" : (event) ->
    AllKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click .add-keyword-link" : (event) ->
    AllKeywordsSelected.insert({name : $(event.currentTarget).text()})

Template.search.events
  "click .prev-page": (event) ->
    Session.set('searchPage', Math.max(Session.get('searchPage') - 1, 0))

  "click .next-page": (event) ->
    Session.set('searchPage',
      Math.min(Session.get('searchPage') + 1,
        Math.floor(Session.get('totalResults') / RESULTS_PER_PAGE)
      )
    )

  "change #sort-by": (event) ->
    Session.set('searchSortBy', $(event.target).val())

  "change #choose-view": (event) ->
    Session.set('searchView', $(event.target).val())


