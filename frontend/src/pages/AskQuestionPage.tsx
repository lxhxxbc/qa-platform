/*
 * 发布问题页面（需登录）
 * -----------------------
 * 表单：标题 + Markdown 正文 + 标签输入。
 * 提交后跳转到新创建的问题详情页。
 */
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthGuard from "../components/AuthGuard";
import MarkdownEditor from "../components/MarkdownEditor";
import { createQuestion } from "../api/questions";

function AskQuestionContent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState(""); // 用户输入的标签文本
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.length < 5) {
      setError("标题至少5个字符");
      return;
    }
    if (body.length < 20) {
      setError("正文至少20个字符");
      return;
    }

    // 将标签文本拆分为数组（用逗号或空格分隔）
    const tagNames = tagInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 5); // 最多5个标签

    setSubmitting(true);
    try {
      const question = await createQuestion({ title, body, tag_names: tagNames });
      navigate(`/questions/${question.id}`); // 跳转到新问题详情
    } catch (err: any) {
      setError(err.response?.data?.detail || "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">提出问题</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="用一句话概括你的问题"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
        </div>

        {/* 正文（Markdown） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            正文 <span className="text-red-500">*</span>
          </label>
          <MarkdownEditor value={body} onChange={setBody} />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="用逗号分隔，最多5个（如 python, fastapi, react）"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "发布中..." : "发布问题"}
        </button>
      </form>
    </div>
  );
}

// 用 AuthGuard 包裹整个页面 — 未登录自动跳转
export default function AskQuestionPage() {
  return (
    <AuthGuard>
      <AskQuestionContent />
    </AuthGuard>
  );
}
