/*
 * TypeScript 类型定义
 * --------------------
 * TypeScript 的核心价值是类型安全。这里定义所有与后端 API 对应的数据结构类型。
 * interface 是 TypeScript 的核心概念，用于定义对象的"形状"（shape）。
 *
 * 这些类型与后端的 Pydantic Schema 一一对应。
 * 有了类型定义，编辑器能给出智能提示和编译时错误检查。
 */

// ---- 用户 ----
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  reputation: number;
  created_at: string; // ISO 日期字符串
}

// ---- 认证 ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ---- 标签 ----
export interface Tag {
  id: number;
  name: string;
  description: string | null;
}

// ---- 问题 ----
export interface QuestionBrief {
  id: number;
  title: string;
  body_preview: string;
  author: User;
  tags: Tag[];
  vote_count: number;
  answer_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionDetail {
  id: number;
  title: string;
  body: string;
  author: User;
  tags: Tag[];
  answers: Answer[];
  vote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionListResponse {
  items: QuestionBrief[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateQuestionRequest {
  title: string;
  body: string;
  tag_names: string[];
}

// ---- 回答 ----
export interface Answer {
  id: number;
  body: string;
  question_id: number;
  author: User;
  is_accepted: boolean;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnswerRequest {
  body: string;
}

// ---- 投票 ----
export interface VoteRequest {
  value: 1 | -1; // 只允许 1 或 -1
}
