const getBedType = (condition) => {
  const text = condition.toLowerCase();

  if (
    text.includes("heart attack") ||
    text.includes("cardiac arrest") ||
    text.includes("stroke") ||
    text.includes("severe chest pain") ||
    text.includes("critical") ||
    text.includes("ventilator")
  ) {
    return "ICU";
  }

  return "GENERAL";
};

module.exports = getBedType;