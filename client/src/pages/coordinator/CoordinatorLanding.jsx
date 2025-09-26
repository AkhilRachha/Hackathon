import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, PlusCircle } from 'lucide-react';

/**
 * The initial landing page for the coordinator.
 * It's a "presentational" component that receives functions via props to handle navigation.
 * @param {object} props
 * @param {Function} props.onNavigateToDashboard - Function to call to switch to the dashboard view.
 * @param {Function} props.onNavigateToRegister - Function to call to switch to the registration view.
 */
const CoordinatorLanding = ({ onNavigateToDashboard, onNavigateToRegister }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl text-center p-8 rounded-2xl">
                    <CardHeader>
                        <motion.h1 
                            initial={{ y: -20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.2, duration: 0.5 }} 
                            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent"
                        >
                            Welcome, Coordinator!
                        </motion.h1>
                        <motion.p 
                            initial={{ y: -20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.4, duration: 0.5 }} 
                            className="text-gray-600 mt-2"
                        >
                            What would you like to do today?
                        </motion.p>
                    </CardHeader>
                    <CardContent className="mt-6 space-y-4">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
                        >
                            <Button onClick={onNavigateToDashboard} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                                View My Teams <Users className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ delay: 0.8, type: 'spring', stiffness: 120 }}
                        >
                            <Button onClick={onNavigateToRegister} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                                Register New Team <PlusCircle className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default CoordinatorLanding;
