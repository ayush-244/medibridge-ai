const triagePatient = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const symptomText = symptoms.toLowerCase();

    let severity = "LOW";
    let recommendedDepartment = "General Medicine";
    let priority = "Normal";

    if (
      symptomText.includes("chest pain") ||
      symptomText.includes("heart") ||
      symptomText.includes("cardiac")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Cardiology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("stroke") ||
      symptomText.includes("seizure") ||
      symptomText.includes("brain")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Neurology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("breathing") ||
      symptomText.includes("asthma") ||
      symptomText.includes("oxygen")
    ) {
      severity = "MEDIUM";
      recommendedDepartment = "Pulmonology";
      priority = "Urgent";
    } else if (
      symptomText.includes("fracture") ||
      symptomText.includes("bone") ||
      symptomText.includes("leg pain")
    ) {
      severity = "MEDIUM";
      recommendedDepartment = "Orthopedics";
      priority = "Urgent";
    }

    res.status(200).json({
      success: true,
      triage: {
        symptoms,
        severity,
        recommendedDepartment,
        priority,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  triagePatient,
};