import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Login() {

    const navigate = useNavigate();

    const login = useAuthStore(state => state.login);

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleLogin = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            await login({
                email,
                password
            });

            navigate("/dashboard");

        } catch (err: any) {

            setError(
                err.response?.data?.message ??
                "Login Failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleLogin}
                className="bg-white shadow-lg rounded-lg p-8 `w-[400px]` space-y-5">

                <h1 className="text-3xl font-bold text-center">
                    API Workspace
                </h1>

                <p className="text-center text-gray-500">
                    Login to continue
                </p>

                <div>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 mt-1"
                    />

                </div>

                <div>

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 mt-1"
                    />

                </div>

                {
                    error &&
                    <p className="text-red-500 text-center">
                        {error}
                    </p>
                }

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">

                    {
                        loading
                            ? "Logging in..."
                            : "Login"
                    }

                </button>

                <p className="text-center">

                    Don't have an account?

                    <span
                        onClick={()=>navigate("/signup")}
                        className="text-blue-600 cursor-pointer ml-1">

                        Signup

                    </span>

                </p>

            </form>

        </div>
    );
}