/*
 * Vite 配置文件
 * Vite 是新一代前端构建工具，开发时提供热更新（HMR），构建时使用 Rollup 打包。
 * 配置文件定义了 Vite 的插件、开发服务器代理等。
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";  // React JSX 转换插件
import tailwindcss from "@tailwindcss/vite";  // Tailwind CSS 插件

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,  // 开发服务器端口
    // proxy 配置：开发时将 /api 请求转发到后端
    // 这样前端代码中请求 /api/questions 实际上会发给 localhost:8000
    // 避免跨域问题（CORS）的同时也模拟了生产环境的部署架构
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,  // 修改请求头的 Origin 字段
      },
    },
  },
});
