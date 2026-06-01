/*
 * 分页器组件
 * ----------
 * 展示页码按钮，支持上一页/下一页/跳转到指定页。
 * 当前页高亮显示，无更多页时按钮禁用。
 */
interface Props {
  page: number;         // 当前页码（从 1 开始）
  totalPages: number;   // 总页数
  onPageChange: (page: number) => void; // 页码变化时的回调
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  // 只有1页时不显示分页器
  if (totalPages <= 1) return null;

  // 生成可见的页码列表
  // window: 当前页前后各显示2页，超出部分用省略号
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded border border-gray-300
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>

      {/* 页码按钮 */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded border border-gray-300
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  );
}
