export interface EnvironmentalData {
  tempMaxC: number;
  uvIndexMax: number;
  condition: string;
}

export async function getEventWeather(lat: number, lon: number): Promise<EnvironmentalData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,uv_index_max,weather_code&timezone=auto`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  
  const data = await res.json();
  
  return {
    tempMaxC: data.daily.temperature_2m_max[0],
    uvIndexMax: data.daily.uv_index_max[0],
    condition: data.daily.weather_code[0] > 3 ? 'Humid / Sunny' : 'Clear',
  };
}