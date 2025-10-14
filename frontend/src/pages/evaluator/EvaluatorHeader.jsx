import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, LogOut } from "lucide-react";
import { format } from "date-fns";

const EvaluatorHeader = ({ hackathon, onLogout }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
            {hackathon.hackathon_name}
          </h1>
          <div className="mt-3">
            <p className="text-gray-600 text-lg">Evaluator Dashboard</p>
            {hackathon.status === 'completed' && !hackathon.winners && (
              <p className="text-amber-600 text-sm font-medium mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Evaluation Phase - Hackathon ended, evaluation in progress
              </p>
            )}
          </div>
        </div>
        <Button onClick={onLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{format(new Date(hackathon.start_datetime), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            {hackathon.mid_submission_datetime && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Mid Submission</p>
                  <p className="font-semibold">{format(new Date(hackathon.mid_submission_datetime), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">{format(new Date(hackathon.end_datetime), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-semibold">{hackathon.venue}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EvaluatorHeader;