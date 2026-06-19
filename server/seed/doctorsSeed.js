require("dotenv").config();
const mongoose = require("mongoose");
const Hospital = require("../src/models/Hospital");
const Doctor = require("../src/models/Doctor");

const MONGO_URI = process.env.MONGODB_URI;

const specializations = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Emergency Medicine",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
  "Urology",
  "ENT",
  "Ophthalmology",
  "Gynecology",
  "Anesthesiology",
  "Critical Care",
  "Surgery",
];

const doctorNames = [
  "Dr Arjun Sharma",
  "Dr Priya Reddy",
  "Dr Vikram Mehta",
  "Dr Neha Kapoor",
  "Dr Rahul Verma",
  "Dr Ananya Iyer",
  "Dr Karthik Rao",
  "Dr Sneha Menon",
  "Dr Rohit Gupta",
  "Dr Aditi Singh",
  "Dr Saurabh Kumar",
  "Dr Rakesh Nair",
  "Dr Pooja Sharma",
  "Dr Amit Patel",
  "Dr Vivek Joshi",
  "Dr Kavya Reddy",
  "Dr Harish Kumar",
  "Dr Meera Iyer",
  "Dr Nitin Sharma",
  "Dr Sanjana Rao",
];

async function seedDoctors() {
  await mongoose.connect(MONGO_URI);

  const hospitals = await Hospital.find();

  for (const hospital of hospitals) {
    console.log(`Creating doctors for ${hospital.name}`);

    const doctorIds = [];

    for (let i = 0; i < specializations.length; i++) {
      const doctor = await Doctor.create({
        name: doctorNames[
            Math.floor(Math.random() * doctorNames.length)
          ],
        specialization: specializations[i],
        hospital: hospital._id,
        status: "AVAILABLE",
        phone: `98${Math.floor(
          10000000 + Math.random() * 90000000
        )}`,
        currentPatients: Math.floor(Math.random() * 4),
        maxPatients: 5,
      });

      doctorIds.push(doctor._id);
    }

    hospital.doctors = doctorIds;
    await hospital.save();
  }

  console.log("Doctors seeded successfully");
  process.exit();
}

seedDoctors().catch(console.error);