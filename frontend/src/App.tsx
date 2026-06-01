/*
 * App 根组件
 * ----------
 * 定义整个应用的路由结构和 Provider 层级。
 * React Router v6 使用 createBrowserRouter + RouterProvider 模式。
 *
 * Provider 层级（从外到内）：
 * AuthProvider -> RouterProvider（包含 Layout -> 各页面）
 *
 * 注意：页面组件文件稍后创建，目前先占位引用
 */
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

// 页面组件 — 稍后创建，先创建占位页面组件避免编译报错
// 使用内联的临时占位组件
function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-700">QA 问答社区</h1>
      <p className="text-gray-400 mt-2">页面组件开发中...</p>
    </div>
  );
}

function QuestionDetailPage() {
  return <div className="text-center py-16 text-gray-400">问题详情页开发中...</div>;
}

function AskQuestionPage() {
  return <div className="text-center py-16 text-gray-400">发布问题页开发中...</div>;
}

function LoginPage() {
  return <div className="text-center py-16 text-gray-400">登录页开发中...</div>;
}

function RegisterPage() {
  return <div className="text-center py-16 text-gray-400">注册页开发中...</div>;
}

// ---- 路由定义 ----
// createBrowserRouter: 创建路由实例（React Router v6.4+ 的新 API）
// path: URL 路径
// element: 匹配该路径时渲染的组件
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Layout 作为所有页面的外壳
    children: [
      { index: true, element: <HomePage /> },           // index: true = 根路径 /
      { path: "questions/:id", element: <QuestionDetailPage /> }, // :id 是动态参数
      { path: "ask", element: <AskQuestionPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
