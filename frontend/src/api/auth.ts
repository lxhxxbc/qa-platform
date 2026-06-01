/*
 * 认证相关 API 调用
 * 每个函数封装一个后端 API 端点。
 */
import apiClient from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "../types";

/**
 * 用户注册
 * POST /api/auth/register
 */
export async function registerUser(data: RegisterRequest): Promise<User> {
  return apiClient.post("/auth/register", data) as Promise<User>;
}

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  return apiClient.post("/auth/login", data) as Promise<TokenResponse>;
}

/**
 * 获取当前用户信息（需要 Authorization 头）
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get("/auth/me") as Promise<User>;
}
