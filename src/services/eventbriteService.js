const mapEventbriteEvent = (event) => {
  const venue = event.venue || {};
  const address = venue.address || {};
  return {
    _id: event.id,
    title: event.name?.text || "Untitled event",
    description: event.description?.text || "",
    type: (event.category?.name || "event").toLowerCase(),
    date: event.start?.local || event.start?.utc,
    location: {
      city: address.city || "TBA",
      address: address.localized_address_display || address.address_1 || "TBA",
      coordinates: {
        lat: address.latitude ? Number(address.latitude) : null,
        lng: address.longitude ? Number(address.longitude) : null
      },
      mapUrl: event.url || ""
    },
    imageUrl: event.logo?.url || "",
    price: event.ticket_availability?.minimum_ticket_price?.major_value
      ? Number(event.ticket_availability.minimum_ticket_price.major_value)
      : 0,
    source: "eventbrite"
  };
};

const fetchEventbriteEvents = async ({ token, organizationId, city }) => {
  const url = new URL(
    `https://www.eventbriteapi.com/v3/organizations/${organizationId}/events/`
  );
  url.searchParams.set("expand", "venue,category,ticket_availability");
  url.searchParams.set("status", "live,started,ended");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Eventbrite API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const events = Array.isArray(data.events) ? data.events : [];
  const filtered = city
    ? events.filter((event) => {
        const eventCity = event.venue?.address?.city || "";
        return eventCity.toLowerCase().includes(city.toLowerCase());
      })
    : events;

  return filtered.map(mapEventbriteEvent);
};

module.exports = { fetchEventbriteEvents };
