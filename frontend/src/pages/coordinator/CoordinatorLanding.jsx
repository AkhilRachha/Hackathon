import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from "react-router-dom";

/**
 * The initial landing page for the coordinator.
 * It's a "presentational" component that receives functions via props to handle navigation.
 * @param {object} props
 * @param {Function} props.onNavigateToDashboard - Function to call to switch to the dashboard view.
 * @param {Function} props.onNavigateToRegister - Function to call to switch to the registration view.
 */
const CoordinatorLanding = ({ onNavigateToDashboard, onNavigateToRegister }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken"); // clear token/session
        navigate("/login"); // redirect to login page
    };

    // Consistent button styles using the blue/indigo gradient
    const primaryButtonClass =
        "w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200";

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        // Apply the consistent background gradient from the Register page
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Pulsing background decorations for aesthetic effect */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader className="space-y-1 text-center pb-6">
                            <motion.div
                                className="flex justify-center mb-6"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <LayoutDashboard className="w-8 h-8 text-white" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                                </div>
                            </motion.div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                                Welcome, Coordinator!
                            </CardTitle>
                            <CardDescription className="text-base text-gray-600">
                                What would you like to do today?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="space-y-5">
                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button
                                        onClick={onNavigateToDashboard}
                                        size="lg"
                                        className={primaryButtonClass}
                                    >
                                        View My Teams <Users className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button
                                        onClick={onNavigateToRegister}
                                        size="lg"
                                        className={primaryButtonClass}
                                    >
                                        Register New Team <PlusCircle className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>

                                <div className="pt-4 mt-4">
                                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                        <Button
                                            onClick={handleLogout}
                                            variant="outline"
                                            size="lg"
                                            className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CoordinatorLanding;
