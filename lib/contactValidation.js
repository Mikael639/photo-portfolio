const allowedServiceTypes = ["Fashion Week", "Mariage", "Eglise", "Concert", "Autre"];

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDateValid(dateString) {
  if (!dateString) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

export function validateContactInput(input) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim() : "";
  const serviceType = typeof input?.serviceType === "string" ? input.serviceType.trim() : "";
  const eventDate = typeof input?.eventDate === "string" ? input.eventDate.trim() : "";
  const location = typeof input?.location === "string" ? input.location.trim() : "";
  const project = typeof input?.project === "string" ? input.project.trim() : "";

  const errors = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = "Le nom doit contenir entre 2 et 80 caracteres.";
  }

  if (!isEmailValid(email)) {
    errors.email = "Adresse email invalide.";
  }

  if (!allowedServiceTypes.includes(serviceType)) {
    errors.serviceType = "Type de prestation invalide.";
  }

  if (!isDateValid(eventDate)) {
    errors.eventDate = "Format de date invalide.";
  }

  if (location.length > 120) {
    errors.location = "Le lieu doit contenir au maximum 120 caracteres.";
  }

  if (project.length < 10 || project.length > 2000) {
    errors.project = "Le message doit contenir entre 10 et 2000 caracteres.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: {
      name,
      email,
      serviceType,
      eventDate,
      location,
      project,
    },
  };
}
