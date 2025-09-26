// ../controllers/college.controller.js

import College from '../models/college.model.js';

// This function can be removed or kept for other purposes
export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error });
    }
};

// NEW: Get a list of unique states
export const getStates = async (req, res) => {
    try {
        // Use the distinct() method to get unique state names
        const states = await College.distinct('state');
        // Sort states alphabetically
        res.status(200).json(states.sort());
    } catch (error) {
        res.status(500).json({ message: 'Error fetching states', error });
    }
};

// NEW: Get colleges for a specific state
export const getCollegesByState = async (req, res) => {
    try {
        const { stateName } = req.params;
        const colleges = await College.find({ state: stateName }).sort({ clg_name: 1 }); // Find colleges matching the state name and sort them
        res.status(200).json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges for the state', error });
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