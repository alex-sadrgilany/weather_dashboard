// setting variables to jquery element selectors
var cityFormEl = $("#city-form");
var cityInputEl = $("#city-input");
var weatherContainerEl = $("#weather-snapshot");
var cityNameHeader = $("#city-header");
var cityDescription = $("#city-description");
var iconImgEl = $("#weather-icon");
var cardDeckEl = $(".card-deck")
var savedCitiesContainer = $("#saved-cities");
var iconDisplayEl = $("#display-icon");
var currentCity = "";

var citiesSearchedArray = [];

// function for handling the city input form
var formSubmitHandler = function(event) {
    event.preventDefault();

    var cityName = cityInputEl.val().trim();

    // make sure the user entered a city name
    if (cityName) {
        getCityWeather(cityName);
        cityInputEl.val("");
    }
    else {
        alert("Please enter a City");
    }
}

// function to fetch the weather data from one weather api
var getCityWeather = function(city) {

    // creating variables for necessary parts of the api url/link
    var apiKey = "&appid=5aedbab5c11e388615ce282aa37ce509";
    var unitType = "&units=imperial";
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + unitType + apiKey;

    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    // creating variables from the first fetch that will be necessary for the second fetch
                    currentCity = data.name;
                    saveCities(currentCity);
                    var cityLat = "lat=" + data.coord.lat;
                    var cityLon = "lon=" + data.coord.lon;
                    var exclusions = "&exclude=minutely,hourly";
                    var newApiUrl = "https://api.openweathermap.org/data/2.5/onecall?" + cityLat + "&" + cityLon + exclusions + unitType + apiKey;
                    fetch(newApiUrl).then(function(response) {
                        if (response.ok) {
                            response.json().then(function(data2) {
                                // call functions to display the weather, 5 day forecast, and load saved cites
                                displayCityWeather(data2);
                                displayFiveDayForecast(data2);
                                loadCities(currentCity);
                            })
                        }
                        else {
                            alert("Error: City Not Found");
                        }
                    })
                });
            }
            else {
                alert("Error: City Not Found");
            }
        })
        .catch(function(error) {
            alert("Error: Unable To Connect To OpenWeather");
        });
}

// Main function that displays today's weather results
var displayCityWeather = function(cityData) {
    // empty the container before printing to it
    weatherContainerEl.text("");

    // get today's date and set it to a variable
    var todayDate = moment().format("L");
    // Take the info we want from the data and set to new variables
    var weatherTemp = cityData.current.temp + " °F";
    var weatherHumidity = cityData.current.humidity + " %";
    var weatherWind = cityData.current.wind_speed + " mph";
    var weatherUvi = cityData.current.uvi;
    var weatherIconCode = cityData.current.weather[0].icon;
    var weatherDescription = cityData.current.weather[0].description;
    
    var iconUrl = "https://openweathermap.org/img/w/" + weatherIconCode + ".png";

    // set the id of the parent div for css purposes once weather data loads
    cityNameHeader.parent().attr("id", "weather-results");

    cityNameHeader.html(currentCity + " " + todayDate + " <img src='" + iconUrl + "' alt='Weather Icon'/> " + weatherDescription);

    // creating a new object with only the necessary data we need
    var weatherObject = {
        Temperature: weatherTemp,
        Humidity: weatherHumidity,
        Wind: weatherWind,
        UVIndex: weatherUvi 
    }

    // iterating through the new object and printing the results to the page
    for (var key in weatherObject) {
        if (weatherObject.hasOwnProperty(key)) {
            var listItem = $("<li></li>");

            // applying different ids to the UV index span based on the results
            if (weatherObject[key] === weatherUvi) {
                if (weatherUvi < 3) {
                    listItem.html(key + ": " + "<span id='uvi-green'>&nbsp&nbsp" + weatherObject[key] + "&nbsp&nbsp</span>");
                }
                else if (weatherUvi < 6 && weatherUvi >= 3) {
                    listItem.html(key + ": " + "<span id='uvi-yellow'>&nbsp&nbsp" + weatherObject[key] + "&nbsp&nbsp</span>");
                }
                else if (weatherUvi < 8 && weatherUvi >= 6) {
                    listItem.html(key + ": " + "<span id='uvi-orange'>&nbsp&nbsp" + weatherObject[key] + "&nbsp&nbsp</span>");
                }
                else if (weatherUvi < 11 && weatherUvi >= 8) {
                    listItem.html(key + ": " + "<span id='uvi-red'>&nbsp&nbsp" + weatherObject[key] + "&nbsp&nbsp</span>");
                }
                else {
                    listItem.html(key + ": " + "<span id='uvi-violet'>&nbsp&nbsp" + weatherObject[key] + "&nbsp&nbsp</span>");
                }
            }
            else {
                listItem.text(key + ": " + weatherObject[key]);
            }
            weatherContainerEl.append(listItem);
        }
    }
}

var displayFiveDayForecast = function(fiveDay) {

    // make sure the container is empty before printing to it
    cardDeckEl.empty();

    var newHeader = $("<h3></h3>");
    newHeader.text("5-Day Weather Forecast");
    newHeader.addClass("five-day");
    cardDeckEl.append(newHeader);

    // creating a for loop that will only grab the 5 days of data we need from the api results and printing them to the page
    for (i = 1; i < 6; i++) {
        var newCard = $("<div></div>")
        newCard.addClass("card");
        cardDeckEl.append(newCard);

        var utcTime = fiveDay.daily[i].dt;
        var convertedDate = moment.unix(utcTime).utc().format("ddd MM/DD");
        var newCardHeader = $("<h3></h3>");
        newCardHeader.text(convertedDate);
        newCard.append(newCardHeader);

        var newIcon = $("<img/>");
        var newIconCode = fiveDay.daily[i].weather[0].icon;
        var newIconUrl = "https://openweathermap.org/img/w/" + newIconCode + ".png";
        newIcon.attr("src", newIconUrl);
        newCard.append(newIcon);

        var newTemp = fiveDay.daily[i].temp.day + " °F";
        var newHumidity = fiveDay.daily[i].humidity + " %";
        var newWind = fiveDay.daily[i].wind_speed + " mph";

        var newWeatherObject = {
            Temp: newTemp,
            Humidity: newHumidity,
            Wind: newWind
        }

        var newList = $("<ul></ul>")
        for (var key in newWeatherObject) {
            if (newWeatherObject.hasOwnProperty(key)) {
                var newListItem = $("<li></li>")
                newListItem.html(key + ": " + newWeatherObject[key]);
                newList.append(newListItem);
            }
        }
        newCard.append(newList);
    }
}

var saveCities = function(addCity) {
    citiesSearchedArray = citiesSearchedArray || [];
    // ensuring we don't save a city that already exists in the array
    if ($.inArray(addCity, citiesSearchedArray) !== -1) {
        return;
    }
    else {
        citiesSearchedArray.push(addCity);
    }
    localStorage.setItem("Searched Cities", JSON.stringify(citiesSearchedArray));
}

var loadCities = function() {
    // empty the container before we print to it
    savedCitiesContainer.empty();
    // load the results from local storage to the array
    citiesSearchedArray = JSON.parse(localStorage.getItem("Searched Cities"));
    
    // make sure array is not null
    if (citiesSearchedArray != null) {
        // iterate through the array and print the cities as buttons
        for (i = citiesSearchedArray.length - 1; i >= 0; i--) {
            var newBtn = $("<button></button>");
            newBtn.attr("id", "searched-city");
            newBtn.text(citiesSearchedArray[i]);
            savedCitiesContainer.append(newBtn);
        }

        var clearButton = $("<button></button>");
        clearButton.text("Clear Searches");
        clearButton.attr("id", "clear-cities");
        savedCitiesContainer.append(clearButton);
    }
}

// give the buttons we created in the loadCities function links to necessary functions
var buttonHandler = function(event) {
    var target = $(event.target);
    if (target.is("#searched-city")) {
        var newCitySearch = target.text();
        getCityWeather(newCitySearch);
    }
    // clear local storage and empty the array and container if user clicks clear searches
    else if (target.is("#clear-cities")) {
        savedCitiesContainer.empty();
        localStorage.clear();
        citiesSearchedArray = [];
    }

}

// Randomize Array function
var randomizeArray = function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
  
      // swap elements array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
}

// function used to decorate the header with icons from one weather api
var iconDecoration = function() {
    iconCodeArray = ["01d", "01n", "02d", "02n", "03d", "04d", "09d", "10d", "10n", "11d", "13d", "50d"]
    // make a copy of above array
    var randomizeIconArray = iconCodeArray.slice();
    randomizeArray(randomizeIconArray);

    // iterate through the randomized array and print the icons to the header
    for (i = 0; i < randomizeIconArray.length; i++) {
        var newImgEl = $("<img/>")
        randomIconUrl = "https://openweathermap.org/img/w/" + randomizeIconArray[i] + ".png";
        newImgEl.attr("src", randomIconUrl);
        $("#icon-decoration").append(newImgEl);
    }
}

// add event listeners to the necessary elements
savedCitiesContainer.on("click", buttonHandler);
cityFormEl.on("submit", formSubmitHandler);
// decorate header
iconDecoration();
// load city searches
loadCities();