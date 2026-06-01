/*
 * 布局组件
 * --------
 * 定义了所有页面的公共结构：顶部导航栏 + 下方内容区。
 * <Outlet /> 是 React Router 的占位符，会根据当前 URL 渲染对应的页面组件。
 *
 * 页面结构：
 * +-------------+
 * |   Navbar     | <- 固定导航栏
 * +-------------+
 * |  <Outlet />  | <- 页面内容（根据 URL 变化）
 * +-------------+
 */
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* max-w-6xl: 最大宽度约 72rem（1152px），居中显示 */}
      {/* mx-auto: 水平居中 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
