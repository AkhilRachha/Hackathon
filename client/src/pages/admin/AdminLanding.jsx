import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Eye, Trophy, LogOut } from 'lucide-react';
import DefaultLayout from '@/components/DefaultLayout';

const AdminLanding = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user data from local storage
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        // Redirect to the login page
        window.location.href = '/login';
    };

    const cardVariants = {
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
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-4xl"
                >
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                                Admin Control Panel
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600">
                                Please select an action
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div whileHover={{ y: -5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                                <Button
                                    onClick={() => navigate('/admin/create-hackathon')}
                                    className="w-full h-24 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg rounded-xl flex flex-col items-center justify-center"
                                >
                                    <PlusCircle className="w-8 h-8 mb-2" />
                                    Create Hackathon
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ y: -5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                                <Button
                                    onClick={() => navigate('/admin/view-hackathon')}
                                    className="w-full h-24 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg rounded-xl flex flex-col items-center justify-center"
                                >
                                    <Eye className="w-8 h-8 mb-2" />
                                    View Hackathon
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ y: -5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                                <Button
                                    onClick={() => navigate('/admin/hackathon-winners')}
                                    className="w-full h-24 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg rounded-xl flex flex-col items-center justify-center"
                                >
                                    <Trophy className="w-8 h-8 mb-2" />
                                    View Winners
                                </Button>
                            </motion.div>
                        </CardContent>
                        <div className="p-8 pt-0 flex justify-center">
                            <Button onClick={handleLogout} variant="destructive" className="w-full md:w-auto">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default AdminLanding;