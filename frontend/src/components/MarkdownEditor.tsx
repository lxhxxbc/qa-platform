/*
 * Markdown 编辑器
 * ---------------
 * 文本输入框 + 实时预览的组合。
 * 用户在左侧输入 Markdown，右侧实时显示渲染结果。
 *
 * 布局：左右分栏（桌面端上下分两栏，移动端堆叠）
 */
import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  value: string;                    // 当前文本内容（受控组件模式）
  onChange: (value: string) => void; // 内容变化时的回调
  placeholder?: string;             // 输入框占位文字
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "输入 Markdown 内容...",
}: Props) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      {/* Tab 切换栏：编辑 / 预览 */}
      <div className="flex gap-2 mb-2 border-b border-gray-200">
        <button
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
            !showPreview
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          编辑
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
            showPreview
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          预览
        </button>
      </div>

      {/* 编辑模式 */}
      {!showPreview && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     font-mono resize-y"
        />
      )}

      {/* 预览模式 */}
      {showPreview && (
        <div className="border border-gray-300 rounded-md px-4 py-3 min-h-[200px] bg-white">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-gray-400 text-sm">暂无内容</p>
          )}
        </div>
      )}

      {/* Markdown 语法提示 */}
      <div className="mt-1 text-xs text-gray-400">
        支持 Markdown 语法 | **加粗** | *斜体* | `代码` | ```代码块``` | [链接](url)
      </div>
    </div>
  );
}
