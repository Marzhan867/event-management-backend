const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesMessage = document.getElementById("favoritesMessage");
const createdGrid = document.getElementById("createdGrid");
const createdMessage = document.getElementById("createdMessage");
const toggleCreated = document.getElementById("toggleCreated");
const myEventsGrid = document.getElementById("myEventsGrid");
const myEventsMessage = document.getElementById("myEventsMessage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");

const getToken = () => localStorage.getItem("eventflow_token");

const apiFetch = async (url) => {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const renderFavorites = (favorites) => {
  if (!favorites.length) {
    favoritesGrid.innerHTML = "";
    favoritesMessage.textContent = "No favorites yet.";
    return;
  }

  favoritesMessage.textContent = "";
  favoritesGrid.innerHTML = favorites
    .map((event) => {
      const date = new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      return `
        <div class="favorite-card">
          <strong>${event.title}</strong>
          <span>${date}</span>
          <span>${event.location?.city || "TBA"}</span>
          <button class="btn btn-outline" data-action="remove-favorite" data-id="${event._id}">Remove</button>
        </div>
      `;
    })
    .join("");
};

let createdExpanded = false;
const renderCreated = (events) => {
  if (!events.length) {
    createdGrid.innerHTML = "";
    createdMessage.textContent = "No created events yet.";
    return;
  }
  createdMessage.textContent = "";
  const visible = createdExpanded ? events : events.slice(0, 6);
  createdGrid.innerHTML = visible
    .map((event) => {
      const date = new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      return `
        <div class="favorite-card">
          <strong>${event.title}</strong>
          <span>${date}</span>
          <span>${event.location?.city || "TBA"}</span>
          <button class="btn btn-outline" data-action="delete-event" data-id="${event._id}">Delete</button>
        </div>
      `;
    })
    .join("");

  if (toggleCreated) {
    toggleCreated.style.display = events.length > 6 ? "inline-flex" : "none";
    toggleCreated.textContent = createdExpanded ? "Show less" : "Show all";
  }
};

const renderMyEvents = (events) => {
  if (!events.length) {
    myEventsGrid.innerHTML = "";
    myEventsMessage.textContent = "No registered events yet.";
    return;
  }
  myEventsMessage.textContent = "";
  myEventsGrid.innerHTML = events
    .map((event) => {
      const date = new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      return `
        <div class="favorite-card">
          <strong>${event.title}</strong>
          <span>${date}</span>
          <span>${event.location?.city || "TBA"}</span>
          <button class="btn btn-outline" data-action="unregister-event" data-id="${event._id}">Unregister</button>
        </div>
      `;
    })
    .join("");
};

const loadProfile = async () => {
  try {
    const profile = await apiFetch("/api/users/profile");
    profileName.textContent = `Name: ${profile.name}`;
    profileEmail.textContent = `Email: ${profile.email}`;
    profileRole.textContent = `Role: ${profile.role}`;

    const favorites = await apiFetch("/api/users/favorites");
    renderFavorites(favorites);

    const created = await apiFetch("/api/users/created-events");
    renderCreated(created);

    const myEvents = await apiFetch("/api/users/my-events");
    renderMyEvents(myEvents);
  } catch (error) {
    favoritesMessage.textContent = error.message;
    createdMessage.textContent = error.message;
    myEventsMessage.textContent = error.message;
  }
};

loadProfile();

if (toggleCreated) {
  toggleCreated.addEventListener("click", async () => {
    createdExpanded = !createdExpanded;
    try {
      const created = await apiFetch("/api/users/created-events");
      renderCreated(created);
    } catch (error) {
      createdMessage.textContent = error.message;
    }
  });
}

document.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest('[data-action="delete-event"]');
  const unregisterBtn = e.target.closest('[data-action="unregister-event"]');
  const removeFavBtn = e.target.closest('[data-action="remove-favorite"]');
  const token = getToken();
  if (!token) return;

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      loadProfile();
    } else {
      const data = await response.json();
      createdMessage.textContent = data.message || "Unable to delete event.";
    }
    return;
  }

  if (unregisterBtn) {
    const id = unregisterBtn.dataset.id;
    const response = await fetch(`/api/events/${id}/register`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      loadProfile();
    } else {
      const data = await response.json();
      myEventsMessage.textContent = data.message || "Unable to unregister.";
    }
    return;
  }

  if (removeFavBtn) {
    const id = removeFavBtn.dataset.id;
    const response = await fetch(`/api/users/favorites/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      loadProfile();
    } else {
      const data = await response.json();
      favoritesMessage.textContent = data.message || "Unable to remove favorite.";
    }
  }
});
