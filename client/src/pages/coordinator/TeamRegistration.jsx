import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Users, ArrowLeft } from 'lucide-react';

// Zod schema for robust form validation
const teamRegistrationSchema = z.object({
  team_name: z.string().min(3, { message: "Team name must be at least 3 characters." }),
  q_id: z.string().min(1, { message: "You must select a project." }),
  members: z.array(z.string()).min(1, { message: "You must select at least one member." }).max(4, { message: "You cannot select more than 4 members." }),
  user_github_url: z.string().url({ message: "Please enter a valid GitHub repository URL." }),
});

const TeamRegistration = ({ projects = [], participants = [], onRegisterTeam, onCancel }) => {
  const form = useForm({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      team_name: '',
      q_id: '',
      members: [],
      user_github_url: '',
    },
  });

  const onSubmit = (data) => {
    const finalTeamData = {
      ...data,
      max_members: 4,
    };
    onRegisterTeam(finalTeamData);
  };

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

  const inputStyle = "h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl relative z-10"
      >
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <motion.div className="flex justify-center mb-6" whileHover={{ scale: 1.05, rotate: -5 }} transition={{ duration: 0.2 }}>
                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Register a New Team
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Follow the steps below to create and assign a new team.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="team_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">1. Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The Bug Busters" {...field} className={inputStyle} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="q_id"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-semibold text-gray-700">2. Select Project Title</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map(proj => (
                              <div
                                key={proj._id}
                                onClick={() => field.onChange(proj._id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === proj._id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white hover:border-blue-400'}`}
                              >
                                <p className="font-bold text-gray-800">{proj.q_title}</p>
                                <p className="text-sm text-gray-600">{proj.q_description}</p>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="members"
                    render={() => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-lg font-semibold text-gray-700">3. Select Participants (1-4 Members)</FormLabel>
                        <p className="text-sm text-gray-500">
                          You have selected {form.watch('members').length} of 4 participants.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border rounded-lg max-h-60 overflow-y-auto bg-white/80">
                          {participants.map((participant) => (
                            <FormField
                              key={participant._id}
                              control={form.control}
                              name="members"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(participant._id);
                                const isSelectionDisabled = field.value?.length >= 4 && !isChecked;
                                return (
                                  <FormItem className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-slate-100">
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        disabled={isSelectionDisabled}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, participant._id])
                                            : field.onChange(field.value?.filter(id => id !== participant._id));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className={`text-sm font-medium ${isSelectionDisabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}>
                                      {participant.user_name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">4. GitHub Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/your-team/your-repo" {...field} className={inputStyle} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end items-center pt-6 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="button" onClick={onCancel} variant="ghost" className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="submit" size="lg" className="h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200">
                        Register Team <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeamRegistration;
