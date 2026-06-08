const getSeverity = (condition) => {
  const text = condition.toLowerCase();

  if (
    text.includes("heart attack") ||
    text.includes("cardiac arrest") ||
    text.includes("stroke") ||
    text.includes("ventilator") ||
    text.includes("critical")
  ) {
    return "CRITICAL";
  }

  if (
    text.includes("fracture") ||
    text.includes("injury") ||
    text.includes("accident")
  ) {
    return "HIGH";
  }

  return "NORMAL";
};

module.exports = getSeverity;