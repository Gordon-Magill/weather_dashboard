var WEATHER_API_KEY = "b8628e5537299dd92c268cb43152d77d";

// Helper function for presenting data
// Based off of https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
function roundSigFigs(numberArg, sigFigs) {
  return (
    Math.round((numberArg + Number.EPSILON) * 10 ** sigFigs) / 10 ** sigFigs
  );
}

// Event handler for city search
var btnSearchCities = $("#btnSearchCities");
var formSearchCities = $("#formSearchCities");

btnSearchCities.on("click", function (event) {
  event.preventDefault();
  getConditions(formSearchCities.val());
  // getForecastConditions(formSearchCities.val())
});

// Populate the city list on the left of the screen with cities stored in localStorage
var leftBarContainer = $("#leftBarContainer");
var cityList = JSON.parse(localStorage.getItem("cityList")) || [];
function populateSearchHistory() {
  // console.log('Creating city list on the left based on:');
  // console.log(cityList)
  // console.log(cityList.length)
  if (cityList.length > 0) {
    for (j = 0; j < cityList.length; j++) {
      // console.log('Entering loop '+j);
      addCityCard(cityList[j], true);
      // console.log('Exiting loop '+j)
    }
  }
}
populateSearchHistory();

// Add city card to city list on left of screen
function addCityCard(cityName, forceCreate) {
  // console.log('Triggered addCityCard')

  // If the city card already exists, do nothing
  for (i = 0; i < cityList.length; i++) {
    if (cityList[i] === cityName && !forceCreate) {
      // Unless prompted, cause this to abort the card adding process
      console.log(`${cityName} card already exists, stopping card creation.`);
      return;
    }
  }

  // If it's a new city, add a card for it
  // Update city list
  // console.log(`Creating city card for ${cityName}`)

  var cityNameFlag = true;
  for (i = 0; i < cityList.length; i++) {
    if (cityList[i] == cityName) {
      cityNameFlag = false;
    }
  }

  if (cityNameFlag) {
    cityList.push(cityName);
  }

  // Create bootstrap card
  var newCityCard = $("<div>");
  newCityCard.addClass("card my-1 ");
  newCityCard.attr("id", cityName);
  newCityCard.addClass("hoverShadow");
  newCityCard.on("click", function (event) {
    event.preventDefault();
    getConditions(cityName);
  });

  // Create bootstrap card body
  var newCityBody = $("<div>");
  newCityBody.addClass("card-body p-1 cityCard");
  newCityBody.text(cityName);

  // Append elements to render new card
  newCityCard.append(newCityBody);
  leftBarContainer.append(newCityCard);
  localStorage.setItem("cityList", JSON.stringify(cityList));
  // console.log('Finished making card for '+cityName)
}

//API call for current conditions
function getConditions(cityName) {
  var lat = 51.5085; //London
  var lon = -0.1257; //London
  var part = "hourly,daily";
  var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
  // var apiUrlCityCurrent = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&part=${part}`;

  fetch(apiUrlCityCurrent)
    .then(function (response) {
      console.log("-----\nRetrieving current weather...\n-----");
      console.log("Response:");
      console.log(response);

      if (response.status === 200) {
        $(".customRightArea").css("display", "block");
        addCityCard(cityName, false);
      } else if (response.status === 404) {
        console.log("Bad city name");
      }

      return response.json();
    })
    .then(function (data) {
      getExtendedUVData(data);
    });
}

// Update page with current conditions
function getExtendedUVData(data) {
  console.log("Response JSON:");
  console.log(data);
  var curTemp = data.main.temp;
  var curHumidity = data.main.humidity;
  var curWindSpd = data.wind.speed;
  var cityName = data.name;

  // Separate potentially paid API call just to get UVI...ugh...
  var lat = data.coord.lat;
  var lon = data.coord.lon;
  var apiUrlLatLon = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
  fetch(apiUrlLatLon)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var curUVI = data.current.uvi;

      renderCurrentConditions(
        data,
        curTemp,
        curHumidity,
        curWindSpd,
        cityName,
        curUVI
      );
      renderForecastConditions(data);
    });
}

function renderCurrentConditions(
  data,
  curTemp,
  curHumidity,
  curWindSpd,
  cityName,
  curUVI
) {
  var cityNameTitle = $("#cityNameTitle");
  cityNameTitle.text(cityName);

  var curDateEl = $("#curDateEl");
  curDateEl.text(moment().format("MMMM Do") + "\n(Current conditions)");

  var curIconEl = $("#curIconEl");
  curIconEl.attr(
    "src",
    `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
  );

  var curTemperatureEl = $("#curTemperatureEl");
  var roundedCurTemp = roundSigFigs(curTemp, 1);
  curTemperatureEl.text(`Temperature: ${roundedCurTemp}\u2103`);

  var curHumidityEl = $("#curHumidityEl");
  curHumidityEl.text(`Humidity: ${curHumidity}%`);

  var curWindEl = $("#curWindEl");
  curWindEl.text(`Wind speed: ${roundSigFigs(curWindSpd, 1)}m/s`);

  // Set UVI text and style based on its level to indicate severity
  var curUVIEl = $("#curUVIEl");
  curUVIEl.text(`UV Index: ${curUVI}/10`);
  var roundedUVI = roundSigFigs(curUVI, 1);
  curUVIEl.removeClass("vlow-UVI low-UVI mod-UVI high-UVI extreme-UVI");
  if (curUVI < 1) {
    curUVIEl.text(`UV Index: ${roundedUVI}/10 (Very low)`);
    curUVIEl.removeClass("vlow-UVI low-UVI mod-UVI high-UVI extreme-UVI");
    curUVIEl.addClass("vlow-UVI");
  } else if (curUVI < 3) {
    curUVIEl.text(`UV Index: ${roundedUVI}/10 (Low)`);
    curUVIEl.addClass("low-UVI");
  } else if (curUVI < 6) {
    curUVIEl.text(`UV Index: ${roundedUVI}/10 (Moderate)`);
    curUVIEl.addClass("mod-UVI");
  } else if (curUVI < 9) {
    curUVIEl.text(`UV Index: ${roundedUVI}/10 (High)`);
    curUVIEl.addClass("high-UVI");
  } else if (curUVI > 9) {
    curUVIEl.text(`UV Index: ${roundedUVI}/10 (Extreme)`);
    curUVIEl.addClass("extreme-UVI");
  }

  var currentConditionsContainer = $("#currentConditionsContainer");
  currentConditionsContainer.css("display", "block");
}

function renderForecastConditions(data) {
  // Loop through the indices of the forecast
  for (i = 0; i < 5; i++) {
    var currentMoment = moment().add(i + 1, "days");
    var curDateEl = $(`#dateEl${i}`);
    curDateEl.text(currentMoment.format("MMMM Do"));

    var curIconEl = $(`#iconEl${i}`);
    curIconEl.attr(
      "src",
      `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`
    );

    var curTemperatureEl = $(`#temperatureEl${i}`);
    curTemperatureEl.text(
      `Temp(\u2103): ${roundSigFigs(
        data.daily[i].temp.day,
        1
      )}(Day) / ${roundSigFigs(data.daily[i].temp.night, 1)}(Night)  `
    );

    var curHumidityEl = $(`#humidityEl${i}`);
    curHumidityEl.text(`Humidity: ${data.daily[i].humidity}%`);

    var curWindEl = $(`#windEl${i}`);
    curWindEl.text(
      `Wind speed: ${roundSigFigs(data.daily[i].wind_speed, 1)}m/s`
    );
  }

  var forecastConditionsContainer = $("#forecastConditionsContainer");
  forecastConditionsContainer.css("display", "block");
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
