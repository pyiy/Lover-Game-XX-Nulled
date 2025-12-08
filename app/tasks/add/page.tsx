import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AddTaskPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>添加任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">所属主题</Label>
                <Input id="theme" placeholder="选择或输入主题名称" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">任务标题</Label>
                <Input id="title" placeholder="例如：一起散步 30 分钟" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">任务描述</Label>
                <Input id="desc" placeholder="简要描述任务要求" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full">保存任务</Button>
                <Button className="w-full" variant="outline">AI 生成候选</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}