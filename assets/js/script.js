// Event handler for city search
var btnSearchCities = $('#btnSearchCities');
var formSearchCities = $('#formSearchCities');

btnSearchCities.on('click',function (event){
    event.preventDefault()
    getCurrentConditions(formSearchCities.val())
    // getForecastConditions(formSearchCities.val())
})

// Add city card to city list on left of screen
var leftBarContainer = $('#leftBarContainer');
var cityList =[];

function addCityCard(cityName) {

    console.log('Triggered addCityCard')

    // If the city card already exists, do nothing
    for (i=0;i<cityList.length;i++) {
        if (cityList[i]=== cityName) {
            console.log(`${cityName} card already exists, stopping card creation.`)
            return;
        }
    }

    // If it's a new city, add a card for it
    // Update city list
    console.log(`Creating city card for ${cityName}`)
    cityList.push(cityName);

    // Create bootstrap card
    var newCityCard = $('<div>')
    newCityCard.addClass('card my-1')
    newCityCard.attr('id',cityName)

    // Create bootstrap card body
    var newCityBody = $('<div>')
    newCityBody.addClass('card-body p-1')
    newCityBody.text(cityName)

    // Append elements to render new card
    newCityCard.append(newCityBody);
    leftBarContainer.append(newCityCard);
}

//API call for current conditions
function getCurrentConditions(cityName) {
    var weatherAPIKey = '81f2953a65aee813b28e36a32ee00ddb';
    var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPIKey}`;

    fetch(apiUrlCityCurrent)
        .then(function(response){
            console.log('-----\nRetrieving current weather...\n-----')
            console.log(response)
            if (response.status === 200) {
                var currentConditionsJSON = response.json()
                console.log(currentConditionsJSON)
                addCityCard(cityName)
            } else if (response.status === 404) {
                console.log('Bad city name')
            }

        })
}

//API call for forecast conditions
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

// Populate current conditions

// Populate single future forecast

// Populate all 5 days of forecast