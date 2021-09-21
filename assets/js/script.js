var cityFormEl = $("#city-form");
var cityInputEl = $("#city-input");
var weatherContainerEl = $("#weather-snapshot");
var cityNameHeader = $("#city-header");
var cityDescription = $("#city-description");
var iconImgEl = $("#weather-icon");
var cardDeckEl = $(".card-deck")
var savedCitiesContainer = $("#saved-cities");
var currentCity = "";

var citiesSearchedArray = [];

var formSubmitHandler = function(event) {
    event.preventDefault();

    var cityName = cityInputEl.val().trim();

    if (cityName) {
        getCityWeather(cityName);
        cityInputEl.val("");
    }
    else {
        alert("Please enter a City");
    }
}

var getCityWeather = function(city) {
    var apiKey = "&appid=5aedbab5c11e388615ce282aa37ce509";
    var unitType = "&units=imperial";
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + unitType + apiKey;

    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    currentCity = data.name;
                    saveCities(currentCity);
                    var cityLat = "lat=" + data.coord.lat;
                    var cityLon = "lon=" + data.coord.lon;
                    var exclusions = "&exclude=minutely,hourly";
                    var newApiUrl = "https://api.openweathermap.org/data/2.5/onecall?" + cityLat + "&" + cityLon + exclusions + unitType + apiKey;
                    fetch(newApiUrl).then(function(response) {
                        if (response.ok) {
                            response.json().then(function(data2) {
                                console.log(data2);
                                displayCityWeather(data2);
                                displayFiveDayForecast(data2);
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

var displayCityWeather = function(cityData) {

    weatherContainerEl.text("");

    var todayDate = moment().format("L");
    // Take the info we want from the data and set to new variables
    var weatherTemp = cityData.current.temp + " °F";
    var weatherHumidity = cityData.current.humidity + " %";
    var weatherWind = cityData.current.wind_speed + " mph";
    var weatherUvi = cityData.current.uvi;
    var weatherIconCode = cityData.current.weather[0].icon;
    var weatherDescription = cityData.current.weather[0].description;
    
    var iconUrl = "https://openweathermap.org/img/w/" + weatherIconCode + ".png";

    cityNameHeader.parent().attr("id", "weather-results");

    cityNameHeader.html(currentCity + " " + todayDate + " <img src='" + iconUrl + "' alt='Weather Icon'/> " + weatherDescription);

    var weatherObject = {
        Temperature: weatherTemp,
        Humidity: weatherHumidity,
        Wind: weatherWind,
        UVIndex: weatherUvi 
    }

    for (var key in weatherObject) {
        if (weatherObject.hasOwnProperty(key)) {
            var listItem = $("<li></li>");

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

    cardDeckEl.empty();

    for (i = 1; i < 6; i++) {

        var newCard = $("<div></div>")
        newCard.addClass("card");
        cardDeckEl.append(newCard);

        var utcTime = fiveDay.daily[i].dt;
        var convertedDate = moment.unix(utcTime).utc().format("L");
        var newCardHeader = $("<h3></h3>");
        newCardHeader.text(convertedDate);
        newCard.append(newCardHeader);

        var newIcon = $("<img>");
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
    if ($.inArray(addCity, citiesSearchedArray) !== -1) {
        return;
    }
    else {
        citiesSearchedArray.push(addCity);
    }
    localStorage.setItem("Searched Cities", JSON.stringify(citiesSearchedArray));
    
}

var loadCities = function(loadCity) {
    savedCitiesContainer.empty();
    citiesSearchedArray = JSON.parse(localStorage.getItem("Searched Cities"));
    
    if (citiesSearchedArray != null) {
        for (i = citiesSearchedArray.length - 1; i >= 0; i--) {
            var newBtn = $("<button></button>");
            newBtn.text(citiesSearchedArray[i]);
            savedCitiesContainer.append(newBtn);
        }
    }
}

loadCities();

cityFormEl.on("submit", formSubmitHandler);