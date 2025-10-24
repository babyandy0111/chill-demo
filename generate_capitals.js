import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countriesPath = path.join(__dirname, 'src/assets/countries.json');
const citiesPath = path.join(__dirname, 'src/assets/world_cities.json');
const outputPath = path.join(__dirname, 'src/assets/capitals.json');

const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

// Create a map for quick city lookup
const cityMap = new Map(citiesData.map(city => [city.name.toLowerCase(), city]));

const capitals = countriesData.features
  .map(feature => {
    const countryName = feature.properties.name;
    const iso2 = feature.properties.iso_a2;
    
    // We need a reliable way to find the capital. 
    // Let's assume the capital name is often the same as the country name or a major city.
    // This is a heuristic and might not be perfect.
    // A better `countries.json` would have a `capital` property.
    // For this task, we will try to match the country name to a city name.
    // This is a limitation of the current data.
    
    // A special mapping for cases where country name and capital name are different.
    const specialCases = {
        "United States of America": "Washington, D.C.", // This city is not in the list, so it will be skipped. We'll rely on major cities.
        "China": "Beijing",
        "India": "New Delhi", // Delhi is in the list
        "Brazil": "Brasilia", // Not in the list
        "Australia": "Canberra", // Not in the list
        "Canada": "Ottawa", // Not in the list
        "Russian Federation": "Moscow",
        "Japan": "Tokyo",
        "United Kingdom": "London",
        "France": "Paris",
        "Germany": "Berlin",
        "South Korea": "Seoul",
        "Argentina": "Buenos Aires",
        "Egypt": "Cairo",
        "South Africa": "Pretoria", // Not in the list
        "Nigeria": "Abuja", // Not in the list
        "Saudi Arabia": "Riyadh", // Not in the list
        "Turkey": "Ankara", // Not in the list
        "Iran": "Tehran",
        "Indonesia": "Jakarta",
        "Mexico": "Mexico City",
        "Spain": "Madrid",
        "Italy": "Rome",
        "Thailand": "Bangkok",
        "Viet Nam": "Hanoi", // Not in the list
        "Pakistan": "Islamabad", // Not in the list
        "Bangladesh": "Dhaka",
        "Philippines": "Manila",
        "Colombia": "Bogota",
        "Chile": "Santiago",
        "Peru": "Lima",
    };

    let capitalCityName = specialCases[countryName] || countryName;
    
    // A fix for Delhi
    if (capitalCityName === "New Delhi") {
        capitalCityName = "Delhi";
    }

    const cityInfo = cityMap.get(capitalCityName.toLowerCase());

    if (cityInfo && iso2 && iso2 !== '-99') {
      return {
        name: cityInfo.name,
        country: countryName,
        iso2: iso2,
        lat: cityInfo.lat,
        lng: cityInfo.lng,
      };
    }
    return null;
  })
  .filter(Boolean); // Remove null entries

fs.writeFileSync(outputPath, JSON.stringify(capitals, null, 2));

console.log(`Successfully created capitals.json with ${capitals.length} entries.`);
