import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createTheme } from "../actions";
import { ArrowLeft } from "lucide-react";

export default function NewThemePage() {
  return (
    <div className="max-w-md mx-auto min-h-svh flex flex-col p-6 pb-24">
      <div className="flex items-center justify-between mb-6 pt-4">
        <Link href="/themes" className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold">创建新主题</h2>
        <div className="w-10" />
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-gray-400 mb-6">创建一个新的任务主题，可以包含多个相关任务</p>

        <form action={createTheme} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm text-gray-300 mb-2">
              主题标题 *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="如：甜蜜约会、运动打卡"
              required
              className="glass border-white/10 bg-white/5 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm text-gray-300 mb-2">
              主题描述
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full glass rounded-xl border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-pink transition-colors"
              placeholder="简单描述该主题的使用场景和包含的任务类型"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              asChild
              className="flex-1 glass py-3 rounded-xl font-medium hover:bg-white/10 transition-all"
            >
              <Link href="/themes">取消</Link>
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary py-3 rounded-xl font-semibold glow-pink text-white"
            >
              创建主题
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6 glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-pink mr-2"></span>
          提示
        </h3>
        <ul className="text-xs text-gray-400 space-y-1.5 ml-3.5">
          <li>• 创建主题后可以在主题详情页添加任务</li>
          <li>• 每个主题可以包含多个相关任务</li>
          <li>• 游戏中会根据选择的主题随机抽取任务</li>
        </ul>
      </div>
    </div>
  );
}
