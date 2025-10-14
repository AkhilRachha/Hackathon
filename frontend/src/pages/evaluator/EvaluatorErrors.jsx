import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, LogOut, Trophy } from "lucide-react";
import DefaultLayout from "@/components/DefaultLayout";

export const NotStartedError = ({ error, onLogout }) => (
    <DefaultLayout userRole="evaluator">
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-100">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-none">
                    <CardHeader className="text-center pb-4">
                        <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mx-auto w-fit p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg mb-4">
                            <Clock className="h-12 w-12 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent">
                            Hackathon Starts Soon
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600 mt-2">
                            {error.hackathon.hackathon_name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-lg text-gray-700">The evaluation dashboard will be available once the hackathon begins.</p>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800 mb-2 font-semibold">
                                    📅 <strong>Start Time:</strong> {new Date(error.hackathon.start_datetime).toLocaleString()}
                                </p>
                                <p className="text-sm text-blue-800 mb-3">
                                    ⏰ <strong>End Time:</strong> {new Date(error.hackathon.end_datetime).toLocaleString()}
                                </p>
                                <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
                                    <p className="text-sm text-blue-900 font-medium">
                                        💡 <strong>Tip:</strong> Please login again at the start time to access the evaluation dashboard.
                                    </p>
                                </div>
                            </div>
                            <p className="text-md text-gray-600">The system will automatically activate the hackathon at the scheduled start time.</p>
                        </div>
                        <div className="pt-4">
                            <Button onClick={onLogout} variant="outline" size="lg" className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg">
                                <LogOut className="w-5 h-5" /> Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    </DefaultLayout>
);

export const EvaluationCompleteError = ({ error, onLogout }) => (
    <DefaultLayout userRole="evaluator">
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-emerald-100">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-none">
                    <CardHeader className="text-center pb-4">
                        <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mx-auto w-fit p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg mb-4">
                            <Trophy className="h-12 w-12 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
                            Evaluation Complete
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600 mt-2">
                            {error.hackathon.hackathon_name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-lg text-gray-700">{error.message}</p>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800 mb-2">
                                    <strong>Hackathon Status:</strong> Completed
                                </p>
                                <p className="text-sm text-green-800">
                                    <strong>Winners:</strong> Announced
                                </p>
                            </div>
                            <p className="text-md text-gray-600">Thank you for your evaluation work!</p>
                        </div>
                        <div className="pt-4">
                            <Button onClick={onLogout} variant="outline" size="lg" className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg">
                                <LogOut className="w-5 h-5" /> Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    </DefaultLayout>
);

export const GeneralError = ({ error, onLogout }) => (
    <DefaultLayout userRole="evaluator">
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                        {error.type === 'no_hackathon' ? 'No Hackathon Assigned' : 'Setup Required'}
                    </h2>
                    <p className="text-yellow-700 mb-4">{error.message}</p>
                    <div className="space-y-2 text-sm text-yellow-600">
                        <p>To resolve this issue:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Contact your system administrator</li>
                            <li>Request to be assigned to an active hackathon</li>
                            <li>Ensure your evaluator role is properly configured</li>
                        </ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={onLogout} variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </DefaultLayout>
);

export const LoadingState = () => (
    <DefaultLayout userRole="evaluator">
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-semibold">Loading Dashboard...</div>
        </div>
    </DefaultLayout>
);

export const NoDataState = () => (
    <DefaultLayout userRole="evaluator">
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Hackathon Assigned</h2>
                <p className="text-gray-600">You are not assigned to any hackathon for evaluation.</p>
            </div>
        </div>
    </DefaultLayout>
);