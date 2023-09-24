import {DateTime} from "luxon";


const API_KEY = "23cb4deaee603f0a70dc15abf110dfc8";
const BASE_URL_NAME = "https://api.openweathermap.org/data/2.5";
const BASE_URL_COORDS = "https://api.openweathermap.org/data/3.0";

const getWeatherData = async (infoType, searchParams) => {
  let base_url;
  if (infoType === 'weather') {
    base_url = BASE_URL_NAME;
  } else if (infoType === 'onecall') {
    base_url = BASE_URL_COORDS;
  } else {
    
    throw new Error(`Invalid infoType: ${infoType}`);
  }

  const url = new URL(`${base_url}/${infoType}`);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
};


const formatCurrentWeather = (data)=>{
 const {
        coord: {lat, lon},
        main: {temp, feels_like, temp_min, temp_max, humidity},
        name,
        dt,
        sys: {country, sunrise, sunset},
        weather: [{ main: details, icon, description }], 

        wind: {speed},
 } = data

  return {lat, lon, feels_like, temp_min, temp_max, temp, humidity,name, dt, country, sunrise, sunset, details, icon, speed, description};
};
const formatForecastWeather = (data) => {
  let { timezone, daily, hourly } = data;

  if (!daily || !hourly) {
    return { timezone, daily: [], hourly: [] };
  }

  daily = daily.slice(1, 6).map((d) => {
    const {  description } = d.weather[0];
    return {
      title: formatToLocalTime(d.dt, timezone, 'ccc'),
      temp: d.temp.day,
      icon: d.weather[0].icon,
      description, 
    };
  });

  hourly = hourly.slice(1, 6).map((d) => {
    const {  description } = d.weather[0];
    return {
      title: formatToLocalTime(d.dt, timezone, 'hh:mm a'),
      temp: d.temp,
      icon: d.weather[0].icon,
      description, 
    };
  });

  return { timezone, daily, hourly };
};

    
    
    

const getFormattedWeatherData = async (searchParams) => {
  const formattedCurrentWeather =  await getWeatherData('weather', searchParams).then(formatCurrentWeather)

  const {lat, lon} = formattedCurrentWeather
   const formattedForecastWeather = await getWeatherData('onecall',{
        lat, lon, exclud: 'current,minutely, alerts', units: searchParams.units
   } ).then(formatForecastWeather)
  return { ...formattedCurrentWeather, ...formattedForecastWeather};
};
const formatToLocalTime = (secs, zone, format = "cccc, dd MMM yyyy' | Local time: 'hh:mm a") => {
  return DateTime.fromSeconds(secs, { zone }).toFormat(format);
};

const iconUrlFromCode = (code) => `http://openweathermap.org/img/wn/${code}.png`;


export default getFormattedWeatherData;
export {formatToLocalTime, iconUrlFromCode};
