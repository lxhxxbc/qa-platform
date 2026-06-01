/*
 * 路由守卫组件
 * ------------
 * 用于保护需要登录才能访问的路由（如 /ask 发布问题页）。
 * 如果用户未登录，自动重定向到登录页。
 *
 * 使用方式：
 *   <AuthGuard><AskQuestionPage /></AuthGuard>
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // 正在检查登录状态时，显示加载提示（避免闪屏）
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  // 未登录 → 重定向到登录页
  // state={{ from }} 记录来源页面，登录后可以跳回来
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 已登录 → 正常渲染子页面
  return <>{children}</>;
}
