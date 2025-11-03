import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Building2, Sparkles, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { registerUser, loginUser } from '../utils/authService';



interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // 🟢 Login function (connects to backend)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // Client-side validation
  if (!loginEmail || !loginPassword) {
    toast.error("Please enter both email and password");
    return;
  }


  try {
    const res = await loginUser({ email: loginEmail, password: loginPassword });
    if (res && res.token) {
      toast.success("Login successful!");
      onLogin(res);
    } else {
      toast.error("Invalid credentials");
    }
  } catch (err) {
    toast.error("Invalid credentials");
  }
};



  // 🟢 Signup function (connects to backend)
  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (signupPassword.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return;
  }

  try {
    const response = await registerUser({
      name: fullName,
      phone: signupPhone,
      email: signupEmail,
      password: signupPassword,
    });

    toast.success("Account created successfully! Please log in.");

    setFullName('');
    setBusinessName('');
    setSignupPhone('');
    setSignupEmail('');
    setSignupPassword('');

    // ✅ Correct way to switch to login tab
    setActiveTab("login");

  } catch (error: any) {
    toast.error(error.response?.data?.message || "Signup failed");
  }
};



  // (Optional mock) Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Password reset link sent to ${forgotPasswordEmail}`, {
      description: 'Please check your email inbox and spam folder.',
    });
    setForgotPasswordEmail('');
    setIsForgotPasswordOpen(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-primary">BizLedger AI</h1>
          </div>
          <p className="text-muted-foreground">
            Lightweight ERP for small businesses with AI-powered insights
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>

          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Login to your BizLedger account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="link" className="h-auto p-0 text-primary">
                            Forgot password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="forgot-email">Email Address</Label>
                              <Input
                                id="forgot-email"
                                type="email"
                                placeholder="you@example.com"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" className="flex-1">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Reset Link
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsForgotPasswordOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIGNUP TAB */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Get started with BizLedger in minutes</CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="full-name">Full Name</Label>
    <Input
      id="full-name"
      placeholder="John Doe"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="business-name">Business Name</Label>
    <Input
      id="business-name"
      placeholder="Your Business Name"
      value={businessName}
      onChange={(e) => setBusinessName(e.target.value)}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="signup-phone">Phone Number</Label>
    <Input
      id="signup-phone"
      type="text"
      placeholder="+92XXXXXXXXXX"
      value={signupPhone}
      onChange={(e) => setSignupPhone(e.target.value)}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="signup-email">Email</Label>
    <Input
      id="signup-email"
      type="email"
      placeholder="you@example.com"
      value={signupEmail}
      onChange={(e) => setSignupEmail(e.target.value)}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="signup-password">Password</Label>
    <Input
      id="signup-password"
      type="password"
      placeholder="••••••••"
      value={signupPassword}
      onChange={(e) => setSignupPassword(e.target.value)}
      required
    />
  </div>

  <Button type="submit" className="w-full">
    <Sparkles className="mr-2 h-4 w-4" />
    Create Account
  </Button>
</form>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
