import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './models/college.model.js';
import collegesData from './Colleges.json' with { type: 'json' };

dotenv.config();

const seedColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await College.deleteMany({});
    console.log('Colleges cleared');

    const colleges = collegesData.map(college => ({
      clg_name: college.Name,
      district: college.District,
      state: college.State
    }));

    await College.insertMany(colleges);
    console.log('Colleges seeded');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding colleges:', error);
    process.exit(1);
  }
};

seedColleges();