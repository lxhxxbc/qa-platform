/*
 * 认证状态管理（React Context）
 * ------------------------------
 * Context 是 React 的全局状态管理工具。
 * 不需要像 Redux 那样引入额外的状态管理库 — 对于中小型应用，Context 足够。
 *
 * AuthContext 提供：
 * - user: 当前登录用户信息（null 表示未登录）
 * - loading: 是否正在检查登录状态
 * - login/logout/register: 修改认证状态的函数
 *
 * AuthProvider 包裹在 App 最外层，所有子组件都能通过 useAuth() 访问认证状态。
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from "../api/auth";

// 定义 Context 的数据结构
interface AuthContextType {
  user: User | null;          // 当前用户，null = 未登录
  loading: boolean;           // 是否正在检查登录状态
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// 创建 Context（初始值为 null，使用时必须被 Provider 包裹）
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider 组件 — 提供全局认证状态
 * 包裹在路由配置的外层，使所有页面都能访问认证信息。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // useState: React Hook，用于在函数组件中管理状态
  // useState<T>(initial): 返回 [当前值, 更新函数]
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 初始为 true，应用启动时检查 token

  // useEffect: React Hook，在组件挂载后执行副作用操作
  // 第二个参数 [] 表示只在组件首次渲染后执行一次
  useEffect(() => {
    checkAuth();
  }, []);

  // 检查本地是否有 Token，如果有就获取用户信息
  async function checkAuth() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false); // 无 token，直接结束 loading
      return;
    }
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      // Token 无效或过期 → 清除
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }

  // 登录 — useCallback 缓存函数引用，避免子组件不必要的重渲染
  const login = useCallback(async (data: LoginRequest) => {
    const tokenResp = await apiLogin(data);
    // 存储 Token 到浏览器本地存储
    localStorage.setItem("access_token", tokenResp.access_token);
    localStorage.setItem("refresh_token", tokenResp.refresh_token);
    // 获取用户信息
    const userData = await getCurrentUser();
    setUser(userData);
  }, []);

  // 注册
  const register = useCallback(async (data: RegisterRequest) => {
    await apiRegister(data);
    // 注册成功后自动登录
    await login({ email: data.email, password: data.password });
  }, [login]);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  // Provider 将 value 中的值注入到所有子孙组件
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook — 在任何组件中获取认证状态
 * 使用示例: const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
