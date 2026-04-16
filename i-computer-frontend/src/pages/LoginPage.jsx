import { Link,useNavigate} from "react-router-dom";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [googleToken, setGoogleToken] = useState(null);
    const navigate = useNavigate();


    const loginWithGoogle = useGoogleLogin({
        flow: "implicit",
        ux_mode: "popup",
        scope: "openid email profile",
        prompt: "select_account",
        onSuccess: async (tokenResponse) => {
            try {
                setGoogleToken(tokenResponse);

                const backendUrl = import.meta.env.VITE_backend_URL;
                const res = await axios.post(`${backendUrl}/users/google-login`, {
                    access_token: tokenResponse.access_token,
                });

                localStorage.setItem("token", res.data.token);
                const userRole = String(res.data.role || "").toLowerCase();

                if (userRole) {
                    localStorage.setItem("role", userRole);
                } else {
                    localStorage.removeItem("role");
                }

                if (userRole === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }

                toast.success("Logged in with Google successfully!");
            } catch (error) {
                console.error("Google login backend failed:", error);
                toast.error("Google login failed on server. Please try again.");
            }
        },
        onError: () => {
            toast.error("Google login failed. Please try again.");
        },
    });



    async function login(e){
        e.preventDefault();
        console.log("login button clicked");
        console.log("email:", email);
        console.log("password:", password);

        try {
            const res = await axios.post(`${import.meta.env.VITE_backend_URL}/users/login`, {
                email: email,
                password: password
            });

            localStorage.setItem("token", res.data.token);
            const userRole = String(res.data.role || "").toLowerCase();

            if (userRole) {
                localStorage.setItem("role", userRole);
            } else {
                localStorage.removeItem("role");
            }

            console.log("Login successful:", res.data);
            if(userRole === "admin") {
                navigate("/admin");
            }else {
                navigate("/");
            }

            toast.success("Login successful! Redirecting...");
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please check your credentials and try again.");
        }

    }


    return (
        <div className="min-h-screen bg-primary text-text lg:flex">
            <div className="relative hidden w-full lg:flex lg:w-1/2 h-auto">
                <img
                    src="/bg-img.jpg"
                    alt="Computer shop display"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                <div className="relative h-full w-full flex items-center justify-center lg:justify-start px-8 lg:px-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-bold text-text max-w-md leading-tight">
                            Welcome to ApexTech
                        </h2>
                        <p className="text-lg text-muted max-w-md">
                            Your perfect match for every computer build and upgrade.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center p-6 lg:p-12 lg:w-1/2 min-h-screen lg:min-h-auto">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary/50 p-8 shadow-lg backdrop-blur-sm">
                    <div className="space-y-2">
                        <h1 className="font-heading text-3xl font-bold text-text">Sign in</h1>
                        <p className="text-sm text-muted">Continue to your ApexTech account</p>
                    </div>

                    <form className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-text">
                                Email Address
                            </label>
                            <input onChange={(event)=>{
                                setEmail(event.target.value);
                               
                            }}
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                className="w-full rounded-lg border border-white/20 bg-primary/50 px-4 py-3 text-text placeholder-muted/60 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold text-text">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs text-accent font-medium hover:underline">
                                    Forgot?
                                </Link>
                            </div>
                            
                            <input onChange={(event)=>{
                                setPassword(event.target.value);
                            }}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-white/20 bg-primary/50 px-4 py-3 text-text placeholder-muted/60 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 text-accent focus:ring-accent accent-accent" />
                            <span className="text-sm text-muted">Keep me signed in</span>
                        </label>

                        <button
                            onClick={login}
                            type="submit"
                            className="w-full rounded-lg bg-accent px-4 py-3 text-primary font-semibold shadow-lg transition duration-200 hover:brightness-110 active:scale-[0.98]"
                        >
                            Sign in
                        </button>

                        <div className="relative flex items-center justify-center text-xs text-muted py-2">
                            <span className="h-px w-full bg-white/10" />
                            <span className="mx-3 whitespace-nowrap">or continue with</span>
                            <span className="h-px w-full bg-white/10" />
                        </div>

                        <button
                            type="button"
                            onClick={() => loginWithGoogle()}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-primary/30 px-4 py-3 text-sm font-medium text-text shadow-sm transition duration-200 hover:bg-primary/50 hover:border-white/30"
                        >
                            <FcGoogle className="text-xl" />
                            Google
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-center text-muted">
                        New to ApexTech? <Link to="/register" className="text-accent font-semibold hover:underline">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}