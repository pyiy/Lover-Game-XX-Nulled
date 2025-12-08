import Link from "next/link";
import { Button } from "@/components/ui/button";
import GameView from "@/components/game-view";
import { createClient } from "@/lib/supabase/server";
import { getActiveSession } from "./actions";

export default async function GamePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;
  const { session } = await getActiveSession();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {session && userId ? (
        <GameView session={session as any} userId={userId} />
      ) : (
        <div className="w-full max-w-md grid gap-4 text-center">
          <h2 className="text-xl font-bold">暂无进行中的游戏</h2>
          <p className="text-sm text-foreground/70">请在大厅创建或加入房间并开始游戏。</p>
          <div>
            <Button asChild variant="outline">
              <Link href="/lobby">返回大厅</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}