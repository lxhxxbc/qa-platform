/*
 * 投票按钮组件
 * ------------
 * 向上箭头 = 赞成，向下箭头 = 反对。
 * 点击后调用后端 API 投票。未登录时引导到登录页。
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { vote } from "../api/answers";
import { useNavigate } from "react-router-dom";

interface Props {
  targetType: "questions" | "answers";
  targetId: number;
  initialCount: number;
}

export default function VoteButtons({ targetType, targetId, initialCount }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(initialCount);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const result = await vote(targetType, targetId, value);
      // 简单的前端投票状态管理
      if (result.message === "已取消投票") {
        setCount((c) => c - value);
        setUserVote(0);
      } else {
        if (userVote !== 0) setCount((c) => c - userVote); // 撤销旧票
        setCount((c) => c + value);
        setUserVote(value);
      }
    } catch (err) {
      console.error("投票失败:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-10">
      {/* 赞成 */}
      <button
        onClick={() => handleVote(1)}
        className={`text-lg leading-none ${
          userVote === 1 ? "text-orange-500" : "text-gray-400 hover:text-orange-400"
        }`}
        title="赞成"
      >
        ▲
      </button>
      <span className="text-sm font-bold text-gray-700">{count}</span>
      {/* 反对 */}
      <button
        onClick={() => handleVote(-1)}
        className={`text-lg leading-none ${
          userVote === -1 ? "text-orange-500" : "text-gray-400 hover:text-orange-400"
        }`}
        title="反对"
      >
        ▼
      </button>
    </div>
  );
}
