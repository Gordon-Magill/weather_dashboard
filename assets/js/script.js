

// Event handler for city search

// Add city card to city list

// Alert user about bad search

//API call and parse
function getCurrentConditions() {
    var weatherAPIKey = '81f2953a65aee813b28e36a32ee00ddb';
    var cityName = 'South San Francisco'
    var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPIKey}`;

    fetch(apiUrlCityCurrent)
        .then(function(response){
            console.log('-----\nRetrieving current weather...\n-----')
            console.log(response)
            var currentConditionsJSON = response.json()
            console.log(currentConditionsJSON)
        })
}

function getForecastConditions() {
    var weatherAPIKey = '81f2953a65aee813b28e36a32ee00ddb';
    var cityName = 'South San Francisco'
    var apiUrlCityForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPIKey}`;

    fetch(apiUrlCityForecast)
        .then(function(response){
            console.log('-----\nRetrieving forecast weather...\n-----')
            console.log(response)
            var currentConditionsJSON = response.json()
            console.log(currentConditionsJSON)
        })

}

// getCurrentConditions()
// getForecastConditions()
// Populate current conditions

// Populate single future forecast

// Populate all 5 days of forecast