
var WEATHER_API_KEY = 'b8628e5537299dd92c268cb43152d77d';

// Event handler for city search
var btnSearchCities = $('#btnSearchCities');
var formSearchCities = $('#formSearchCities');

btnSearchCities.on('click',function (event){
    event.preventDefault()
    getConditions(formSearchCities.val())
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
function getConditions(cityName) {
    var lat = 51.5085; //London
    var lon = -0.1257; //London
    var part = 'hourly,daily'
    var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
    // var apiUrlCityCurrent = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&part=${part}`;

    fetch(apiUrlCityCurrent)
        .then(function(response){

            console.log('-----\nRetrieving current weather...\n-----')
            console.log('Response:')
            console.log(response)
            
            if (response.status === 200) {

                addCityCard(cityName)

            } else if (response.status === 404) {

                console.log('Bad city name')

            }

            return response.json()

        })
        .then(function(data) {
            
            getExtendedUVData(data)
            
        })

    
}


// Update page with current conditions
function getExtendedUVData(data) {
    console.log('Response JSON:')
    console.log(data)
    var curTemp = data.main.temp;
    var curHumidity = data.main.humidity;
    var curWindSpd = data.wind.speed;
    var cityName = data.name;


    // Separate potentially paid API call just to get UVI...ugh...
    var lat = data.coord.lat;
    var lon = data.coord.lon;
    var apiUrlLatLon = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    fetch(apiUrlLatLon)
        .then(function(response){
            return response.json()
        })
        .then(function(data){
            console.log(data)
            var curUVI = data.current.uvi;

            renderCurrentConditions(data,curTemp,curHumidity,curWindSpd,cityName,curUVI)
            renderForecastConditions(data)
        })

}

function renderCurrentConditions(data,curTemp,curHumidity,curWindSpd,cityName,curUVI) {
    var cityNameTitle = $('#cityNameTitle')
    cityNameTitle.text(cityName);

    var curDateEl = $('#curDateEl')
    curDateEl.text(moment().format('MMMM Do'))

    var curIconEl = $('#curIconEl')
    curIconEl.attr('src',`http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`)
    
    var curTemperatureEl = $('#curTemperatureEl')
    curTemperatureEl.text(`Temperature: ${curTemp}\u2103`);

    var curHumidityEl = $('#curHumidityEl');
    curHumidityEl.text(`Humidity: ${curHumidity}%`)

    var curWindEl = $('#curWindEl');
    curWindEl.text(`Wind speed: ${curWindSpd}m/s`)

    var curUVIEl = $('#curUVIEl');
    curUVIEl.text(`UV Index: ${curUVI}/10`)

    var currentConditionsContainer = $('#currentConditionsContainer');
    currentConditionsContainer.css('display','block')


}

function renderForecastConditions(data) {
    return;
}

//API call for forecast conditions
// function getForecastConditions(cityName) {
//     var weatherAPIKey = 'b8628e5537299dd92c268cb43152d77d';
//     var apiUrlCityForecast = `https://api.openweathermap.org/data/3.0/forecast?q=${cityName}&appid=${WEATHER_API_KEY}`;

//     fetch(apiUrlCityForecast)
//         .then(function(response){
//             console.log('-----\nRetrieving forecast weather...\n-----')
//             console.log(response)
//             var currentConditionsJSON = response.json()
//             console.log(currentConditionsJSON)
//         })

// }

// Populate current conditions

// Populate single future forecast

// Populate all 5 days of forecast