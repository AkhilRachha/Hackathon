import { updateHackathonStatuses, cleanupCompletedHackathons } from '../controllers/hackathon.controller.js';

/**
 * Hackathon Status Scheduler
 * Handles periodic updates for hackathon statuses and cleanup operations
 */
class HackathonScheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
    }

    /**
     * Start the periodic hackathon status updates
     * @param {number} intervalMinutes - Interval in minutes (default: 1 minute)
     */
    start(intervalMinutes = 1) {
        if (this.isRunning) {
            console.log('Hackathon scheduler is already running');
            return;
        }

        const intervalMs = intervalMinutes * 60 * 1000;
        
        console.log(`Starting hackathon scheduler with ${intervalMinutes} minute interval`);
        
        this.intervalId = setInterval(async () => {
            try {
                await this.runScheduledTasks();
            } catch (error) {
                console.error('Error in periodic hackathon status update:', error);
            }
        }, intervalMs);

        this.isRunning = true;
    }

    /**
     * Stop the periodic updates
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
            console.log('Hackathon scheduler stopped');
        }
    }

    /**
     * Run the scheduled tasks
     */
    async runScheduledTasks() {
        try {
            // Update hackathon statuses based on current time
            await updateHackathonStatuses();
            
            // Clean up completed hackathons
            await cleanupCompletedHackathons();
            
        } catch (error) {
            console.error('Error executing scheduled hackathon tasks:', error);
            throw error;
        }
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalId: this.intervalId
        };
    }
}

// Create and export a singleton instance
const hackathonScheduler = new HackathonScheduler();

export default hackathonScheduler;