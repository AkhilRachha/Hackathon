import User from '../models/user.model.js';

export const registerUser = async (req, res) => {
    try {
        const {
            user_name,
            user_email,
            user_password,
            user_phoneno,
            user_github_url,
            clg_id,
        } = req.body;

        const newUser = new User({
            user_name,
            user_email,
            user_password,
            user_phoneno,
            user_github_url,
            clg_id,
            // You can set a default role_id for participants here
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};