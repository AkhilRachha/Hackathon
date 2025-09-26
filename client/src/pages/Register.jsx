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

// Zod schema for validation
const registerSchema = z
  .object({
    user_name: z.string().min(1, 'Name is required'),
    user_email: z.string().email('Please enter a valid email address'),
    user_password: z.string().min(6, 'Password must be at least 6 characters'),
    user_phoneno: z.string().min(10, 'Phone number must be at least 10 digits'),
    state: z.string().min(1, 'Please select a state'),
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
  
  const [states, setStates] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [showOtherCollege, setShowOtherCollege] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/states');
        setStates(response.data);
      } catch (error) {
        console.error('Error fetching states', error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setColleges([]);
      return;
    }
    const fetchCollegesByState = async () => {
      setIsLoadingColleges(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/colleges/${selectedState}`);
        setColleges(response.data);
      } catch (error) {
        console.error('Error fetching colleges for state', error);
      } finally {
        setIsLoadingColleges(false);
      }
    };
    fetchCollegesByState();
  }, [selectedState]);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_name: '',
      user_email: '',
      user_password: '',
      user_phoneno: '',
      state: '',
      clg_id: '',
      other_clg_name: '',
      other_clg_district: '',
      other_clg_state: '',
    },
  });

  const onSubmit = async (data) => {
    let finalCollegeId = data.clg_id;

    // Step 1: If user selected "Other", create the new college first
    if (data.clg_id === 'other') {
      try {
        const collegeResponse = await axios.post('http://localhost:5000/api/colleges', {
          clg_name: data.other_clg_name,
          district: data.other_clg_district,
          state: data.other_clg_state,
        });
        finalCollegeId = collegeResponse.data._id;
      } catch (error) {
        console.error('Error adding new college:', error);
        alert('Failed to add the new college. Please try again.');
        return;
      }
    }

    // Step 2: Register the new user with the correct college ID
    try {
      const userPayload = {
        user_name: data.user_name,
        user_email: data.user_email,
        user_password: data.user_password,
        user_phoneno: data.user_phoneno,
        clg_id: finalCollegeId,
      };

      // --- THIS IS THE CORRECTED URL ---
      await axios.post('http://localhost:5000/api/register', userPayload);
      
      alert('Registration successful! Please log in.');
      navigate('/login');

    } catch (error) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMessage);
    }
  };
  
  const filteredColleges = colleges.filter((college) =>
    college.clg_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className="w-full max-w-md relative z-10"
      >
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <motion.div className="flex justify-center mb-6" whileHover={{ scale: 1.05, rotate: -5 }} transition={{ duration: 0.2 }}>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="user_name" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">Name</FormLabel><FormControl><Input placeholder="Enter your name" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="user_email" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel><FormControl><Input type="email" placeholder="Enter your email" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="user_password" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel><FormControl><Input type="password" placeholder="Create a password" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="user_phoneno" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">Phone Number</FormLabel><FormControl><Input placeholder="Enter your phone number" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">State</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedState(value);
                            form.setValue('clg_id', '');
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={inputStyle}><SelectValue placeholder="Select your state" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => ( <SelectItem key={state} value={state}>{state}</SelectItem> ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="clg_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">College</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowOtherCollege(value === 'other');
                          }}
                          value={field.value}
                          disabled={!selectedState || isLoadingColleges}
                        >
                          <FormControl>
                            <SelectTrigger className={inputStyle}><SelectValue placeholder={isLoadingColleges ? "Loading..." : "Select your college"} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-2"><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-9"/></div>
                            {filteredColleges.map((college) => ( <SelectItem key={college._id} value={college._id}>{college.clg_name}</SelectItem> ))}
                            {!isLoadingColleges && colleges.length > 0 && <SelectItem value="other">Other</SelectItem>}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showOtherCollege && (
                     <>
                        <FormField control={form.control} name="other_clg_name" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">College Name</FormLabel><FormControl><Input placeholder="Enter college name" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="other_clg_district" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">District</FormLabel><FormControl><Input placeholder="Enter district" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="other_clg_state" render={({ field }) => ( <FormItem><FormLabel className="text-sm font-semibold text-gray-700">State</FormLabel><FormControl><Input placeholder="Enter state" className={inputStyle} {...field} /></FormControl><FormMessage /></FormItem> )} />
                     </>
                  )}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 mt-2" size="lg">
                      Create Account
                    </Button>
                  </motion.div>
                </form>
              </Form>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <motion.button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Sign in here
                  </motion.button>
                </p>
              </div>
              <div className="mt-6 text-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50">
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

