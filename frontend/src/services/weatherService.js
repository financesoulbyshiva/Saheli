/**
 * Open-Meteo Weather Service for SAHELI
 * Free, open-access meteorological data without proprietary API keys.
 * Endpoint: https://api.open-meteo.com/v1/forecast
 * Attribution: Open-Meteo (https://open-meteo.com/) under CC BY 4.0
 */

// In-memory cache to prevent excessive requests (15-minute validity)
const weatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

export const WMO_CODE_MAP = {
  0: { label: 'Clear Sky', icon: '☀️', safeCategory: 'clear' },
  1: { label: 'Mainly Clear', icon: '🌤️', safeCategory: 'clear' },
  2: { label: 'Partly Cloudy', icon: '⛅', safeCategory: 'cloudy' },
  3: { label: 'Overcast', icon: '☁️', safeCategory: 'cloudy' },
  45: { label: 'Fog', icon: '🌫️', safeCategory: 'low_visibility' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️', safeCategory: 'low_visibility' },
  51: { label: 'Light Drizzle', icon: '🌦️', safeCategory: 'light_rain' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', safeCategory: 'light_rain' },
  55: { label: 'Dense Drizzle', icon: '🌧️', safeCategory: 'rain' },
  56: { label: 'Light Freezing Drizzle', icon: '🌨️', safeCategory: 'adverse' },
  57: { label: 'Dense Freezing Drizzle', icon: '🌨️', safeCategory: 'adverse' },
  61: { label: 'Slight Rain', icon: '🌦️', safeCategory: 'light_rain' },
  63: { label: 'Moderate Rain', icon: '🌧️', safeCategory: 'rain' },
  65: { label: 'Heavy Rain', icon: '🌧️', safeCategory: 'heavy_rain' },
  66: { label: 'Freezing Rain', icon: '🌨️', safeCategory: 'adverse' },
  67: { label: 'Heavy Freezing Rain', icon: '🌨️', safeCategory: 'adverse' },
  71: { label: 'Slight Snow Fall', icon: '🌨️', safeCategory: 'snow' },
  73: { label: 'Moderate Snow Fall', icon: '❄️', safeCategory: 'snow' },
  75: { label: 'Heavy Snow Fall', icon: '❄️', safeCategory: 'adverse' },
  77: { label: 'Snow Grains', icon: '❄️', safeCategory: 'snow' },
  80: { label: 'Slight Rain Showers', icon: '🌦️', safeCategory: 'light_rain' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️', safeCategory: 'rain' },
  82: { label: 'Violent Rain Showers', icon: '⛈️', safeCategory: 'heavy_rain' },
  85: { label: 'Slight Snow Showers', icon: '🌨️', safeCategory: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: '❄️', safeCategory: 'adverse' },
  95: { label: 'Thunderstorm', icon: '⛈️', safeCategory: 'severe' },
  96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️', safeCategory: 'severe' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️', safeCategory: 'severe' },
};

/**
 * Evaluates real weather conditions to generate practical outdoor safety context
 */
function evaluateWeatherSafetyContext({ temperature, precipitation, windSpeed, weatherCode }) {
  const alerts = [];

  if (temperature >= 40) {
    alerts.push({
      level: 'warning',
      title: 'Extreme Heat Caution',
      message: `Current temperature is ${temperature}°C. Stay hydrated and prioritize shaded or air-conditioned safe havens.`,
    });
  } else if (temperature <= 5) {
    alerts.push({
      level: 'caution',
      title: 'Low Temperature Advisory',
      message: `Cold conditions (${temperature}°C). Ensure protective attire on late evening walks.`,
    });
  }

  if (weatherCode in [95, 96, 99]) {
    alerts.push({
      level: 'danger',
      title: 'Active Thunderstorm Alert',
      message: 'Severe electrical storm active. Avoid open parks and metallic bus stands; seek shelter in verified indoor havens.',
    });
  } else if (precipitation > 8 || weatherCode === 65 || weatherCode === 82) {
    alerts.push({
      level: 'warning',
      title: 'Heavy Rainfall Notice',
      message: 'Intense rain may impair visibility and cause waterlogging. Coordinate with your trusted circle for transit updates.',
    });
  }

  if (windSpeed >= 38) {
    alerts.push({
      level: 'caution',
      title: 'High Wind Velocity',
      message: `Sustained winds of ${windSpeed} km/h recorded. Exercise caution around tall trees and temporary construction.`,
    });
  }

  return alerts;
}

/**
 * Fetch real live weather from Open-Meteo using real user coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getLiveWeather(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { success: false, error: 'Valid numerical latitude and longitude are required.' };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { success: false, error: 'Coordinates are out of geographical range.' };
  }

  // Create rounded cache key (approx ~1km area)
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, data: cached.data, isCached: true };
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
    );
    url.searchParams.set('hourly', 'precipitation_probability');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'auto');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Open-Meteo returned status ${response.status}: Service temporarily unavailable.`,
      };
    }

    const payload = await response.json();
    const current = payload.current;

    if (!current) {
      return { success: false, error: 'Invalid response structure from weather service.' };
    }

    const weatherCode = current.weather_code ?? 0;
    const meta = WMO_CODE_MAP[weatherCode] || { label: 'Weather condition recorded', icon: '🌤️', safeCategory: 'clear' };

    // Get current hour rain probability if available
    let rainProbability = null;
    if (payload.hourly?.precipitation_probability?.length) {
      const currentHour = new Date().getHours();
      rainProbability = payload.hourly.precipitation_probability[currentHour] ?? payload.hourly.precipitation_probability[0];
    }

    const weatherData = {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      relativeHumidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode,
      condition: meta.label,
      icon: meta.icon,
      rainProbability,
      elevation: payload.elevation,
      timezone: payload.timezone,
      latitude: payload.latitude,
      longitude: payload.longitude,
      lastUpdated: current.time ? new Date(current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      safetyAlerts: evaluateWeatherSafetyContext({
        temperature: current.temperature_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        weatherCode,
      }),
      attribution: 'Open-Meteo (CC BY 4.0)',
      attributionUrl: 'https://open-meteo.com/',
    };

    weatherCache.set(cacheKey, { timestamp: now, data: weatherData });

    return { success: true, data: weatherData, isCached: false };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Weather request timed out. Please check your network connection.' };
    }
    return { success: false, error: `Weather service error: ${err.message || 'Unable to connect'}` };
  }
}
