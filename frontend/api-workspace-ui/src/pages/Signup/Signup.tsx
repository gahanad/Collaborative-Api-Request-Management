import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
    const navigate = useNavigate();
    const signup = useAuthStore(
        (state) => state.signup
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await signup({
                name,
                email,
                password

            });

            setSuccess(
                "Account created successfully!"
            );

            setTimeout(() => {
                navigate("/");
            }, 1500);

        }

        catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Signup Failed"
            );
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignup}
                className="bg-white shadow-lg rounded-lg p-8 `w-[400px]` space-y-5">
                <h1 className="text-3xl font-bold text-center">
                    API Workspace
                </h1>
                <p className="text-center text-gray-500">
                    Create your account
                </p>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e)=>
                            setName(e.target.value)
                        }
                        className="w-full border rounded-md px-3 py-2 mt-1"
                        placeholder="Enter name"
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e)=>
                            setEmail(e.target.value)
                        }
                        className="w-full border rounded-md px-3 py-2 mt-1"
                        placeholder="Enter email"
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>
                            setPassword(e.target.value)
                        }
                        className="w-full border rounded-md px-3 py-2 mt-1"
                        placeholder="Enter password"
                        required
                    />
                </div>

                {
                    error &&
                    <p className="text-red-500 text-center">
                        {error}
                    </p>
                }

                {
                    success &&
                    <p className="text-green-600 text-center">
                        {success}
                    </p>
                }

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-2">
                    {
                        loading
                        ?
                        "Creating Account..."
                        :
                        "Signup"
                    }
                </button>

                <p className="text-center">
                    Already have an account?
                    <span
                        onClick={() => navigate("/")}
                        className="text-blue-600 cursor-pointer ml-1">
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
}