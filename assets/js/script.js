// Event handler for city search
var btnSearchCities = $('#btnSearchCities');
var formSearchCities = $('#formSearchCities');

btnSearchCities.on('click',function (event){
    event.preventDefault()
    addCityCard(formSearchCities.val())
})

// Add city card to city list
var leftBarContainer = $('#leftBarContainer');
var cityList =[];

function addCityCard(cityName) {
    console.log('Triggered addCityCard')

    for (i=0;i<cityList.length;i++) {
        if (cityList[i]=== cityName) {
            // If the city card already exists, do nothing
            console.log(`${cityName} card already exists.`)
            return;
        }
    }

        // If it's a new city, add a card for it
        console.log(`Creating city card for ${cityName}`)
        cityList.push(cityName);

        var newCityCard = $('<div>')
        newCityCard.addClass('card my-1')
        newCityCard.attr('id',cityName)
    
        var newCityBody = $('<div>')
        newCityBody.addClass('card-body p-1')
        newCityBody.text(cityName)
    
        newCityCard.append(newCityBody);
        leftBarContainer.append(newCityCard);
}


// Alert user about bad search

//API call and parse
var cityNamePlaceholder = 'South San Francisco'
function getCurrentConditions(cityName) {
    var weatherAPIKey = '81f2953a65aee813b28e36a32ee00ddb';
    var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPIKey}`;

    fetch(apiUrlCityCurrent)
        .then(function(response){
            console.log('-----\nRetrieving current weather...\n-----')
            console.log(response)
            var currentConditionsJSON = response.json()
            console.log(currentConditionsJSON)
        })
}

function getForecastConditions(cityName) {
    var weatherAPIKey = '81f2953a65aee813b28e36a32ee00ddb';
    var apiUrlCityForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPIKey}`;

    fetch(apiUrlCityForecast)
        .then(function(response){
            console.log('-----\nRetrieving forecast weather...\n-----')
            console.log(response)
            var currentConditionsJSON = response.json()
            console.log(currentConditionsJSON)
        })

}

// getCurrentConditions(cityNamePlaceholder)
// getForecastConditions(cityNamePlaceholder)
// Populate current conditions

// Populate single future forecast

// Populate all 5 days of forecast