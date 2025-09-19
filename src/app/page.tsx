
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("login");
  
  // For existing email dialog
  const [showExistingEmailDialog, setShowExistingEmailDialog] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in useAuth will handle state update
      // The useEffect hook will then handle the redirect
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more user-friendly error messages
      let errorMessage = "Please check your credentials and try again.";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Client-side validation
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Password must be at least 6 characters long.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First check if the email is already in use
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        // Email exists - show dialog instead of error toast
        setExistingEmail(email);
        setShowExistingEmailDialog(true);
        setIsLoading(false);
        return;
      }
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        name: name,
        email: email,
        role: "Citizen",
        points: 0,
        courseProgress: 0,
        badges: [],
        avatar: `https://avatar.vercel.sh/${encodeURIComponent(name)}.png`,
        moduleCompletion: {}
      };

      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      
      toast({
          title: "Sign Up Successful!",
          description: "You are now being redirected to the dashboard.",
      });
      // The onAuthStateChanged listener in useAuth will handle state update
      // The useEffect hook will then handle the redirect
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Provide more user-friendly error messages
      let errorMessage = "An error occurred during sign up.";
      
      if (error.code === "auth/email-already-in-use") {
        // Instead of just showing a toast, provide better UX with a dialog
        setExistingEmail(email);
        setShowExistingEmailDialog(true);
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid. Please enter a valid email.";
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: errorMessage,
        });
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please use at least 6 characters.";
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: errorMessage,
        });
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection and try again.";
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: errorMessage,
        });
      } else if (error.message) {
        errorMessage = error.message;
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: errorMessage,
        });
      }
      
      setIsLoading(false);
    }
  }
  
  // Render nothing if we are about to redirect
  if(user) {
    return null;
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
       {isLoading && (
        <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
      </div>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#32a85222,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#32a85244,transparent)]"></div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Icons.logo className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter text-primary">
          {t('app_title')}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {t('app_subtitle')}
        </p>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-sm mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
            <Card>
                <CardHeader>
                    <CardTitle>{t('welcome_back')}</CardTitle>
                    <CardDescription>{t('login_description_form')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} method="POST" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('profile_email')}</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t('logging_in') : t('login')}</Button>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="signup">
            <Card>
                <CardHeader>
                    <CardTitle>{t('create_account')}</CardTitle>
                    <CardDescription>{t('signup_description_form')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} method="POST" className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="name-signup">{t('profile_full_name')}</Label>
                            <Input id="name-signup" name="name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-signup">{t('profile_email')}</Label>
                            <Input id="email-signup" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-signup">{t('password')}</Label>
                            <Input 
                              id="password-signup" 
                              name="password" 
                              type="password" 
                              minLength={6} 
                              required 
                              placeholder="Minimum 6 characters" 
                            />
                            <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t('signing_up') : t('signup')}</Button>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for existing email */}
      <AlertDialog open={showExistingEmailDialog} onOpenChange={setShowExistingEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email Already Registered</AlertDialogTitle>
            <AlertDialogDescription>
              The email address "{existingEmail}" is already registered. 
              Would you like to login with this email instead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setActiveTab("login");
              const emailInput = document.getElementById("email") as HTMLInputElement;
              if (emailInput) {
                emailInput.value = existingEmail;
              }
            }}>Go to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
