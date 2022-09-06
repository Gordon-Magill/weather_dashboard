// Don't you just love hard-coded API keys right in the client-side code? No backend for this app.
var WEATHER_API_KEY = "b8628e5537299dd92c268cb43152d77d";

// Helper function for rounding numbers, useful for presenting data nicely in the forecast cards
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
});

// Populate the city list on the left of the screen with cities stored in localStorage
var leftBarContainer = $("#leftBarContainer");
var cityList = JSON.parse(localStorage.getItem("cityList")) || [];
function populateSearchHistory() {
  if (cityList.length > 0) {
    for (j = 0; j < cityList.length; j++) {
      addCityCard(cityList[j], true);
    }
  }
}

// Do this populating right at the start of page load
populateSearchHistory();

// Function to add city card to city list on left of screen
function addCityCard(cityName, forceCreate) {
  // If the city card already exists, do nothing
  for (i = 0; i < cityList.length; i++) {
    if (cityList[i] === cityName && !forceCreate) {
      // Unless prompted, cause this to abort the card adding process
      console.log(`${cityName} card already exists, stopping card creation.`);
      return;
    }
  }

  // If there isn't a city of the same name already in the list, add it to the list
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
  newCityBody.addClass("card-body custom-card-body p-1");
  newCityBody.text(cityName);

  // Append elements to render new card
  newCityCard.append(newCityBody);
  leftBarContainer.append(newCityCard);
  localStorage.setItem("cityList", JSON.stringify(cityList));
}

//API call for current conditions
function getConditions(cityName) {
  // Fancy string formatting to create the URL
  var apiUrlCityCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;

  fetch(apiUrlCityCurrent)
    .then(function (response) {
      console.log("-----\nRetrieving current weather...\n-----");
      console.log("Response:");
      console.log(response);

      //   If the response is good, display the right results area and add a city card on the left
      if (response.status === 200) {
        $(".customRightArea").css("display", "block");
        addCityCard(cityName, false);
      } else if (response.status === 404) {
        console.log("Bad city name");
      }

      return response.json();
    })
    .then(function (data) {
      //Use this data to initiate the process of updating the page content
      updatePageContent(data);
    });
}

// Update page with current conditions
function updatePageContent(data) {
  console.log("Response JSON:");
  console.log(data);

  //   Extract current conditions from JSON
  var curTemp = data.main.temp;
  var curHumidity = data.main.humidity;
  var curWindSpd = data.wind.speed;
  var cityName = data.name;

  // Separate potentially paid API call just to get UVI...ugh...
  //   This API call requires lat/lon, which can be acquired from the city search API response for a given city
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

      //   Finally update the current conditions card now that UVI is available
      renderCurrentConditions(
        data,
        curTemp,
        curHumidity,
        curWindSpd,
        cityName,
        curUVI
      );
      //   Use the new API to call's data to additionally populate the forecast conditions
      renderForecastConditions(data);
    });
}

// Helper function to update current conditions card
function renderCurrentConditions(
  data,
  curTemp,
  curHumidity,
  curWindSpd,
  cityName,
  curUVI
) {
  // Setting the name of the city at the top of the results
  var cityNameTitle = $("#cityNameTitle");
  cityNameTitle.text(cityName);

  //   Update card with date in correct format
  var curDateEl = $("#curDateEl");
  curDateEl.text(moment().format("MMMM Do") + "\n(Current conditions)");

  //   Retrieve and set the correct weather icon using the API response
  var curIconEl = $("#curIconEl");
  curIconEl.attr(
    "src",
    `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
  );

  //   Update the card with a rounded temperature
  var curTemperatureEl = $("#curTemperatureEl");
  var roundedCurTemp = roundSigFigs(curTemp, 1);
  curTemperatureEl.text(`Temperature: ${roundedCurTemp}\u2103`);

  //   Update the card with humidity
  var curHumidityEl = $("#curHumidityEl");
  curHumidityEl.text(`Humidity: ${curHumidity}%`);

  //   Update the card with wind speed
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

  //   Make the results page visible once the content is ready to go
  var currentConditionsContainer = $("#currentConditionsContainer");
  currentConditionsContainer.css("display", "block");
}

// Helper function to update the forecast data cards
function renderForecastConditions(data) {
  // Loop through the indices of the forecast days to update them one by one
  for (i = 0; i < 5; i++) {
    // Adjust the moment element used for each card
    var currentMoment = moment().add(i + 1, "days");
    var curDateEl = $(`#dateEl${i}`);
    curDateEl.text(currentMoment.format("MMMM Do"));

    // Update the forecast weather icon
    var curIconEl = $(`#iconEl${i}`);
    curIconEl.attr(
      "src",
      `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`
    );

    // Update the temperature with a rounded value
    var curTemperatureEl = $(`#temperatureEl${i}`);
    curTemperatureEl.text(
      `Temp(\u2103): ${roundSigFigs(
        data.daily[i].temp.day,
        1
      )}(Day) / ${roundSigFigs(data.daily[i].temp.night, 1)}(Night)  `
    );

    // Update the humidity value
    var curHumidityEl = $(`#humidityEl${i}`);
    curHumidityEl.text(`Humidity: ${data.daily[i].humidity}%`);

    // Update the wind speed with a rounded value
    var curWindEl = $(`#windEl${i}`);
    curWindEl.text(
      `Wind speed: ${roundSigFigs(data.daily[i].wind_speed, 1)}m/s`
    );
  }

  // Make the forecast conditions visible
  var forecastConditionsContainer = $("#forecastConditionsContainer");
  forecastConditionsContainer.css("display", "block");
}
