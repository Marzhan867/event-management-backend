const mapTicketmasterEvent = (event) => {
  const venue = event._embedded?.venues?.[0] || {};
  const address = venue.address || {};
  const city = venue.city?.name || "TBA";
  const image =
    event.images?.find((img) => img.ratio === "16_9" && img.width >= 640) ||
    event.images?.[0] ||
    null;
  const date = event.dates?.start?.localDate
    ? `${event.dates.start.localDate}T${event.dates.start.localTime || "00:00:00"}`
    : event.dates?.start?.dateTime;

  return {
    _id: event.id,
    title: event.name || "Untitled event",
    description: event.info || event.pleaseNote || "",
    type: event.classifications?.[0]?.segment?.name?.toLowerCase() || "event",
    date,
    location: {
      city,
      address: address.line1 || venue.name || "TBA",
      coordinates: {
        lat: venue.location?.latitude ? Number(venue.location.latitude) : null,
        lng: venue.location?.longitude ? Number(venue.location.longitude) : null
      },
      mapUrl: event.url || ""
    },
    imageUrl: image?.url || "",
    price: event.priceRanges?.[0]?.min || 0,
    source: "ticketmaster"
  };
};

const fetchTicketmasterEvents = async ({ apiKey, city, country, size, startDateTime, endDateTime }) => {
  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("size", String(size));
  if (city) url.searchParams.set("city", city);
  if (country) url.searchParams.set("countryCode", country);
  if (startDateTime) url.searchParams.set("startDateTime", startDateTime);
  if (endDateTime) url.searchParams.set("endDateTime", endDateTime);

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ticketmaster API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const events = data._embedded?.events || [];
  return events.map(mapTicketmasterEvent);
};

module.exports = { fetchTicketmasterEvents };
