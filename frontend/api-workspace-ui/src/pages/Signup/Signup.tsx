
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Braces, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
    const navigate = useNavigate();
    const signup = useAuthStore((state) => state.signup);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await signup({ name, email, password });

            setSuccess("Account created successfully!");

            window.setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (err: unknown) {
            const message =
                typeof err === "object" &&
                err !== null &&
                "response" in err
                    ? (
                        err as {
                            response?: {
                                data?: { message?: string };
                            };
                        }
                    ).response?.data?.message
                    : undefined;

            setError(message ?? "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100B1B] px-4 py-10">
            {/* Decorative neon glow */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-purple-500/15 blur-[110px]" />

            <form
                onSubmit={handleSignup}
                className="relative w-full max-w-md rounded-3xl border border-[#49365E] bg-[#191123]/95 p-7 shadow-2xl shadow-purple-950/40 backdrop-blur-xl sm:p-10"
            >
                <div className="mb-7 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-950/40">
                        <Braces size={28} strokeWidth={2.2} />
                    </div>
                </div>

                <h1 className="text-center text-3xl font-bold tracking-tight text-[#F5F0FF]">
                    API Workspace
                </h1>

                <p className="mt-2 text-center text-sm text-[#B9A9CB]">
                    Create your account and get started.
                </p>

                <div className="mt-8 space-y-4">
                    <div>
                        <label
                            htmlFor="signup-name"
                            className="mb-2 block text-sm font-medium text-[#E5D8F5]"
                        >
                            Name
                        </label>

                        <div className="relative">
                            <UserRound
                                size={17}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F82C4]"
                            />

                            <input
                                id="signup-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                                className="h-12 w-full rounded-xl border border-[#49365E] bg-[#100B1B] pl-10 pr-4 text-sm text-[#F5F0FF] outline-none transition placeholder:text-[#786889] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="signup-email"
                            className="mb-2 block text-sm font-medium text-[#E5D8F5]"
                        >
                            Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={17}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F82C4]"
                            />

                            <input
                                id="signup-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="h-12 w-full rounded-xl border border-[#49365E] bg-[#100B1B] pl-10 pr-4 text-sm text-[#F5F0FF] outline-none transition placeholder:text-[#786889] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="signup-password"
                            className="mb-2 block text-sm font-medium text-[#E5D8F5]"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={17}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F82C4]"
                            />

                            <input
                                id="signup-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                className="h-12 w-full rounded-xl border border-[#49365E] bg-[#100B1B] pl-10 pr-4 text-sm text-[#F5F0FF] outline-none transition placeholder:text-[#786889] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                    >
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        role="status"
                        className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                    >
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-400 focus:outline-none focus:ring-4 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create account"}
                    {!loading && <ArrowRight size={17} />}
                </button>

                <p className="mt-6 text-center text-sm text-[#B9A9CB]">
                    Already have an account?{" "}
                    <Link
                        to="/"
                        className="font-semibold text-violet-300 transition hover:text-violet-200 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </main>
    );
}
