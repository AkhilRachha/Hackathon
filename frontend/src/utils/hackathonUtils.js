/**
 * Utility functions for hackathon-related operations
 */

/**
 * Check if a hackathon is still accepting registrations
 * @param {Object} hackathon - The hackathon object
 * @returns {boolean} - True if registration is still open
 */
export const isRegistrationOpen = (hackathon) => {
    const currentTime = new Date();
    
    // Check if hackathon has ended
    if (new Date(hackathon.end_datetime) < currentTime) {
        return false;
    }
    
    // Check if registration deadline has passed
    if (hackathon.registrationDeadline && new Date(hackathon.registrationDeadline) < currentTime) {
        return false;
    }
    
    return true;
};

/**
 * Get the registration status message for a hackathon
 * @param {Object} hackathon - The hackathon object
 * @returns {Object} - Status object with message and type
 */
export const getRegistrationStatus = (hackathon) => {
    const currentTime = new Date();
    const endTime = new Date(hackathon.end_datetime);
    const registrationDeadline = hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline) : null;
    
    if (endTime < currentTime) {
        return {
            message: "Hackathon has ended",
            type: "ended",
            canJoin: false
        };
    }
    
    if (registrationDeadline && registrationDeadline < currentTime) {
        return {
            message: "Registration deadline has passed",
            type: "registration_closed",
            canJoin: false
        };
    }
    
    if (registrationDeadline) {
        const timeUntilDeadline = registrationDeadline - currentTime;
        const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
        
        if (hoursUntilDeadline < 24) {
            return {
                message: `Registration closes in ${hoursUntilDeadline} hours`,
                type: "urgent",
                canJoin: true
            };
        }
    }
    
    return {
        message: "Registration open",
        type: "open",
        canJoin: true
    };
};

/**
 * Format time remaining until registration deadline
 * @param {Object} hackathon - The hackathon object
 * @returns {string} - Formatted time remaining string
 */
export const getTimeUntilRegistrationDeadline = (hackathon) => {
    if (!hackathon.registrationDeadline) {
        return null;
    }
    
    const currentTime = new Date();
    const deadline = new Date(hackathon.registrationDeadline);
    const timeRemaining = deadline - currentTime;
    
    if (timeRemaining <= 0) {
        return "Registration closed";
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    }
};