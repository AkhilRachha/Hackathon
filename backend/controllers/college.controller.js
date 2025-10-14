import College from '../models/college.model.js';
import {
    OK,
    CREATED,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        res.status(OK).json(colleges);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching colleges', error: error.message });
    }
};

// NEW: Get a list of unique states
export const getStates = async (req, res) => {
    try {
        const states = await College.distinct('state');
        res.status(OK).json(states.sort());
    } catch (error) {
        console.error("Detailed Error fetching states:", error);
        res.status(INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching states for dropdown. Check server logs.',
            error: error.message
        });
    }
};

// NEW: Get colleges for a specific state
export const getCollegesByState = async (req, res) => {
    try {
        const { stateName } = req.params;
        const colleges = await College.find({ state: stateName }).sort({ clg_name: 1 });
        res.status(OK).json(colleges);
    } catch (error) {
        console.error(`Detailed Error fetching colleges for state ${req.params.stateName}:`, error);
        res.status(INTERNAL_SERVER_ERROR).json({
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
        res.status(CREATED).json(newCollege);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error adding college', error: error.message });
    }
};