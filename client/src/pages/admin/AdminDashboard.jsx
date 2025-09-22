import { useState } from 'react'
import { motion } from 'framer-motion'
import DefaultLayout from '@/components/DefaultLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Trophy, Link, Plus, CheckCircle } from 'lucide-react'

const AdminDashboard = () => {
  const [hackathonData, setHackathonData] = useState({
    title: '',
    numTeams: '',
    membersPerTeam: '',
    registrationStart: '',
    registrationEnd: ''
  })
  const [isEventCreated, setIsEventCreated] = useState(false)
  const [registrationLink, setRegistrationLink] = useState('')

  const mockProjects = [
    { id: 1, title: 'E-commerce Platform', difficulty: 'Medium', category: 'Web Development', participants: 24, rating: 4.2 },
    { id: 2, title: 'AI Chatbot', difficulty: 'Hard', category: 'Machine Learning', participants: 18, rating: 4.7 },
    { id: 3, title: 'Mobile Fitness App', difficulty: 'Medium', category: 'Mobile Development', participants: 32, rating: 4.0 },
    { id: 4, title: 'Blockchain Voting System', difficulty: 'Hard', category: 'Blockchain', participants: 12, rating: 4.5 },
    { id: 5, title: 'IoT Smart Home', difficulty: 'Medium', category: 'IoT', participants: 28, rating: 4.3 },
    { id: 6, title: 'Data Visualization Dashboard', difficulty: 'Easy', category: 'Data Science', participants: 36, rating: 3.9 }
  ]

  const handleInputChange = (field, value) => {
    setHackathonData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateHackathon = () => {
    if (hackathonData.title && hackathonData.numTeams && hackathonData.membersPerTeam) {
      setIsEventCreated(true)
      setRegistrationLink(`https://hackathon-portal.com/register/${hackathonData.title.toLowerCase().replace(/\s+/g, '-')}`)
    }
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'Hard': 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[difficulty] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <DefaultLayout userRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Create and manage hackathon events</p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-3xl font-bold text-blue-600">3</p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-blue-600 mt-2">2 active, 1 completed</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Teams</p>
                    <p className="text-3xl font-bold text-emerald-600">48</p>
                  </div>
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-600 mt-2">192 participants</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-purple-600">6</p>
                  </div>
                  <Plus className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-sm text-purple-600 mt-2">Available challenges</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Creation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Plus className="w-6 h-6 mr-3 text-blue-600" />
                  Create Hackathon Event
                </CardTitle>
                <CardDescription className="text-base">
                  Set up a new hackathon with team configurations and registration details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Hackathon Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter hackathon title"
                      value={hackathonData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numTeams" className="text-sm font-semibold text-gray-700">Number of Teams</Label>
                    <Input
                      id="numTeams"
                      type="number"
                      placeholder="e.g., 20"
                      value={hackathonData.numTeams}
                      onChange={(e) => handleInputChange('numTeams', e.target.value)}
                      className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="membersPerTeam" className="text-sm font-semibold text-gray-700">Members per Team</Label>
                    <Input
                      id="membersPerTeam"
                      type="number"
                      placeholder="e.g., 4"
                      value={hackathonData.membersPerTeam}
                      onChange={(e) => handleInputChange('membersPerTeam', e.target.value)}
                      className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registrationStart" className="text-sm font-semibold text-gray-700">Registration Start</Label>
                    <Input
                      id="registrationStart"
                      type="datetime-local"
                      value={hackathonData.registrationStart}
                      onChange={(e) => handleInputChange('registrationStart', e.target.value)}
                      className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="registrationEnd" className="text-sm font-semibold text-gray-700">Registration End</Label>
                    <Input
                      id="registrationEnd"
                      type="datetime-local"
                      value={hackathonData.registrationEnd}
                      onChange={(e) => handleInputChange('registrationEnd', e.target.value)}
                      className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleCreateHackathon}
                    className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8"
                    disabled={!hackathonData.title || !hackathonData.numTeams || !hackathonData.membersPerTeam}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Hackathon
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Summary */}
          {isEventCreated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-800 text-xl">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    Event Created Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div 
                      className="flex items-center p-4 bg-white/70 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Trophy className="w-10 h-10 text-indigo-600 mr-4" />
                      <div>
                        <p className="font-bold text-lg">{hackathonData.title}</p>
                        <p className="text-sm text-gray-600">Event Title</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center p-4 bg-white/70 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="w-10 h-10 text-blue-600 mr-4" />
                      <div>
                        <p className="font-bold text-lg">{hackathonData.numTeams} Teams</p>
                        <p className="text-sm text-gray-600">{hackathonData.membersPerTeam} members each</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center p-4 bg-white/70 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Calendar className="w-10 h-10 text-purple-600 mr-4" />
                      <div>
                        <p className="font-bold text-lg">Registration Open</p>
                        <p className="text-sm text-gray-600">Ready for participants</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  {registrationLink && (
                    <div className="p-6 bg-white rounded-xl border border-emerald-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <Link className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-700">Registration Link:</span>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" size="sm" className="hover:bg-emerald-50">
                            Copy Link
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-sm text-blue-600 mt-3 break-all font-mono bg-blue-50 p-3 rounded-lg">
                        {registrationLink}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Available Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Available Project Problems</CardTitle>
                <CardDescription className="text-base">
                  Predefined challenges for teams to choose from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group relative"
                    >
                      <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                          <h3 className="font-bold text-lg mb-3 group-hover:text-blue-700 transition-colors">
                            {project.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="text-xs bg-white">
                              {project.category}
                            </Badge>
                            <Badge variant="outline" className={`text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                              {project.difficulty}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {project.participants} participants
                            </div>
                            <div className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                              {project.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DefaultLayout>
  )
}

export default AdminDashboard