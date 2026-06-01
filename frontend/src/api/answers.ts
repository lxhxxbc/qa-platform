/*
 * 回答与投票相关 API 调用
 */
import apiClient from "./client";
import type { Answer, CreateAnswerRequest } from "../types";

/** 提交回答 */
export async function createAnswer(
  questionId: number,
  data: CreateAnswerRequest
): Promise<Answer> {
  return apiClient.post(
    `/questions/${questionId}/answers`,
    data
  ) as Promise<Answer>;
}

/** 删除回答 */
export async function deleteAnswer(id: number): Promise<void> {
  return apiClient.delete(`/answers/${id}`) as Promise<void>;
}

/** 采纳回答 */
export async function acceptAnswer(id: number): Promise<Answer> {
  return apiClient.post(`/answers/${id}/accept`) as Promise<Answer>;
}

/** 投票（问题或回答）
 * @param targetType - "questions" 或 "answers"
 * @param targetId - 目标 ID
 * @param value - 1 赞成，-1 反对
 */
export async function vote(
  targetType: "questions" | "answers",
  targetId: number,
  value: 1 | -1
): Promise<{ message: string; value?: number }> {
  return apiClient.post(`/${targetType}/${targetId}/vote`, {
    value,
  }) as Promise<{ message: string; value?: number }>;
}
