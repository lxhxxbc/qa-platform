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
import HomePage from "./pages/HomePage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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
