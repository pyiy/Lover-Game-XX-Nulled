import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getThemeById, listTasksByTheme, updateTheme, createTask, updateTask, deleteTask } from "../actions";
import GenerateTasksSection from "@/components/generate-tasks";

type Params = { params: Promise<{ id: string }> };

export default async function ThemeDetailPage({ params }: Params) {
  const { id: themeId } = await params;
  const [{ data: theme }, { data: tasks }] = await Promise.all([
    getThemeById(themeId),
    listTasksByTheme(themeId),
  ]);

  if (!theme) {
    return (
      <div className="max-w-md mx-auto min-h-svh flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">主题不存在</h3>
          <p className="text-gray-400 mb-4">请返回主题列表重试</p>
          <Button asChild className="gradient-primary glow-pink">
            <Link href="/themes">返回主题列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-svh flex flex-col pb-24 px-6">
      <div className="glass px-6 pt-4 pb-6 rounded-b-3xl -mx-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/themes" className="text-white/80 hover:text-white flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h2 className="text-xl font-bold">主题管理</h2>
          <div className="w-16" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-bold mb-4">主题信息</h3>
          <form action={updateTheme} className="space-y-4">
            <input type="hidden" name="id" value={theme.id} />
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">主题标题</Label>
              <Input
                id="title"
                name="title"
                defaultValue={theme.title}
                required
                className="bg-white/10 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">主题描述</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:border-brand-pink transition-all"
                defaultValue={theme.description ?? ""}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="gradient-primary glow-pink">
                保存修改
              </Button>
            </div>
          </form>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-bold mb-4">添加任务</h3>
          <form action={createTask} className="space-y-4">
            <input type="hidden" name="theme_id" value={theme.id} />
            <input type="hidden" name="type" value="interaction" />
            <input type="hidden" name="order_index" value="0" />
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">任务内容</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:border-brand-pink transition-all"
                placeholder="例如：一起完成 10 分钟冥想并分享感受"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <GenerateTasksSection inline themeId={theme.id} themeTitle={theme.title} themeDescription={theme.description} />
              <Button type="submit" className="gradient-primary glow-pink flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </Button>
            </div>
          </form>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">任务列表</h3>
            <span className="text-sm text-gray-400">{tasks.length} 个任务</span>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无任务，先添加一个吧</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4" key={task.id}>
                  <form action={updateTask} className="space-y-3">
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="type" value={task.type} />
                    <input type="hidden" name="order_index" value={task.order_index ?? 0} />
                    <input type="hidden" name="theme_id" value={theme.id} />
                    <div className="space-y-2">
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full min-h-16 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:border-brand-pink transition-all"
                        defaultValue={task.description}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        formAction={deleteTask}
                        variant="ghost"
                        size="icon"
                        aria-label="删除任务"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button type="submit" variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                        保存
                      </Button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 生成任务卡片已移除，改为在“添加任务”区域内的内嵌按钮 */}
      </div>
    </div>
  );
}
