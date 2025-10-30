import { useEffect } from 'react';
import { useAppStore } from '../store';

const geocodeCache = new Map();
const CACHE_GRID_SIZE = 0.5;

export function useGeocoding(selectedCell) {
    const updateSelectedCellInfo = useAppStore((state) => state.updateSelectedCellInfo);

    useEffect(() => {
        if (!selectedCell || !selectedCell.isLoading) {
            return;
        }

        const { position } = selectedCell;
        const cacheKey = `${Math.floor(position.lat / CACHE_GRID_SIZE)}_${Math.floor(position.lng / CACHE_GRID_SIZE)}`;

        const geocode = async () => {
            if (geocodeCache.has(cacheKey)) {
                updateSelectedCellInfo(geocodeCache.get(cacheKey));
                return;
            }

            try {
                const geocoder = new window.google.maps.Geocoder();
                const response = await geocoder.geocode({ location: position });
                let regionData;
                if (response.results && response.results[0]) {
                    const address = response.results[0].address_components;
                    const country = address.find(c => c.types.includes('country'));
                    const region = address.find(c => c.types.includes('administrative_area_level_1'));
                    const countryName = country ? country.long_name : '未知領域';
                    const countryCode = country ? country.short_name.toLowerCase() : null;
                    const regionName = region ? region.long_name : '';
                    const flagUrl = countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : null;
                    regionData = { countryName, regionName, flagUrl };
                } else {
                    regionData = { countryName: '無法取得地點資訊', regionName: '', flagUrl: null };
                }
                geocodeCache.set(cacheKey, regionData);
                updateSelectedCellInfo(regionData);
            } catch (error) {
                console.error("Geocoding failed:", error);
                const errorData = { countryName: '地理資訊查詢失敗', regionName: '', flagUrl: null };
                geocodeCache.set(cacheKey, errorData);
                updateSelectedCellInfo(errorData);
            }
        };

        geocode();
    }, [selectedCell, updateSelectedCellInfo]);
}
