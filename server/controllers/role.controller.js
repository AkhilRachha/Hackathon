import Role from '../models/role.model.js';

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};

export const addRole = async (req, res) => {
    try {
        const { role_name, description } = req.body;
        const newRole = new Role({ role_name, description });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: 'Error adding role', error });
    }
};