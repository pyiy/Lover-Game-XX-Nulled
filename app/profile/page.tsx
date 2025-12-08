import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile";
import PreferencesSection from "@/components/profile/preferences-section";
import CopyAccountButton from "@/components/profile/copy-account-button";
import NicknameEditor from "@/components/profile/nickname-editor";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  let userId: string | null = null;
  let email: string | null = null;
  let initialGender: "male" | "female" | "non_binary" | null = null;
  let initialKinks: string[] = [];

  if (user) {
    await ensureProfile();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nickname, preferences")
      .eq("id", user.id)
      .maybeSingle();

    nickname = profile?.nickname ?? null;
    userId = user.id;
    email = user.email ?? null;

    const pref = (profile?.preferences ?? {}) as { gender?: "male" | "female" | "non_binary"; kinks?: string[] };
    initialGender = pref?.gender ?? null;
    initialKinks = Array.isArray(pref?.kinks) ? pref!.kinks! : [];
  }

  return (
    <>
      <div className="max-w-md mx-auto min-h-svh flex flex-col pb-24">
        {/* 顶部标题区域 - 简约风格 */}
        <div className="px-6 pt-8 pb-6">
          <h2 className="text-3xl font-bold text-white mb-6">我的</h2>
          
          {/* 个人信息卡片 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-3">
                <NicknameEditor initialNickname={nickname} />
              </div>
              <CopyAccountButton email={email} userId={userId} />
            </div>
            {email && (
              <div className="text-xs text-white/40 font-mono truncate">
                {email}
              </div>
            )}
          </div>
        </div>

        {/* 菜单与偏好设置 - 统一简洁的卡片风格 */}
        <div className="px-6 space-y-3">
          {/* 游戏记录 */}
          <a 
            href="/profile/history" 
            className="w-full flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-white">游戏记录</span>
            </div>
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* 偏好设置折叠区 */}
          <PreferencesSection initialGender={initialGender} initialKinks={initialKinks} />

          {/* 帮助中心 */}
          <a 
            href="/help" 
            className="w-full flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">帮助中心</div>
                <div className="text-xs text-white/50">常见问题</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* 退出登录 */}
          <div className="w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex items-center justify-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
}