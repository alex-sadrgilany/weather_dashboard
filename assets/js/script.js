var cityFormEl = $("#city-form");
var cityInputEl = $("#city-input");
var weatherContainerEl = $("#weather-snapshot");
var cityNameHeader = $("#city-header");
var cityDescription = $("#city-description");

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
    var apiKey = "5aedbab5c11e388615ce282aa37ce509";
    var unitType = "&units=imperial";
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + unitType + "&appid=" + apiKey;

    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    displayCityWeather(data, city);
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

var displayCityWeather = function(weatherData) {

    weatherContainerEl.text("");

    var weatherLocation = weatherData.name;
    var todayDate = moment().format("L");
    var weatherIcon = weatherData.weather[0].icon;
    var iconUrl = "https://openweathermap.org/img/w/" + weatherIcon + ".png";
    var weatherDescription = weatherData.weather[0].description;

    cityNameHeader.html(weatherLocation + " " + todayDate + " <img src='" + iconUrl + "' alt='Weather Icon'/> " + weatherDescription);

    cityDescription.text(weatherDescription);
    
    var weatherTemp = weatherData.main.temp;
    var weatherWind = weatherData.wind.speed;
    var weatherHumidity = weatherData.main.humidity;

    var newWeatherObject = {
        Temperature: weatherTemp + "°F",
        Wind: weatherWind + "mph",
        Humidity: weatherHumidity + "%"
    }

    for (var key in newWeatherObject) {
        if (newWeatherObject.hasOwnProperty(key)) {
            var pEl = $("<p></p>");

            pEl.text(key + ": " + newWeatherObject[key]);

            weatherContainerEl.append(pEl);

        }
    }

}

cityFormEl.on("submit", formSubmitHandler);