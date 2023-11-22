var app = {
    async init() {
        console.log("Weather App READY");
        this.jq = $;
        this.message = this.jq('#message');

        await this.getLocation();

        this.searchForm = this.jq('#search_form');
        this.searchForm.on('keyup',(e)=>{ this.initSearchForm(e); });
        this.searchField = this.jq('#search_field');
        this.searchField.on('click',()=>{ this.clearSearchField(); });

        this.citySelect = this.jq('#city_selector');
        this.citySelect.on('click','li',(e)=>{ this.initCitySelector(e); });
        
    },
    async readApi(url) {
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            console.log("API RESULT: ",result);
            return result;
        } catch (error) {
            console.error(error);
        }        
    },
    async displayWeather(url) {
        result = await this.readApi(url);
        if(result) {
            this.displayForecast(result);

            this.jq('.content').addClass('active');
            this.searchField.val(result.location.name);
            this.jq('#country').html(result.location.country);

            this.jq('#last_updated').html("Last updated: "+result.current.last_updated);
            this.jq('#localtime').html("Local time: "+result.location.localtime);

            this.jq('#condition-icon').html(`<img src="${result.current.condition.icon}" width="90" />`);
            this.jq('#condition-text').html(result.current.condition.text);
            this.jq('#temp_c').html(result.current.temp_c+"&deg;C");
            // this.jq('#temp_f').html(result.current.temp_f+"F");
            this.jq('#feelslike_c').html("Feels like: "+result.current.feelslike_c+"&deg;C");
            // this.jq('#feelslike_f').html(result.current.feelslike_f+"F");
            this.jq('#wind_kph').html("Wind: "+result.current.wind_kph+" km/h");
            // this.jq('#wind_mph').html(result.current.wind_mph+" mph");
            this.jq('#wind_degree').html(
                `<div class="wind_degree" style="transform:rotate(${result.current.wind_degree}deg);"></div>`);
            this.jq('#wind_dir').html("Direction: "+result.current.wind_dir);
            this.jq('#gust_kph').html("Gusts: "+result.current.gust_kph+" km/h");
            this.jq('#pressure_mb').html("Pressure: "+result.current.pressure_mb+" mb");
            this.jq('#humidity').html("Humidity: "+result.current.humidity+"%");
        }
    }, 
    async displayForecast(result) {
        if(result.forecast.forecastday) {
            html = '';
            const date = new Date();
            let today = date.getDay();
            const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

            result.forecast.forecastday.forEach(el => {
                const date = new Date(el.date);
                let day = date.getDay();
                let dayDisplay = '';
                if(day == today) { 
                    dayDisplay = 'Today'; 
                } else if(day == today+1) { 
                    dayDisplay = 'Tomorrow'; 
                } else {
                    dayDisplay = weekday[date.getDay()];
                };
                let daily_chance_of_rain = '';
                let totalprecip_mm = '';
                let daily_chance_of_snow = '';
                let totalsnow_cm = '';
                if(el.day.daily_chance_of_rain > 0) { 
                    daily_chance_of_rain = "Rain: "+el.day.daily_chance_of_rain+"%"; 
                    totalprecip_mm = el.day.totalprecip_mm+"mm";
                }
                if(el.day.daily_chance_of_snow > 0) { 
                    daily_chance_of_snow = "Snow: "+el.day.daily_chance_of_snow+"%"; 
                    totalsnow_cm = el.day.totalsnow_cm+"cm";
                }
                html += `
                    <li>
                        <div class="row">
                            <div class="col max-width-90 min-width-90">
                                <p class="f24 pb10">${dayDisplay}</p>
                                <p class="f14">${el.date}</p>
                            </div>
                            <div class="col text-center">
                                <div class="row">
                                    <div class="col">
                                        <p>
                                            <img src="${el.day.condition.icon}" width="60" />
                                        </p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <p>${daily_chance_of_rain}</p>
                                        <p>${totalprecip_mm}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <p>${daily_chance_of_snow}</p>
                                        <p>${totalsnow_cm}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col text-center pt20">
                                <p>
                                    <span class="red f22">${el.day.maxtemp_c}&deg;C</span> / 
                                    <span class="blue f22">${el.day.mintemp_c}&deg;C</span>
                                </p>
                            </div>
                            <div class="col text-center pt20">
                                <p>Max wind: ${el.day.maxwind_kph} km/h</p>
                            </div>
                        </div>
                    </li>
                `;
            });
            this.jq('#forecast').html(html);
        }
    },
    async getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.displayCurrentLocation(position.coords.latitude, position.coords.longitude);
            });
        } else {
            this.displayMessage('Your browser does not support location data retrieval.','error');
        }
    },
    async displayMessage(msg,cl) {
        setTimeout(()=>{
            this.message
                .html(msg)
                .addClass(cl);
        },1500);
        this.message.empty();
    },
    async displayCurrentLocation(lat,lon) {
        this.getWeather(lat,lon);
    },
    async initSearchForm(e) {
        e.preventDefault();
        var query = this.jq('#search_field').val();
        if(query) {
            var url = 'https://weatherapi-com.p.rapidapi.com/search.json?q='+query;
            var result = await this.readApi(url);
            if(!result) return;
            var html = '';
            result.forEach(el => {
                html += `<li data-lat="${el.lat}" data-lon="${el.lon}">${el.name} - ${el.country}</li>`;
            });
            this.citySelect.html(html);
        }
    },
    async clearSearchField() {
        this.jq('#search_field').val('');
        this.jq('.data').empty();
        this.jq('.content').removeClass('active');
    },
    async initCitySelector(e) {
        var lat = this.jq(e.currentTarget).attr('data-lat');
        var lon = this.jq(e.currentTarget).attr('data-lon');
        this.getWeather(lat,lon);  
        this.citySelect.empty();   
        this.clearSearchField(); 
    },
    async getWeather(lat,lon) {
        var url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q='+lat+'%2C'+lon+'&days=3'; 
        this.displayWeather(url);
    },

}

app.init();

