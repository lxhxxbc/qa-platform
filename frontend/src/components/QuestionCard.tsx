/*
 * 问题卡片组件
 * ------------
 * 在问题列表中展示每个问题的摘要信息。
 * 包含：标题（链接）、正文预览、标签、作者、投票数、回答数、浏览数、时间
 */
import { Link } from "react-router-dom";
import type { QuestionBrief } from "../types";

interface Props {
  question: QuestionBrief;
}

export default function QuestionCard({ question }: Props) {
  // 格式化日期 — 显示相对时间或绝对时间
  const timeAgo = formatTimeAgo(question.created_at);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* 标题 — 点击进入详情页 */}
      <Link
        to={`/questions/${question.id}`}
        className="text-lg font-semibold text-blue-700 hover:text-blue-900 line-clamp-1"
      >
        {question.title}
      </Link>

      {/* 正文预览 — 最多2行 */}
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {question.body_preview}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {question.tags.map((tag) => (
          <span
            key={tag.id}
            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* 底部信息：统计数据 + 作者 + 时间 */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>{question.vote_count} 票</span>
          <span>{question.answer_count} 回答</span>
          <span>{question.view_count} 浏览</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{question.author.username}</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

/** 简单的相对时间显示 */
function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}
