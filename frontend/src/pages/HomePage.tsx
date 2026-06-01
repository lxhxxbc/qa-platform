/*
 * 首页 — 问题列表 + 搜索栏
 * -------------------------
 * 功能：
 * - 搜索框：按标题关键词过滤问题
 * - 问题卡片列表
 * - 分页器
 * - 空状态提示
 */
import { useQuestions } from "../hooks/useQuestions";
import QuestionCard from "../components/QuestionCard";
import Pagination from "../components/Pagination";

export default function HomePage() {
  const {
    questions, loading, page, totalPages, total,
    search, setSearch, setPage,
  } = useQuestions();

  // 按关键词搜索时回到第一页
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      {/* 搜索栏 */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜索问题..."
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 加载状态 */}
      {loading && (
        <p className="text-center text-gray-500 py-10">加载中...</p>
      )}

      {/* 问题列表 */}
      {!loading && questions.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-3">共 {total} 个问题</p>
          <div className="space-y-3">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* 空状态 */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">暂无问题</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "换个关键词试试" : "成为第一个提问的人吧！"}
          </p>
        </div>
      )}
    </div>
  );
}
