import { Link,useNavigate} from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

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
            const token = res.data.token;

            console.log("Login successful:", res.data);
            if(res.data.role === "admin") {
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
            <div className="relative w-full lg:w-1/2 h-64 lg:h-auto">
                <img
                    src="/bg-img.jpg"
                    alt="Computer shop display"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-secondary/70 via-secondary/50 to-transparent" />
                <div className="relative h-full w-full flex items-center justify-center lg:justify-start px-8 lg:px-12">
                    <p className="text-2xl lg:text-3xl font-semibold text-text max-w-md">
                        Your perfect match for every computer build and upgrade.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary p-8 shadow-xl">
                    <div className="space-y-2 text-center">
                        <h1 className="font-heading text-3xl text-text">Welcome back</h1>
                        <p className="text-sm text-muted">Sign in to continue to I-Computer.</p>
                    </div>

                    <form className="mt-8 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email
                            </label>
                            <input onChange={(event)=>{
                                setEmail(event.target.value);
                               
                            }}
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium">
                                Password
                            </label>
                            
                            <input onChange={(event)=>{
                                setPassword(event.target.value);
                            }}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center gap-2">
                                <input type="checkbox" className="rounded border-secondary/30 text-accent focus:ring-accent" />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="text-accent font-medium hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <button onClick={login}
                            type="submit"
                            className="w-full rounded-lg bg-accent px-4 py-3 text-primary font-medium shadow-md transition duration-200 hover:brightness-110"
                        >
                            Log in
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-center text-muted">
                        Don't have an account? <Link to="/register" className="text-accent font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}