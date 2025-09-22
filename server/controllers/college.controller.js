import College from '../models/college.model.js';

export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error });
    }
};

export const addCollege = async (req, res) => {
    const { clg_name, district, state } = req.body;
    try {
        const newCollege = new College({ clg_name, district, state });
        await newCollege.save();
        res.status(201).json(newCollege);
    } catch (error) {
        res.status(500).json({ message: 'Error adding college', error });
    }
};