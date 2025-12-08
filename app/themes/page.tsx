import Link from "next/link";
import { listMyThemes } from "./actions";
import { Plus, Layers } from "lucide-react";

export default async function ThemesPage() {
  const { data: themes } = await listMyThemes();

  return (
    <>
      <div className="max-w-md mx-auto min-h-svh flex flex-col pb-24">
        {/* 顶部标题区域 - 简约风格 */}
        <div className="px-6 pt-8 pb-6">
          <h2 className="text-3xl font-bold text-white mb-6">主题库</h2>
          
          {/* 创建主题按钮 */}
          <Link
            href="/themes/new"
            className="flex items-center justify-center space-x-2 w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] no-underline mb-6"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">创建新主题</span>
          </Link>

          {/* 主题列表 */}
          <div className="space-y-3">
            {themes.length === 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/70 font-medium mb-1">暂无主题</p>
                <p className="text-sm text-white/40">点击上方按钮创建你的第一个主题</p>
              </div>
            )}

            {themes.map((t) => (
              <Link 
                key={t.id} 
                href={`/themes/${t.id}`} 
                className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-200 active:scale-[0.98] no-underline"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-white mb-1 truncate">{t.title}</h4>
                    <p className="text-sm text-white/50">{t.task_count ?? 0} 个任务</p>
                  </div>
                  <svg className="w-5 h-5 text-white/40 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {t.description && (
                  <p className="text-sm text-white/40 line-clamp-2 mt-2">
                    {t.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
