// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate energy consumption for a given distance
const calculateEnergyConsumption = (distance, consumptionRate) => {
  return (distance * consumptionRate) / 100; // consumptionRate is in kWh/100km
};

// Charging time from 0% to 100%
const calculateChargingTimeFull = (batteryCapacity, chargerPower) => {
  return (batteryCapacity / chargerPower) * 60; // minutes
};

// Calculate charging cost
const calculateChargingCostFull = (batteryCapacity, pricePerKWh) => {
  return batteryCapacity * pricePerKWh;
};

// Check if station is approximately in the direction of the destination
const isOnTheWay = (current, station, end) => {
  const toStation = [station[0] - current[0], station[1] - current[1]];
  const toEnd = [end[0] - current[0], end[1] - current[1]];

  const dot = toStation[0] * toEnd[0] + toStation[1] * toEnd[1];
  const magA = Math.sqrt(toStation[0] ** 2 + toStation[1] ** 2);
  const magB = Math.sqrt(toEnd[0] ** 2 + toEnd[1] ** 2);

  const cosTheta = dot / (magA * magB);
  return cosTheta > 0.8;
};

// Find the best charging station within current range and direction
const findBestChargingStation = (
  stations,
  location,
  endLocation,
  batteryLevel,
  batteryCapacity,
  consumptionRate
) => {
  const autonomyKm =
    (batteryLevel / 100) * batteryCapacity * (100 / consumptionRate);

  return stations
    .filter((station) => {
      const distance = calculateDistance(
        location[0],
        location[1],
        station.location[0],
        station.location[1]
      );
      const chargers = station.chargers.filter(
        (c) => c.chargerStatus === "AVAILABLE"
      );
      return (
        chargers.length > 0 &&
        isOnTheWay(location, station.location, endLocation) &&
        distance <= autonomyKm
      );
    })
    .sort((a, b) => {
      const distA = calculateDistance(
        location[0],
        location[1],
        a.location[0],
        a.location[1]
      );
      const distB = calculateDistance(
        location[0],
        location[1],
        b.location[0],
        b.location[1]
      );
      return distA - distB;
    })[0];
};

// Main function to calculate the route with charging stops
export const calculateRoute = (
  startLocation,
  endLocation,
  vehicle,
  stations
) => {
  const {
    usable_battery_size: batteryCapacity,
    energy_consumption: { average_consumption: consumptionRate },
  } = vehicle;

  const route = {
    coordinates: [startLocation],
    stops: [],
  };

  let currentLocation = startLocation;
  let batteryLevel = 100;
  const visitedStations = new Set();

  while (true) {
    const distanceToEnd = calculateDistance(
      currentLocation[0],
      currentLocation[1],
      endLocation[0],
      endLocation[1]
    );
    const energyToEnd = calculateEnergyConsumption(
      distanceToEnd,
      consumptionRate
    );
    const batteryNeeded = (energyToEnd / batteryCapacity) * 100;

    if (batteryLevel >= batteryNeeded) {
      route.coordinates.push(endLocation);
      break;
    }

    const nextStation = findBestChargingStation(
      stations,
      currentLocation,
      endLocation,
      batteryLevel,
      batteryCapacity,
      consumptionRate
    );

    if (!nextStation) {
      throw new Error("No suitable charging station found on the way");
    }

    if (visitedStations.has(nextStation.id)) {
      throw new Error("Loop detected – already visited this station");
    }
    visitedStations.add(nextStation.id);

    const distanceToStation = calculateDistance(
      currentLocation[0],
      currentLocation[1],
      nextStation.location[0],
      nextStation.location[1]
    );
    const energyToStation = calculateEnergyConsumption(
      distanceToStation,
      consumptionRate
    );
    batteryLevel -= (energyToStation / batteryCapacity) * 100;

    if (batteryLevel < 0) {
      throw new Error("Cannot reach next charging station");
    }

    const charger = nextStation.chargers
      .filter((c) => c.chargerStatus === "AVAILABLE")
      .sort((a, b) => b.chargingSpeed - a.chargingSpeed)[0];

    const chargingTime = calculateChargingTimeFull(
      batteryCapacity,
      charger.chargingSpeed
    );
    const cost = calculateChargingCostFull(
      batteryCapacity,
      charger.pricePerKWh
    );

    route.stops.push({
      city: nextStation.city,
      chargingTime: Math.round(chargingTime),
      cost: parseFloat(cost.toFixed(2)),
      batteryLevel: 100,
    });

    route.coordinates.push(nextStation.location);
    currentLocation = nextStation.location;
    batteryLevel = 100;
  }

  return route;
};
