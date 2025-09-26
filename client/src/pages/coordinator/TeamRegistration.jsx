import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';

// Zod schema for robust form validation
const teamRegistrationSchema = z.object({
  team_name: z.string().min(3, { message: "Team name must be at least 3 characters." }),
  q_id: z.string().min(1, { message: "You must select a project." }),
  members: z.array(z.string()).min(1, { message: "You must select at least one member." }).max(3, { message: "You cannot select more than 3 members." }),
  user_github_url: z.string().url({ message: "Please enter a valid GitHub repository URL." }),
});

const TeamRegistration = ({ projects, participants, onRegisterTeam, onCancel }) => {
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
    // We add max_members here before sending it up to the parent
    const finalTeamData = {
      ...data,
      max_members: 3, // Or make this dynamic if needed
    };
    onRegisterTeam(finalTeamData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Register a New Team</CardTitle>
          <CardDescription>Follow the steps below to create and assign a new team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="team_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">1. Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Bug Busters" {...field} />
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
                    <FormLabel className="text-lg font-semibold">2. Select Project Title</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(proj => (
                          <div
                            key={proj._id}
                            onClick={() => field.onChange(proj._id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === proj._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
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
                    <FormLabel className="text-lg font-semibold">3. Select Participants (1-3 Members)</FormLabel>
                    <p className="text-sm text-gray-500">
                      You have selected {form.getValues('members').length} of 3 participants.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border rounded-lg max-h-60 overflow-y-auto bg-white">
                      {participants.map((participant) => (
                        <FormField
                          key={participant._id}
                          control={form.control}
                          name="members"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(participant._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, participant._id])
                                      : field.onChange(field.value?.filter(id => id !== participant._id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                {participant.user_name}
                              </FormLabel>
                            </FormItem>
                          )}
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
                    <FormLabel className="text-lg font-semibold">4. GitHub Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/your-team/your-repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={onCancel} variant="outline" className="mr-4">Cancel</Button>
                <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Register Team <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamRegistration;
