/*
 * 登录页面
 * --------
 * 表单提交时调用后端 API 登录，成功后跳转到首页。
 * 如果已登录，自动重定向到首页。
 */
import { useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // useState: 管理表单输入状态
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 已登录 → 直接回到首页
  if (user) return <Navigate to="/" replace />;

  // handleSubmit: 表单提交处理函数
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 阻止浏览器默认的页面刷新行为
    setError("");

    if (!email || !password) {
      setError("请填写所有字段");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/"); // 登录成功 → 跳转首页
    } catch (err: any) {
      // 处理后端返回的错误
      setError(err.response?.data?.detail || "登录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">登录</h1>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {/* 邮箱 */}
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

        {/* 密码 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入密码"
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "登录中..." : "登录"}
        </button>

        {/* 注册链接 */}
        <p className="text-center text-sm text-gray-500">
          还没有账号？
          <Link to="/register" className="text-blue-600 hover:underline ml-1">
            立即注册
          </Link>
        </p>
      </form>
    </div>
  );
}
