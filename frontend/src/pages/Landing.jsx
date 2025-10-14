import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  Crown,
  Medal,
  Award,
  Calendar,
  MapPin,
} from "lucide-react";
import { getRecentWinners } from "@/api/hackathonApi";

const Landing = () => {
  const navigate = useNavigate();
  const [recentWinners, setRecentWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(true);

  useEffect(() => {
    fetchRecentWinners();
  }, []);

  const fetchRecentWinners = async () => {
    try {
      const winners = await getRecentWinners();
      setRecentWinners(winners);
    } catch (error) {
      console.error("Error fetching recent winners:", error);
    } finally {
      setLoadingWinners(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description:
        "Organize teams and coordinate projects efficiently with smart team formation",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Code,
      title: "Project Tracking",
      description:
        "Monitor progress and submissions in real-time with comprehensive analytics",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Trophy,
      title: "Fair Evaluation",
      description:
        "Transparent scoring and feedback system with detailed evaluation metrics",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access control",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Target,
      title: "Goal Oriented",
      description:
        "Set clear objectives and track achievement with milestone tracking",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "Innovation Hub",
      description:
        "Foster creativity with collaborative tools and resource sharing",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.05) 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10">
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <div className="text-center max-w-5xl mx-auto mb-20">
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Code className="w-16 h-16 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                </motion.div>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Hackathon
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Management Portal
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
            >
              Streamline your hackathon experience with our comprehensive
              management platform. Connect teams, coordinate projects, and
              evaluate submissions all in one place.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/25"
                  onClick={() => navigate("/login")}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Login
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
                  onClick={() => navigate("/register")}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Winners Section */}
          {!loadingWinners && recentWinners.length > 0 && (
            <motion.div variants={itemVariants} className="mt-20">
              {/* Section Header */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full border border-yellow-400/30"
                >
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">🎉 Fresh Winners Announced!</span>
                </motion.div>
                
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 bg-clip-text text-transparent mb-4">
                  Latest Champions
                </h2>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
                  Celebrating the brilliant minds who turned ideas into reality
                </p>
              </div>
              
              {/* Winners Grid */}
              <div className="grid gap-8 max-w-6xl mx-auto">
                {recentWinners.map((hackathon, index) => (
                  <motion.div
                    key={hackathon._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="relative"
                  >
                    {/* Main Winner Card */}
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 hover:scale-[1.02]">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-transparent rounded-full blur-xl" />
                      
                      {/* Content */}
                      <div className="relative p-8 lg:p-10">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                          <div className="mb-4 lg:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-2xl lg:text-3xl font-bold text-white">
                                {hackathon.hackathon_name}
                              </h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-gray-300">
                              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {new Date(hackathon.start_datetime).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{hackathon.venue}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-green-400/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-semibold">
                              Just Announced
                            </span>
                          </div>
                        </div>

                        {/* Winners Podium */}
                        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                          {/* First Place - Center/Larger */}
                          <div className="md:order-2 relative">
                            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl p-6 border border-yellow-400/30 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl" />
                              <div className="relative">
                                <div className="flex items-center justify-center mb-4">
                                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-lg">
                                    <Crown className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-yellow-400 font-bold text-lg mb-2">🥇 Champion</div>
                                  <div className="text-white font-bold text-xl mb-1">
                                    {hackathon.winners.firstPlace?.team_name}
                                  </div>
                                  <div className="text-yellow-300 text-sm">First Place</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Second Place - Left */}
                          <div className="md:order-1">
                            <div className="bg-gradient-to-br from-gray-400/20 to-slate-500/20 rounded-2xl p-5 border border-gray-400/30 h-full">
                              <div className="flex items-center justify-center mb-4">
                                <div className="p-2.5 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full shadow-lg">
                                  <Medal className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-300 font-bold text-base mb-2">🥈 Runner-up</div>
                                <div className="text-white font-semibold text-lg mb-1">
                                  {hackathon.winners.secondPlace?.team_name}
                                </div>
                                <div className="text-gray-400 text-sm">Second Place</div>
                              </div>
                            </div>
                          </div>

                          {/* Third Place - Right */}
                          <div className="md:order-3">
                            <div className="bg-gradient-to-br from-amber-600/20 to-orange-500/20 rounded-2xl p-5 border border-amber-500/30 h-full">
                              <div className="flex items-center justify-center mb-4">
                                <div className="p-2.5 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full shadow-lg">
                                  <Award className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-amber-400 font-bold text-base mb-2">🥉 Runner-up</div>
                                <div className="text-white font-semibold text-lg mb-1">
                                  {hackathon.winners.thirdPlace?.team_name}
                                </div>
                                <div className="text-amber-300 text-sm">Third Place</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-300 text-sm">
                              Winners announced on {new Date(hackathon.winnersAnnouncedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span>Live for {Math.ceil((6 * 60 * 60 * 1000 - (new Date() - new Date(hackathon.winnersAnnouncedAt))) / (60 * 60 * 1000))} more hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="text-center mt-20">
            <div className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-sm border border-white/10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Hackathon?
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Join thousands of organizers who trust our platform for seamless
                hackathon management.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-0 shadow-2xl shadow-emerald-500/25"
                  onClick={() => navigate("/register")}
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
