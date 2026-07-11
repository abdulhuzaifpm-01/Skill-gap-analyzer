const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const analyzerRoutes = require('./routes/analyzer');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', analyzerRoutes);
app.get("/", (req, res) => {
  res.send("Skill Gap Analyzer Backend is running successfully!");
});

// Seed job roles on startup
const JobRole = require('./models/JobRole');
const seedJobRoles = async () => {
  const count = await JobRole.countDocuments();
  if (count === 0) {
    const roles = [
      {
        role: 'Frontend Developer',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git', 'Responsive Design', 'REST APIs'],
      },
      {
        role: 'Backend Developer',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'SQL', 'REST APIs', 'Git', 'Authentication', 'Docker'],
      },
      {
        role: 'Full Stack Developer',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs', 'Git', 'TypeScript'],
      },
      {
        role: 'Data Scientist',
        requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'TensorFlow', 'SQL', 'Data Visualization'],
      },
      {
        role: 'DevOps Engineer',
        requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Terraform', 'Git', 'Monitoring'],
      },
      {
        role: 'UI/UX Designer',
        requiredSkills: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research', 'CSS', 'Design Systems', 'Accessibility'],
      },
      {
        role: 'Mobile Developer',
        requiredSkills: ['React Native', 'JavaScript', 'iOS', 'Android', 'REST APIs', 'Git', 'Firebase', 'TypeScript'],
      },
      {
        role: 'Cloud Architect',
        requiredSkills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Networking', 'Security'],
      },
    ];
    await JobRole.insertMany(roles);
    console.log('✅ Job roles seeded');
  }
};

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillgapanalyzer';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedJobRoles();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
