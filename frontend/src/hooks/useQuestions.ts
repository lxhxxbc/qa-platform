/*
 * useQuestions — 自定义 React Hook
 * ----------------------------------
 * Hook 是 React 的核心概念：把组件逻辑抽取到可复用的函数中。
 * 命名必须以 use 开头（React 约定）。
 *
 * 这个 Hook 封装了获取问题列表的所有状态和操作：
 * - questions: 问题列表数据
 * - loading: 加载状态
 * - page/setPage: 分页状态
 * - search/setSearch: 搜索文本
 * - 自动在状态变化时重新请求数据
 */
import { useState, useEffect, useCallback } from "react";
import type { QuestionBrief } from "../types";
import { fetchQuestions } from "../api/questions";

interface UseQuestionsReturn {
  questions: QuestionBrief[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  setPage: (p: number) => void;
  refresh: () => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<QuestionBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  // refreshKey: 自增计数器，手动触发重新请求
  const [refreshKey, setRefreshKey] = useState(0);

  // useCallback: 缓存函数引用，避免每次渲染都创建新函数
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // useEffect: 当 page、search、refreshKey 变化时自动请求数据
  useEffect(() => {
    let cancelled = false; // 标志变量，组件卸载后不再更新状态
    setLoading(true);

    fetchQuestions({ page, size: 10, q: search || undefined })
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.items);
          setTotalPages(data.pages);
          setTotal(data.total);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // cleanup 函数：组件卸载时设置 cancelled=true，防止内存泄漏
    return () => { cancelled = true; };
  }, [page, search, refreshKey]);

  return {
    questions, loading, page, totalPages, total,
    search, setSearch, setPage, refresh,
  };
}
