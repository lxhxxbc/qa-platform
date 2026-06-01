/*
 * Markdown 渲染器
 * ----------------
 * 将 Markdown 文本渲染为带样式的 HTML。
 * 使用 react-markdown 库解析 Markdown，rehype-highlight 为代码块添加语法高亮。
 *
 * 这个组件被用在问题详情和回答列表中，展示用户编写的 Markdown 内容。
 */
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface Props {
  content: string; // Markdown 文本内容
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    /*
     * prose 是 Tailwind 的排版插件类，自动设置合适的字体大小、行高、间距等
     * max-w-none 取消 prose 默认的最大宽度限制
     */
    <div className="prose prose-sm max-w-none">
      {/*
       * ReactMarkdown: 核心渲染组件
       * remarkPlugins: Remark 插件（解析阶段），GFM 支持表格/删除线等
       * rehypePlugins: Rehype 插件（HTML 转换阶段），Highlight 为代码块加语法高亮
       */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
