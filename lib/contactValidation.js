const allowedServiceTypes = ["Fashion Week", "Mariage", "Shooting photo"];
const allowedPreferredContactTypes = ["Email", "Telephone", "Instagram / WhatsApp"];
const allowedBudgetRanges = ["A definir", "Moins de 500 EUR", "500 - 1000 EUR", "1000 - 2000 EUR", "Plus de 2000 EUR"];

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
  const company = typeof input?.company === "string" ? input.company.trim() : "";
  const phone = typeof input?.phone === "string" ? input.phone.trim() : "";
  const serviceType = typeof input?.serviceType === "string" ? input.serviceType.trim() : "";
  const preferredContact = typeof input?.preferredContact === "string" ? input.preferredContact.trim() : "Email";
  const budget = typeof input?.budget === "string" ? input.budget.trim() : "A definir";
  const eventDate = typeof input?.eventDate === "string" ? input.eventDate.trim() : "";
  const location = typeof input?.location === "string" ? input.location.trim() : "";
  const referenceLink = typeof input?.referenceLink === "string" ? input.referenceLink.trim() : "";
  const project = typeof input?.project === "string" ? input.project.trim() : "";

  const errors = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = "Le nom doit contenir entre 2 et 80 caracteres.";
  }

  if (!isEmailValid(email)) {
    errors.email = "Adresse email invalide.";
  }

  if (company.length > 120) {
    errors.company = "La structure doit contenir au maximum 120 caracteres.";
  }

  if (phone.length > 40) {
    errors.phone = "Le telephone doit contenir au maximum 40 caracteres.";
  }

  if (!allowedServiceTypes.includes(serviceType)) {
    errors.serviceType = "Type de prestation invalide.";
  }

  if (!allowedPreferredContactTypes.includes(preferredContact)) {
    errors.preferredContact = "Canal prefere invalide.";
  }

  if (preferredContact === "Telephone" && phone.length < 6) {
    errors.phone = "Ajoute un numero pour etre rappele.";
  }

  if (!allowedBudgetRanges.includes(budget)) {
    errors.budget = "Budget indicatif invalide.";
  }

  if (!isDateValid(eventDate)) {
    errors.eventDate = "Format de date invalide.";
  }

  if (location.length > 120) {
    errors.location = "Le lieu doit contenir au maximum 120 caracteres.";
  }

  if (referenceLink.length > 240) {
    errors.referenceLink = "Le lien de reference doit contenir au maximum 240 caracteres.";
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
      company,
      phone,
      serviceType,
      preferredContact,
      budget,
      eventDate,
      location,
      referenceLink,
      project,
    },
  };
}
