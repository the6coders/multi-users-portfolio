import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login({ id: "demo-user", name: "Demo User", email: "demo@example.com" });
    navigate("/dashboard");
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-2 text-slate-300">Auth API integration is ready for Phase 2.</p>
      <button
        type="button"
        onClick={handleLogin}
        className="mt-5 w-full rounded-md bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
      >
        Continue as Demo User
      </button>
    </section>
  );
}
