import { useState } from 'react'
import { motion } from 'framer-motion'
import DefaultLayout from '@/components/DefaultLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const CoordinatorDashboard = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Code Warriors',
      members: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'],
      project: 'E-commerce Platform',
      coordinator: 'John Doe',
      status: 'Active',
      isMyTeam: true
    },
    {
      id: 2,
      name: 'Tech Innovators',
      members: ['Emma Brown', 'Frank Miller', 'Grace Lee'],
      project: 'AI Chatbot',
      coordinator: 'John Doe',
      status: 'Active',
      isMyTeam: true
    },
    {
      id: 3,
      name: 'Digital Pioneers',
      members: ['Henry Taylor', 'Ivy Chen', 'Jack Robinson', 'Kate Adams'],
      project: null,
      coordinator: 'Jane Smith',
      status: 'Pending',
      isMyTeam: false
    },
    {
      id: 4,
      name: 'Future Builders',
      members: ['Liam Johnson', 'Mia Wilson', 'Noah Davis'],
      project: 'Mobile Fitness App',
      coordinator: 'Mike Johnson',
      status: 'Active',
      isMyTeam: false
    },
    {
      id: 5,
      name: 'Innovation Squad',
      members: ['Olivia Brown', 'Paul Miller', 'Quinn Lee', 'Ruby Taylor'],
      project: null,
      coordinator: 'John Doe',
      status: 'Pending',
      isMyTeam: true
    }
  ])

  const availableProjects = [
    'E-commerce Platform',
    'AI Chatbot',
    'Mobile Fitness App',
    'Blockchain Voting System',
    'IoT Smart Home',
    'Data Visualization Dashboard'
  ]

  const handleProjectAssignment = (teamId, projectName) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, project: projectName, status: 'Active' }
        : team
    ))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Inactive': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status] || statusConfig['Pending']
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const myTeams = teams.filter(team => team.isMyTeam)
  const allTeams = teams

  const TeamTable = ({ teamList, showAssignButton = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Coordinator</TableHead>
          <TableHead>Status</TableHead>
          {showAssignButton && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamList.map((team) => (
          <TableRow key={team.id}>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {team.members.slice(0, 2).map((member, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {member}
                  </Badge>
                ))}
                {team.members.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{team.members.length - 2} more
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {team.project ? (
                <Badge variant="secondary">{team.project}</Badge>
              ) : (
                <span className="text-gray-500 italic">Not assigned</span>
              )}
            </TableCell>
            <TableCell>{team.coordinator}</TableCell>
            <TableCell>{getStatusBadge(team.status)}</TableCell>
            {showAssignButton && (
              <TableCell>
                {!team.project && team.isMyTeam && (
                  <Select onValueChange={(value) => handleProjectAssignment(team.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {team.project && team.isMyTeam && (
                  <Button variant="outline" size="sm">
                    Reassign
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <DefaultLayout userRole="coordinator">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
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
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
              Coordinator Dashboard
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Manage teams and assign projects</p>
          </motion.div>

          {/* Stats Cards */}
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
                    <p className="text-sm font-medium text-gray-600">My Teams</p>
                    <p className="text-3xl font-bold text-blue-600">{myTeams.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-blue-600 mt-2">Under your coordination</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projects Assigned</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {myTeams.filter(team => team.project).length}
                    </p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-600 mt-2">Successfully allocated</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {myTeams.filter(team => !team.project).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm text-amber-600 mt-2">Awaiting projects</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Teams Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Team Management</CardTitle>
                <CardDescription className="text-base">
                  View and manage team assignments and project allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="my-teams" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                    <TabsTrigger value="my-teams" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      My Teams
                    </TabsTrigger>
                    <TabsTrigger value="all-teams" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      All Teams
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="my-teams" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">Teams Under Your Coordination</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {myTeams.length} teams
                        </Badge>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <TeamTable teamList={myTeams} showAssignButton={true} />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all-teams" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">All Registered Teams</h3>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {allTeams.length} teams
                        </Badge>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <TeamTable teamList={allTeams} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Assignment Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Project Assignment</CardTitle>
                <CardDescription className="text-base">
                  Assign projects to teams that haven't been assigned yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProjects.map((project, index) => (
                    <motion.div
                      key={project}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      className="group"
                    >
                      <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                          <h4 className="font-bold text-lg mb-4 group-hover:text-emerald-700 transition-colors">
                            {project}
                          </h4>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              Available
                            </Badge>
                            <span className="text-sm text-gray-600 font-medium">
                              {teams.filter(team => team.project === project).length} assigned
                            </span>
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

export default CoordinatorDashboard