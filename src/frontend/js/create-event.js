const createForm = document.getElementById("createEventForm");
const createMessage = document.getElementById("createMessage");

const getToken = () => localStorage.getItem("eventflow_token");

const loadProfile = async () => {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  const response = await fetch("/api/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile");
  }
  return data;
};

const setFormEnabled = (enabled) => {
  Array.from(createForm.elements).forEach((el) => {
    if (el.tagName === "A") return;
    el.disabled = !enabled;
  });
};

const init = async () => {
  try {
    const profile = await loadProfile();
    if (!profile) return;
    if (profile.role !== "organizer" && profile.role !== "admin") {
      createMessage.textContent = "Only organizers can create events.";
      setFormEnabled(false);
    } else {
      createMessage.textContent = "Fill the form to publish a new event.";
      setFormEnabled(true);
    }
  } catch (error) {
    createMessage.textContent = error.message;
    setFormEnabled(false);
  }
};

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const formData = new FormData(createForm);
  formData.set("date", new Date(formData.get("date")).toISOString());

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      const detailText = Array.isArray(data.details) ? data.details.join(", ") : "";
      throw new Error(detailText || data.message || "Unable to create event");
    }
    createMessage.textContent = "Event created successfully.";
    createForm.reset();
  } catch (error) {
    createMessage.textContent = error.message;
  }
});

init();
