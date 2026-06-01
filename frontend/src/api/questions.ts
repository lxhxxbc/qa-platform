/*
 * 问题相关 API 调用
 */
import apiClient from "./client";
import type {
  QuestionListResponse,
  QuestionDetail,
  CreateQuestionRequest,
} from "../types";

/** 获取问题列表 */
export async function fetchQuestions(params: {
  page?: number;
  size?: number;
  q?: string;
  tag?: string;
}): Promise<QuestionListResponse> {
  // Axios 的第二个参数 { params } 会自动拼接到 URL 查询参数
  // 例如: /questions?page=1&size=10&q=python
  return apiClient.get("/questions", { params }) as Promise<QuestionListResponse>;
}

/** 获取问题详情 */
export async function fetchQuestion(id: number): Promise<QuestionDetail> {
  return apiClient.get(`/questions/${id}`) as Promise<QuestionDetail>;
}

/** 发布问题（需登录 — Axios 拦截器自动附加 Token） */
export async function createQuestion(
  data: CreateQuestionRequest
): Promise<QuestionDetail> {
  return apiClient.post("/questions", data) as Promise<QuestionDetail>;
}

/** 删除问题（需登录） */
export async function deleteQuestion(id: number): Promise<void> {
  return apiClient.delete(`/questions/${id}`) as Promise<void>;
}
