// ../controllers/college.controller.js

import College from '../models/college.model.js';

export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error: error.message });
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
        // IMPROVED ERROR LOGGING
        console.error("Detailed Error fetching states:", error); 
        res.status(500).json({ 
            message: 'Error fetching states for dropdown. Check server logs.', 
            error: error.message 
        });
    }
};

// NEW: Get colleges for a specific state
export const getCollegesByState = async (req, res) => {
    try {
        const { stateName } = req.params;
        // The existing function is already correct: it filters by state and sorts by name
        const colleges = await College.find({ state: stateName }).sort({ clg_name: 1 }); 
        res.status(200).json(colleges);
    } catch (error) {
        // IMPROVED ERROR LOGGING
        console.error(`Detailed Error fetching colleges for state ${req.params.stateName}:`, error); 
        res.status(500).json({ 
            message: 'Error fetching colleges for the selected state.', 
            error: error.message 
        });
    }
};


export const addCollege = async (req, res) => {
    const { clg_name, district, state } = req.body;
    try {
        const newCollege = new College({ clg_name, district, state });
        await newCollege.save();
        res.status(201).json(newCollege);
    } catch (error) {
        res.status(500).json({ message: 'Error adding college', error: error.message });
    }
};