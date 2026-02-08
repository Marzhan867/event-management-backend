const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");
const heroCity = document.getElementById("heroCity");
const heroPrice = document.getElementById("heroPrice");
const heroDate = document.getElementById("heroDate");

const featuredList = document.getElementById("featuredList");
const calendarStrip = document.getElementById("calendarStrip");
const calendarMonth = document.getElementById("calendarMonth");
const calendarYear = document.getElementById("calendarYear");
const calendarDates = document.getElementById("calendarDates");
const calendarStripMonth = document.getElementById("calendarStripMonth");
const calendarStripYear = document.getElementById("calendarStripYear");
const toggleCalendar = document.getElementById("toggleCalendar");
const toggleFeatured = document.getElementById("toggleFeatured");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");
const priceFilter = document.getElementById("priceFilter");
const navCreateEvent = document.getElementById("navCreateEvent");

const modal = document.getElementById("eventModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalDate = document.getElementById("modalDate");
const modalCity = document.getElementById("modalCity");
const modalPrice = document.getElementById("modalPrice");
const modalMap = document.getElementById("modalMap");
const paymentModal = document.getElementById("paymentModal");
const paymentTitle = document.getElementById("paymentTitle");
const paymentDescription = document.getElementById("paymentDescription");
const paymentEvent = document.getElementById("paymentEvent");
const paymentAmount = document.getElementById("paymentAmount");
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");

const typeLabels = {
  concert: "Concert",
  conference: "Conference",
  workshop: "Workshop",
  meetup: "Meetup",
};

let eventsData = [];
let apiEventsData = [];
let selectedEventId = null;
let lastPaymentEventId = null;
let calendarMonthIndex = null;
let calendarYearValue = null;
let calendarDayFilter = null;
let calendarExpanded = false;
let featuredExpanded = false;

const getToken = () => localStorage.getItem("eventflow_token");
const normalizeText = (value) => (value || "").toString().trim().toLowerCase();

const updateNavAuth = () => {
  const token = getToken();
  const navProfile = document.getElementById("navProfile");
  const navLogout = document.getElementById("navLogout");
  if (!navProfile || !navLogout) return;
  const loggedIn = Boolean(token);
  navProfile.style.display = loggedIn ? "inline-flex" : "none";
  navLogout.style.display = loggedIn ? "inline-flex" : "none";
};

const updateCreateEventVisibility = async () => {
  if (!navCreateEvent) return;
  const token = getToken();
  if (!token) {
    navCreateEvent.style.display = "none";
    return;
  }

  try {
    const response = await fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to load profile");
    }
    const isOrganizer = data.role === "organizer" || data.role === "admin";
    navCreateEvent.style.display = isOrganizer ? "inline-flex" : "none";
  } catch (error) {
    navCreateEvent.style.display = "none";
  }
};

const formatDateParts = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const full = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return { month, day, full };
};

const formatPrice = (price) => (price === 0 ? "Free" : `$${price}`);

const coverGradient = (type) => {
  switch (type) {
    case "concert":
      return "linear-gradient(120deg, rgba(27,26,23,0.75), rgba(182,106,67,0.6))";
    case "conference":
      return "linear-gradient(120deg, rgba(33,44,87,0.85), rgba(182,106,67,0.4))";
    case "workshop":
      return "linear-gradient(120deg, rgba(27,26,23,0.6), rgba(124,78,43,0.6))";
    case "meetup":
      return "linear-gradient(120deg, rgba(52,37,33,0.7), rgba(182,106,67,0.35))";
    default:
      return "linear-gradient(120deg, rgba(27,26,23,0.7), rgba(182,106,67,0.5))";
  }
};

const getEventById = (id) => eventsData.find((event) => event._id === id);

const setSelectedEvent = (event) => {
  if (!event) return;
  selectedEventId = event._id;
  renderHero(event);
  highlightSelectedEvent();
};

const renderHero = (event) => {
  if (!event) {
    heroTitle.textContent = "No events found";
    heroSubtitle.textContent = "Create a new event to start your season.";
    heroCity.textContent = "-";
    heroPrice.textContent = "-";
    heroDate.textContent = "-";
    return;
  }

  const { full } = formatDateParts(event.date);
  heroTitle.textContent = event.title;
  heroSubtitle.textContent = event.description || "Featured event of the week.";
  heroCity.textContent = event.location?.city || "TBA";
  heroPrice.textContent = formatPrice(event.price || 0);
  heroDate.textContent = full;
};

const renderFeatured = (events) => {
  if (!events.length) {
    featuredList.innerHTML =
      '<div class="event-item"><div class="event-info"><h4>No events found</h4><p>Try another date or month.</p></div></div>';
    return;
  }

  const visible = featuredExpanded ? events : events.slice(0, 3);
  featuredList.innerHTML = visible
    .map((event) => {
      const { month, day } = formatDateParts(event.date);
      const typeLabel = typeLabels[event.type] || "Event";
      const coverStyle = event.imageUrl
        ? `background-image: linear-gradient(120deg, rgba(27,26,23,0.55), rgba(182,106,67,0.35)), url('${event.imageUrl}');`
        : `background: ${coverGradient(event.type)};`;
      const isExternal = event.source === "eventbrite";
      const favoriteButton = isExternal
        ? ""
        : `<button class="btn btn-ghost" type="button" data-action="favorite" data-id="${event._id}">Add to Favorites</button>`;
      return `
        <article class="event-item" data-id="${event._id}">
          <div class="event-date">
            <span>${month}</span>
            <strong>${day}</strong>
          </div>
          <div class="event-info">
            <small>${typeLabel}</small>
            <h4>${event.title}</h4>
            <p>${event.location?.city || "TBA"} - ${event.location?.address || "Location to be announced"}</p>
            <div class="event-cover" style="${coverStyle}"></div>
          </div>
          <div class="event-actions">
            <span>${formatPrice(event.price || 0)}</span>
            <button class="btn btn-primary" type="button" data-action="details" data-id="${event._id}">View Details</button>
            ${favoriteButton}
          </div>
        </article>
      `;
    })
    .join("");

  if (toggleFeatured) {
    toggleFeatured.style.display = events.length > 3 ? "inline-flex" : "none";
    toggleFeatured.textContent = featuredExpanded ? "‹" : "›";
  }
};

const renderCalendarStrip = (events) => {
  if (!events.length) {
    calendarStrip.innerHTML =
      '<div class="calendar-card-item"><strong>No events in this month</strong><span>Please choose another month.</span></div>';
    return;
  }

  const visible = calendarExpanded ? events : events.slice(0, 9);
  calendarStrip.innerHTML = visible
    .map((event) => {
      const { full } = formatDateParts(event.date);
      return `
        <div class="calendar-card-item" data-id="${event._id}">
          <strong>${event.title}</strong>
          <span>${full}</span>
          <span>${event.location?.city || "TBA"}</span>
        </div>
      `;
    })
    .join("");

  if (toggleCalendar) {
    toggleCalendar.style.display = events.length > 9 ? "inline-flex" : "none";
    toggleCalendar.textContent = calendarExpanded ? "Show less" : "Show all";
  }
};

const renderSidebarCalendar = (events) => {
  const fallbackDate = new Date();
  if (calendarMonthIndex === null) {
    calendarMonthIndex = fallbackDate.getMonth();
  }
  if (calendarYearValue === null) {
    calendarYearValue = fallbackDate.getFullYear();
  }

  const monthName = new Date(calendarYearValue, calendarMonthIndex, 1).toLocaleDateString("en-US", { month: "long" });
  calendarMonth.textContent = monthName;
  calendarYear.textContent = `${calendarYearValue}`;

  const firstOfMonth = new Date(calendarYearValue, calendarMonthIndex, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday as first
  const daysInMonth = new Date(calendarYearValue, calendarMonthIndex + 1, 0).getDate();

  const eventDays = new Set(
    events
      .filter((event) => {
        const date = new Date(event.date);
        return date.getFullYear() === calendarYearValue && date.getMonth() === calendarMonthIndex;
      })
      .map((event) => new Date(event.date).getDate())
  );

  const blanks = Array.from({ length: startDay }, () => `<span class="empty"> </span>`).join("");
  const days = Array.from({ length: daysInMonth }, (_, idx) => idx + 1)
    .map((day) => {
      const hasEvent = eventDays.has(day);
      const className = [
        hasEvent ? "has-event" : "empty",
        calendarDayFilter === day ? "active" : ""
      ]
        .filter(Boolean)
        .join(" ");
      return `<span class="${className}" data-day="${day}">${day}</span>`;
    })
    .join("");

  calendarDates.innerHTML = `${blanks}${days}`;
};

const filterEventsForMonth = () => {
  const query = normalizeText(searchInput?.value);
  const typeValue = typeFilter?.value || "all";
  const priceValue = priceFilter?.value || "all";

  return eventsData.filter((event) => {
    if (typeValue !== "all" && event.type !== typeValue) {
      return false;
    }

    const price = Number(event.price || 0);
    if (priceValue === "free" && price !== 0) return false;
    if (priceValue === "under50" && price > 50) return false;
    if (priceValue === "under150" && price > 150) return false;

    if (query) {
      const title = normalizeText(event.title);
      const city = normalizeText(event.location?.city);
      if (!title.includes(query) && !city.includes(query)) {
        return false;
      }
    }
    return true;
  });
};

const filterEventsForDay = (day) => {
  return eventsData.filter((event) => {
    const date = new Date(event.date);
    return (
      date.getFullYear() === calendarYearValue &&
      date.getMonth() === calendarMonthIndex &&
      date.getDate() === day
    );
  });
};

const refreshFeaturedForCalendar = () => {
  const byMonth = filterEventsForMonth();
  if (calendarDayFilter) {
    const byDay = byMonth.filter((event) => new Date(event.date).getDate() === calendarDayFilter);
    renderFeatured(byDay);
  } else {
    renderFeatured(byMonth);
  }
};

const refreshCalendarStripForMonth = () => {
  if (calendarMonthIndex === null || calendarYearValue === null) {
    const now = new Date();
    calendarYearValue = now.getFullYear();
    calendarMonthIndex = now.getMonth();
  }
  if (calendarStripMonth && calendarStripYear) {
    const labelDate = new Date(calendarYearValue, calendarMonthIndex, 1);
    calendarStripMonth.textContent = labelDate.toLocaleDateString("en-US", { month: "long" });
    calendarStripYear.textContent = `${calendarYearValue}`;
  }
  renderCalendarStrip(filterEventsForMonth());
};

const buildMonthRange = (year, monthIndex) => {
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));
  return { start: start.toISOString(), end: end.toISOString() };
};

const fetchEventsForMonth = async () => {
  const response = await fetch("/api/events");
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${response.status} ${text}`);
  }
  const all = await response.json();
  const byMonth = all.filter((event) => {
    const date = new Date(event.date);
    return date.getFullYear() === calendarYearValue && date.getMonth() === calendarMonthIndex;
  });

  const seen = new Set();
  return byMonth.filter((event) => {
    const key = `${event.source || "local"}:${event._id || event.id || event.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ensureSelectedEvent = (visibleEvents) => {
  if (!visibleEvents.length) {
    renderHero(null);
    selectedEventId = null;
    return;
  }

  const stillVisible = visibleEvents.find((event) => event._id === selectedEventId);
  if (!stillVisible) {
    setSelectedEvent(visibleEvents[0]);
  } else {
    renderHero(stillVisible);
  }
};

const applyFiltersAndRender = () => {
  const filtered = filterEventsForMonth();
  const filteredForDay = calendarDayFilter
    ? filtered.filter((event) => new Date(event.date).getDate() === calendarDayFilter)
    : filtered;

  renderSidebarCalendar(filtered);
  renderCalendarStrip(filtered);
  renderFeatured(filteredForDay);
  ensureSelectedEvent(filteredForDay.length ? filteredForDay : filtered);
  highlightSelectedEvent();
};

const highlightSelectedEvent = () => {
  document.querySelectorAll(".event-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.id === selectedEventId);
  });
};

const openModal = (event) => {
  if (!event) return;
  const { full } = formatDateParts(event.date);
  modalTitle.textContent = event.title;
  modalDescription.textContent = event.description || "Details coming soon.";
  modalDate.textContent = full;
  modalCity.textContent = event.location?.city || "TBA";
  modalPrice.textContent = formatPrice(event.price || 0);
  if (modalMap) {
    if (event.location?.mapUrl) {
      modalMap.href = event.location.mapUrl;
      modalMap.style.display = "inline-flex";
    } else {
      modalMap.style.display = "none";
    }
  }
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
};

const openPayment = (event) => {
  if (!event) return;
  lastPaymentEventId = event._id;
  paymentTitle.textContent = "Checkout";
  paymentDescription.textContent = "Complete payment to reserve your seat.";
  paymentEvent.textContent = event.title;
  paymentAmount.textContent = formatPrice(event.price || 0);
  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.reset();
  }
  paymentModal.classList.add("show");
  paymentModal.setAttribute("aria-hidden", "false");
};

const closePayment = () => {
  paymentModal.classList.remove("show");
  paymentModal.setAttribute("aria-hidden", "true");
};

const openContact = () => {
  if (!contactModal) return;
  contactModal.classList.add("show");
  contactModal.setAttribute("aria-hidden", "false");
};

const closeContact = () => {
  if (!contactModal) return;
  contactModal.classList.remove("show");
  contactModal.setAttribute("aria-hidden", "true");
};

let toastTimer = null;
const showToast = (title, message) => {
  if (!toast) return;
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 3000);
};

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleAction = (action, eventId) => {
  const event = eventId ? getEventById(eventId) : getEventById(selectedEventId);
  if (event) {
    setSelectedEvent(event);
  }

  switch (action) {
    case "prev-month-sidebar":
    case "prev-month-strip": {
      calendarMonthIndex -= 1;
      if (calendarMonthIndex < 0) {
        calendarMonthIndex = 11;
      }
      calendarDayFilter = null;
      fetchEventsForMonth()
        .then((data) => {
          eventsData = data;
          applyFiltersAndRender();
        })
        .catch(console.error);
      break;
    }
    case "next-month-sidebar":
    case "next-month-strip": {
      calendarMonthIndex += 1;
      if (calendarMonthIndex > 11) {
        calendarMonthIndex = 0;
      }
      calendarDayFilter = null;
      fetchEventsForMonth()
        .then((data) => {
          eventsData = data;
          applyFiltersAndRender();
        })
        .catch(console.error);
      break;
    }
    case "schedule":
      scrollToSection("featured");
      break;
    case "calendar":
      scrollToSection("calendar");
      break;
    case "contact":
      openContact();
      break;
    case "scroll-footer":
      scrollToSection("footer");
      break;
    case "details":
      openModal(event || eventsData[0]);
      break;
    case "tickets": {
      const target = event || eventsData[0];
      if (!target || !target._id) {
        showToast("Registration failed", "Event not found.");
        break;
      }
      const token = getToken();
      if (!token) {
        window.location.href = "login.html";
        break;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      fetch(`/api/events/${target._id}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Unable to register");
          }
          openPayment(target);
        })
        .catch((err) => {
          showToast("Registration failed", err.name === "AbortError" ? "Request timed out." : err.message);
        })
        .finally(() => clearTimeout(timeout));
      break;
    }
    case "favorite": {
      const token = getToken();
      if (!token) {
        window.location.href = "login.html";
        break;
      }
      if (!event) break;
      fetch(`/api/users/favorites/${event._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        alert("Added to favorites");
      });
      break;
    }
    case "logout":
      localStorage.removeItem("eventflow_token");
      updateNavAuth();
      break;
    case "close-payment":
      closePayment();
      break;
    case "close-contact":
      closeContact();
      break;
    case "send-contact": {
      if (!contactForm || !contactForm.reportValidity()) {
        break;
      }
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Unable to send");
          }
          contactForm.reset();
          closeContact();
          showToast("Sent", "Your message was sent.");
        })
        .catch((err) => showToast("Error", err.message));
      break;
    }
    case "pay-now": {
      const paymentForm = document.getElementById("paymentForm");
      if (paymentForm && !paymentForm.reportValidity()) {
        break;
      }
      closePayment();
      showToast("Payment successful", "Your ticket has been reserved.");
      break;
    }
    case "close-modal":
      closeModal();
      break;
    default:
      break;
  }
};

document.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    const eventId = actionBtn.dataset.id;
    handleAction(action, eventId);
    return;
  }

  const calendarCard = e.target.closest(".calendar-card-item");
  if (calendarCard) {
    const event = getEventById(calendarCard.dataset.id);
    if (event) {
      setSelectedEvent(event);
      scrollToSection("featured");
    }
  }

  const eventItem = e.target.closest(".event-item");
  if (eventItem) {
    const event = getEventById(eventItem.dataset.id);
    if (event) {
      setSelectedEvent(event);
      renderSidebarCalendar(eventsData);
    }
  }

  if (e.target === modal) {
    closeModal();
  }

  if (e.target === paymentModal) {
    closePayment();
  }
  if (e.target === contactModal) {
    closeContact();
  }

  const toastClose = e.target.closest(".toast-close");
  if (toastClose && toast) {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closePayment();
    closeContact();
  }
});

calendarDates.addEventListener("click", (e) => {
  const day = Number(e.target.dataset.day);
  if (!day) return;
  calendarDayFilter = day;
  applyFiltersAndRender();
});

const loadEvents = async () => {
  try {
    const now = new Date();
    calendarYearValue = now.getFullYear();
    calendarMonthIndex = now.getMonth();
    eventsData = await fetchEventsForMonth();
    eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
    apiEventsData.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (eventsData[0]) {
      setSelectedEvent(eventsData[0]);
    } else {
      renderHero(null);
    }
    renderSidebarCalendar(eventsData);
    refreshCalendarStripForMonth();
    refreshFeaturedForCalendar();
    updateNavAuth();
    updateCreateEventVisibility();

    if (toggleCalendar) {
      toggleCalendar.addEventListener("click", () => {
        calendarExpanded = !calendarExpanded;
        renderCalendarStrip(filterEventsForMonth());
      });
    }

    if (toggleFeatured) {
      toggleFeatured.addEventListener("click", () => {
        featuredExpanded = !featuredExpanded;
        const filtered = filterEventsForMonth();
        const filteredForDay = calendarDayFilter
          ? filtered.filter((event) => new Date(event.date).getDate() === calendarDayFilter)
          : filtered;
        renderFeatured(filteredForDay);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        calendarDayFilter = null;
        applyFiltersAndRender();
      });
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", () => {
        calendarDayFilter = null;
        applyFiltersAndRender();
      });
    }
    if (priceFilter) {
      priceFilter.addEventListener("change", () => {
        calendarDayFilter = null;
        applyFiltersAndRender();
      });
    }
  } catch (error) {
    console.error(error);
    renderHero(null);
    featuredList.innerHTML =
      '<div class="event-item"><div class="event-info"><h4>Unable to load events</h4><p>Please check the server connection.</p></div></div>';
    calendarStrip.innerHTML = "";
    calendarDates.innerHTML = "";
  }
};

loadEvents();
