import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, UserCheck, BarChart3 } from "lucide-react";

const EvaluatorStats = ({ stats, onShowList }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <Card
        className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onShowList('teams')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total_teams}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-blue-600 mt-2">Click to view list</p>
        </CardContent>
      </Card>

      <Card
        className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onShowList('participants')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.total_participants}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm text-emerald-600 mt-2">Click to view list</p>
        </CardContent>
      </Card>

      <Card
        className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onShowList('coordinators')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coordinators</p>
              <p className="text-3xl font-bold text-amber-600">{stats.total_coordinators}</p>
            </div>
            <UserCheck className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-sm text-amber-600 mt-2">Click to view list</p>
        </CardContent>
      </Card>

      <Card
        className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onShowList('evaluators')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluators</p>
              <p className="text-3xl font-bold text-purple-600">{stats.total_evaluators}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-purple-600 mt-2">Click to view list</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EvaluatorStats;