/*
 * 问题详情页
 * ----------
 * 显示问题的完整内容 + 所有回答 + 回答表单。
 * 这是最复杂的页面，包含：
 * - 问题主体（标题、正文、标签、作者、投票、时间）
 * - 回答列表（每个回答有正文、作者、投票、是否被采纳）
 * - 回答提交表单（需要登录）
 * - 采纳按钮（仅提问者可见）
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchQuestion, deleteQuestion } from "../api/questions";
import { createAnswer, deleteAnswer, acceptAnswer } from "../api/answers";
import MarkdownRenderer from "../components/MarkdownRenderer";
import MarkdownEditor from "../components/MarkdownEditor";
import VoteButtons from "../components/VoteButtons";
import type { QuestionDetail, Answer } from "../types";

export default function QuestionDetailPage() {
  // useParams: 从 URL 中提取动态参数（如 /questions/123 → { id: "123" }）
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // 回答表单状态
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState("");

  // 加载问题详情
  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestion(Number(id));
      setQuestion(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  // 提交回答
  const handleSubmitAnswer = async () => {
    if (!answerBody.trim()) return;
    setSubmitting(true);
    setAnswerError("");
    try {
      await createAnswer(Number(id), { body: answerBody });
      setAnswerBody("");
      loadQuestion(); // 重新加载页面
    } catch (err: any) {
      setAnswerError(err.response?.data?.detail || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 删除问题
  const handleDeleteQuestion = async () => {
    if (!confirm("确定要删除这个问题吗？")) return;
    try {
      await deleteQuestion(Number(id));
      navigate("/");
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  // 采纳回答
  const handleAcceptAnswer = async (answerId: number) => {
    try {
      await acceptAnswer(answerId);
      loadQuestion();
    } catch (err) {
      console.error("采纳失败:", err);
    }
  };

  // 删除回答
  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm("确定要删除这个回答吗？")) return;
    try {
      await deleteAnswer(answerId);
      loadQuestion();
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  // ---- 渲染 ----
  if (loading) {
    return <p className="text-center text-gray-500 py-10">加载中...</p>;
  }
  if (error || !question) {
    return <p className="text-center text-red-500 py-10">{error || "问题不存在"}</p>;
  }

  const isAuthor = user?.id === question.author.id;

  return (
    <div>
      {/* 问题标题区 */}
      <div className="flex gap-4">
        <VoteButtons
          targetType="questions"
          targetId={question.id}
          initialCount={question.vote_count}
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="text-gray-700">{question.author.username}</span>
            <span>{new Date(question.created_at).toLocaleString("zh-CN")}</span>
            <span>{question.view_count} 浏览</span>
            {isAuthor && (
              <button
                onClick={handleDeleteQuestion}
                className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            )}
          </div>
          {/* 标签 */}
          <div className="flex gap-1.5 mt-2">
            {question.tags.map((tag) => (
              <span key={tag.id} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 问题正文 */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <MarkdownRenderer content={question.body} />
      </div>

      {/* 回答区域 */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">
          {question.answers.length} 个回答
        </h2>

        {/* 回答列表 */}
        {question.answers.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无回答，来写第一个！</p>
        )}

        <div className="space-y-4">
          {question.answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              isQuestionAuthor={isAuthor}
              isAnswerAuthor={user?.id === answer.author.id}
              onAccept={() => handleAcceptAnswer(answer.id)}
              onDelete={() => handleDeleteAnswer(answer.id)}
            />
          ))}
        </div>

        {/* 回答表单 */}
        {user ? (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium mb-3">写回答</h3>
            {answerError && (
              <p className="text-red-500 text-sm mb-2">{answerError}</p>
            )}
            <MarkdownEditor
              value={answerBody}
              onChange={setAnswerBody}
              placeholder="分享你的知识和见解..."
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !answerBody.trim()}
              className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-md text-sm
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "提交中..." : "提交回答"}
            </button>
          </div>
        ) : (
          <div className="mt-6 text-center py-6 bg-gray-50 rounded-lg">
            <Link to="/login" className="text-blue-600 hover:underline">
              登录
            </Link>
            <span className="text-gray-500"> 后参与回答</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- 单个回答组件 ---- */
function AnswerItem({
  answer,
  isQuestionAuthor,
  isAnswerAuthor,
  onAccept,
  onDelete,
}: {
  answer: Answer;
  isQuestionAuthor: boolean;
  isAnswerAuthor: boolean;
  onAccept: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex gap-4 bg-white border rounded-lg p-4 ${
        answer.is_accepted ? "border-green-400 bg-green-50" : "border-gray-200"
      }`}
    >
      <VoteButtons
        targetType="answers"
        targetId={answer.id}
        initialCount={answer.vote_count}
      />
      <div className="flex-1">
        {/* 采纳标记 */}
        {answer.is_accepted && (
          <span className="inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded mb-2">
            ✓ 已采纳
          </span>
        )}
        <MarkdownRenderer content={answer.body} />
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{answer.author.username}</span>
            <span>{new Date(answer.created_at).toLocaleString("zh-CN")}</span>
          </div>
          <div className="flex gap-2">
            {isQuestionAuthor && !answer.is_accepted && (
              <button onClick={onAccept} className="text-green-600 hover:text-green-800">
                采纳
              </button>
            )}
            {isAnswerAuthor && (
              <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
