var cityFormEl = $("#city-form");
var cityInputEl = $("#city-input");
var weatherContainerEl = $("#weather-snapshot");
var cityNameHeader = $("#city-header");
var cityDescription = $("#city-description");
var iconImgEl = $("#weather-icon");
var currentCity = "";

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
                    var cityLat = "lat=" + data.coord.lat;
                    var cityLon = "lon=" + data.coord.lon;
                    var exclusions = "&exclude=minutely,hourly";
                    var newApiUrl = "https://api.openweathermap.org/data/2.5/onecall?" + cityLat + "&" + cityLon + exclusions + unitType + apiKey;
                    fetch(newApiUrl).then(function(response) {
                        if (response.ok) {
                            response.json().then(function(data2) {
                                console.log(data2);
                                displayCityWeather(data2, city);
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

    var newWeatherObject = {
        Temperature: weatherTemp,
        Humidity: weatherHumidity,
        Wind: weatherWind,
        UVIndex: weatherUvi 
    }

    for (var key in newWeatherObject) {
        if (newWeatherObject.hasOwnProperty(key)) {
            var listItem = $("<li></li>");

            if (newWeatherObject[key] === weatherUvi) {
                listItem.html(key + ": " + "<span id='uvi-color'>" + newWeatherObject[key] + "</span>");
            }
            else {
                listItem.text(key + ": " + newWeatherObject[key]);
            }
        
            weatherContainerEl.append(listItem);
        }
    }

}

cityFormEl.on("submit", formSubmitHandler);