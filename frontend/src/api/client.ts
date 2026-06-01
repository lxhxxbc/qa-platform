/*
 * Axios HTTP 客户端封装
 * -----------------------
 * Axios 是一个基于 Promise 的 HTTP 客户端。
 * 核心概念：
 * - instance: 一个配置好的 Axios 实例，所有请求共用基础配置
 * - 拦截器（interceptors）: 在请求发出前/响应回来后自动执行的"钩子函数"
 *   用于自动添加 JWT Token、自动刷新过期 Token 等。
 */

import axios from "axios";

// 创建 Axios 实例 — 设置后端 API 的基础 URL
// baseURL: 所有请求都会拼接在这个 URL 后面
// 例如 api.get("/questions") → 实际请求 http://localhost:8000/api/questions
// 但在开发环境，Vite proxy 会将 /api 转发到 localhost:8000
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- 请求拦截器 ----
// 在每次请求发出前自动执行
apiClient.interceptors.request.use((config) => {
  // 从 localStorage 读取 access_token
  // localStorage 是浏览器的本地存储（类似 cookie，但不会自动发送到服务端）
  const token = localStorage.getItem("access_token");
  if (token) {
    // 把 Token 添加到请求头的 Authorization 字段
    // 格式: "Bearer eyJhbGciOi..." (注意 Bearer 后面有空格)
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // 必须返回 config，否则请求会被取消
});

// ---- 响应拦截器 ----
// 在每次收到响应后自动执行
apiClient.interceptors.response.use(
  // 成功响应 — 直接返回 data 部分（剥离 Axios 包装层）
  (response) => response.data,
  // 错误响应 — 处理 401 Token 过期
  async (error) => {
    const originalRequest = error.config; // 原始请求配置

    // 如果是 401 且还没重试过（避免无限循环）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 标记为重试过一次

      try {
        // 用 refresh_token 换取新的 access_token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          // 调用刷新接口
          const data: any = await axios.post("/api/auth/refresh", {
            refresh_token: refreshToken,
          });

          // 保存新 Token
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // 用新 Token 重试原请求
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // 刷新失败 → 清除 Token，重定向到登录页
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
