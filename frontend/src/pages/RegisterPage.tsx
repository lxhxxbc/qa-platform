/*
 * 注册页面
 * --------
 * 与登录页面类似，但多了用户名输入框。
 * 注册成功后自动登录并跳转首页。
 */
import { useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("请填写所有字段");
      return;
    }
    if (username.length < 3) {
      setError("用户名至少3个字符");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6个字符");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "注册失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3-50个字符"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="至少6个字符"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="再次输入密码"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "注册中..." : "注册"}
        </button>

        <p className="text-center text-sm text-gray-500">
          已有账号？
          <Link to="/login" className="text-blue-600 hover:underline ml-1">
            去登录
          </Link>
        </p>
      </form>
    </div>
  );
}
