Results = @grits.Results

mers =
  name: 'MERS'
  rank: 1
  symptoms: [
    'fever'
    'respiratory illness'
    'pneumonia'
    'multiple organ failure'
    'severe pneumonia'
    'shortness of breath'
    'cough'
    'renal failure'
    'respiratory symptoms'
    'severe respiratory infection'
    'breathing difficulties'
    'serious respiratory illness'
    'respiratory infection'
    'influenza-like illness'
    'febrile respiratory illness'
    'severe respiratory illness'
    'acute respiratory symptoms'
    'productive cough'
  ]

h7n9 =
  name: 'H7N9'
  rank: 3
  symptoms: [
    'fever'
    'high fever'
    'diarrhea'
    'pneumonia'
    'severe pneumonia'
    'multiple organ failure'
    'fatigue'
    'shortness of breath'
    'cough'
    'respiratory symptoms'
    'influenza-like illness'
    'severe respiratory illness'
    'productive cough'
    'acute respiratory distress'
    'respiratory illness'
    'severe respiratory disease'
  ]

plague =
  name: 'Plague'
  rank: 2
  symptoms: [
    'fever'
    'high fever'
    'weak'
    'pneumonia'
    'multiple organ failure'
    'fatigue'
    'abdominal pain'
    'shortness of breath'
    'cough'
  ]

if Results.find().count() is 0

  Results.insert
    diseases: [mers, h7n9, plague]
