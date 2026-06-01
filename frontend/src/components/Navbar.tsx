/*
 * 导航栏组件
 * ----------
 * 页面顶部的导航栏，包含：
 * - Logo + 网站名（点击回首页）
 * - 提问按钮（登录后才显示）
 * - 用户菜单（登录后显示用户名 + 退出按钮）
 * - 登录/注册链接（未登录时显示）
 *
 * 使用 Tailwind CSS 原子类设置样式：
 *   bg-white shadow-sm -> 白色背景 + 小阴影
 *   px-4 -> 水平内边距 1rem
 *   flex -> Flexbox 布局
 *   justify-between -> 子元素两端对齐
 *   items-center -> 子元素垂直居中
 */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth(); // 从全局状态获取用户信息
  const navigate = useNavigate(); // 编程式路由跳转（类似 window.location.href 但不刷新页面）

  const handleLogout = () => {
    logout(); // 清除状态和 Token
    navigate("/"); // 跳转到首页
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧：Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          QA 问答
        </Link>

        {/* 右侧：操作区 */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* 提问按钮 — 仅登录用户可见 */}
              <Link
                to="/ask"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                提问
              </Link>
              {/* 用户名 + 退出 */}
              <span className="text-sm text-gray-600">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
