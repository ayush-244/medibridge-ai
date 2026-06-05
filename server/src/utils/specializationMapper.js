const getSpecialization = (condition) => {
  const text = condition.toLowerCase();

  if (
    text.includes("heart") ||
    text.includes("cardiac") ||
    text.includes("chest pain")
  ) {
    return "Cardiology";
  }

  if (
    text.includes("brain") ||
    text.includes("stroke")
  ) {
    return "Neurology";
  }

  if (
    text.includes("fracture") ||
    text.includes("bone")
  ) {
    return "Orthopedics";
  }

  return "Emergency Medicine";
};

module.exports = getSpecialization;