Template.annotation.selectedText = () ->
  Session.get('selectedText')

Template.annotation.showSubform = (type) ->

  if Session.get('annotationType') is type
    true
  else
    false

Diseases = () =>
  @grits.Annotation.Diseases

Hosts = () =>
  @grits.Annotation.Hosts

Symptoms = () =>
  @grits.Annotation.Symptoms

Pathogens = () =>
  @grits.Annotation.Pathogens

Modes = () =>
  @grits.Annotation.Modes

AllCountries = () =>
  @grits.Geonames.AllCountries

autocompleteSettings = (type) ->

  collection =
    if type is 'disease'
      Diseases()
    else if type is 'host'
      Hosts()
    else if type is 'symptom'
      Symptoms()
    else if type is 'pathogen'
      Pathogens()
    else if type is 'mode'
      Modes()

  {
   position: "top"
   limit: 5
   rules: [ { collection: collection, field: "_id", template: Template.annotationSearchPill } ]
  }


Template.diseaseAnnotation.autocompleteSettings = () -> autocompleteSettings 'disease'
Template.hostAnnotation.autocompleteSettings = () -> autocompleteSettings 'host'
Template.symptomAnnotation.autocompleteSettings = () -> autocompleteSettings 'symptom'
Template.pathogenAnnotation.autocompleteSettings = () -> autocompleteSettings 'pathogen'
Template.modeAnnotation.autocompleteSettings = () -> autocompleteSettings 'mode'
Template.locationAnnotation.autocompleteSettings = () ->
  {
    position: "top"
    limit: 5
    rules: [ {
              collection: grits.Geonames.AllCountries
              field: "name"
              template: Template.geonamesSearchPill
              callback: (doc) -> console.log doc
            } ]
  }

Template.annotation.events

  "change #annotationType": (event) ->
    Session.set('annotationType', $('#annotationType').val())

