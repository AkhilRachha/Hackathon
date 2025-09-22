import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const registerSchema = z
  .object({
    user_name: z.string().min(1, 'Name is required'),
    user_email: z.string().email('Please enter a valid email address'),
    user_password: z.string().min(6, 'Password must be at least 6 characters'),
    user_phoneno: z.string().min(10, 'Phone number must be at least 10 digits'),
    user_github_url: z.string().url('Please enter a valid URL'),
    clg_id: z.string().min(1, 'Please select a college'),
    other_clg_name: z.string().optional(),
    other_clg_district: z.string().optional(),
    other_clg_state: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.clg_id === 'other' &&
        (!data.other_clg_name ||
          !data.other_clg_district ||
          !data.other_clg_state)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Please fill in all fields for the new college',
      path: ['other_clg_name'],
    }
  );

const Register = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [showOtherCollege, setShowOtherCollege] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/colleges');
        setColleges(response.data);
      } catch (error) {
        console.error('Error fetching colleges', error);
      }
    };
    fetchColleges();
  }, []);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_name: '',
      user_email: '',
      user_password: '',
      user_phoneno: '',
      user_github_url: '',
      clg_id: '',
      other_clg_name: '',
      other_clg_district: '',
      other_clg_state: '',
    },
  });

  const onSubmit = async (data) => {
    let collegeId = data.clg_id;

    if (data.clg_id === 'other') {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/colleges',
          {
            clg_name: data.other_clg_name,
            district: data.other_clg_district,
            state: data.other_clg_state,
          }
        );
        collegeId = response.data._id;
        setColleges([...colleges, response.data]);
        form.setValue('clg_id', collegeId);
        setShowOtherCollege(false);
      } catch (error) {
        console.error('Error adding college', error);
        return;
      }
    }

    try {
      // Assuming a default role of 'participant' on the backend
      await axios.post('http://localhost:5000/api/user/register', {
        ...data,
        clg_id: collegeId,
      });
      navigate('/participant');
    } catch (error) {
      console.error('Error registering user', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const filteredColleges = colleges.filter((college) =>
    college.clg_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
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
                  <UserPlus className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Join the hackathon portal community
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="user_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name"
                            className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Create a password"
                            type="password"
                            className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_phoneno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          GitHub URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your GitHub URL"
                            className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="clg_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          College
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowOtherCollege(value === 'other');
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue placeholder="Select your college" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search for a college"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="h-9"
                              />
                            </div>
                            {filteredColleges.map((college) => (
                              <SelectItem key={college._id} value={college._id}>
                                {college.clg_name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showOtherCollege && (
                    <>
                      <FormField
                        control={form.control}
                        name="other_clg_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              College Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter college name"
                                className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="other_clg_district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              District
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter district"
                                className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="other_clg_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              State
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter state"
                                className="h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 mt-6"
                      size="lg"
                    >
                      Create Account
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <motion.button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in here
                  </motion.button>
                </p>
              </div>

              <div className="mt-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;