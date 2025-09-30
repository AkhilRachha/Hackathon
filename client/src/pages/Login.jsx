import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast'; 

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password cannot be empty'), 
});

const Login = () => {
  const navigate = useNavigate();
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: data.email, user_password: data.password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.clear();
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user._id); 
        localStorage.setItem('userName', result.user.user_name); 
        
        // FIX 1: Save the consistent role_name string from the backend response
        localStorage.setItem('userRole', result.user.role_name);

        // FIX 2: Map role names (strings) to dashboard paths for redirection
        const roleRoutes = {
          'admin': '/admin',
          'coordinator': '/coordinator',
          'participant': '/participant',
          'evaluator': '/evaluator-dashboard',
        };

        // FIX 3: Read the correct property (role_name) for mapping
        const userRoleName = result.user.role_name; 
        
        const redirectPath = roleRoutes[userRoleName] || '/';

        toast({ title: "Success", description: "Login successful!" });
        navigate(redirectPath, { replace: true });
      } else {
        toast({ title: "Login Failed", description: result.message || 'Please check your credentials.' });
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      toast({ title: "Error", description: 'A network error occurred. Please try again later.' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
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
            <CardHeader className="space-y-1 text-center pb-8">
              <motion.div 
                className="flex justify-center mb-6"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Sign in to your hackathon portal account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="h-12 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
                            type="password"
                            className="h-12 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200"
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <motion.button
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register here
                  </motion.button>
                </p>
              </div>

              <div className="mt-6 text-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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

export default Login;
