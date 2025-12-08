export function shortIdFrom(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const mod = 36 ** 3; // 46656
  return (h % mod).toString(36).toUpperCase().padStart(3, "0");
}

export function generateNickname(userId: string) {
  const adjectives = [
    "甜心",
    "星河",
    "温柔",
    "可乐",
    "糖果",
    "清风",
    "热恋",
    "月光",
    "微醺",
  ];
  const nouns = [
    "棋手",
    "旅人",
    "飞行员",
    "星客",
    "恋人",
    "猫猫",
    "熊熊",
    "骰手",
    "同盟",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const base = adj + noun;
  const suffix = shortIdFrom(userId);
  return `${base}-${suffix}`;
}