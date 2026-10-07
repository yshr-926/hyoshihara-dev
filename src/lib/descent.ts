// トップページの「降下ログ」が使う、損失曲面とモメンタム SGD の軌跡。
// ビルド時(等高線・軌跡の SVG、各セクションの step / loss)とブラウザ(スクロール位置 → 現在地)の
// 両方から読み込む。乱数はシード固定なので、どちらで計算しても同じ軌跡になる。

/** 損失曲面: 浅いお椀 + 3 つの谷(大域最小は右下)+ 細かい凹凸 */
export const f = (x: number, y: number) =>
  0.08 * (x * x + y * y) -
  1.4 * Math.exp(-((x - 1.3) ** 2 + (y + 0.9) ** 2) / 0.7) -
  0.9 * Math.exp(-((x + 1.4) ** 2 + (y - 0.9) ** 2) / 0.6) -
  0.6 * Math.exp(-((x + 0.2) ** 2 + (y + 1.9) ** 2) / 0.35) +
  0.12 * Math.sin(2.2 * x) * Math.cos(1.8 * y);

const grad = (x: number, y: number): [number, number] => {
  const h = 1e-4;
  return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
};

/** 大域最小 θ* */
export const MIN: [number, number] = [1.3, -0.9];

/** 再現できる乱数(mulberry32) */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// モメンタム付き SGD。いったん局所解(左上の谷)に寄ってから抜け出し、大域最小で止まる系列を選ぶ
const ITER = 420;
function run(seed: number) {
  const r = seeded(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
  let x = -2.7,
    y = 2.5,
    vx = 0,
    vy = 0,
    near = false;
  const pts: [number, number][] = [[x, y]];
  for (let t = 0; t < ITER; t++) {
    const [gx, gy] = grad(x, y);
    const s = 1.4 * (1 - t / ITER) + 0.02;
    vx = 0.85 * vx - 0.05 * (gx + s * gauss());
    vy = 0.85 * vy - 0.05 * (gy + s * gauss());
    x += vx;
    y += vy;
    pts.push([x, y]);
    if (t < 250 && Math.hypot(x + 1.4, y - 0.9) < 0.4) near = true;
  }
  return { pts, ok: near && Math.hypot(x - MIN[0], y - MIN[1]) < 0.35 };
}

function pick() {
  for (let s = 1; s < 300; s++) {
    const r = run(s);
    if (r.ok) return r.pts;
  }
  return run(6).pts;
}

// 表示用に指数移動平均でならし、大域最小のすぐ近くに入ったところで打ち切って θ* まで滑らかに寄せる
// (谷底での細かい振動まで含めると、道のりの大半が谷底に偏ってしまうため)
function buildTrajectory() {
  const raw = pick();
  const smooth: [number, number][] = [];
  raw.forEach((p, i) => {
    if (!i) return smooth.push(p);
    const q = smooth[i - 1];
    smooth.push([q[0] + 0.35 * (p[0] - q[0]), q[1] + 0.35 * (p[1] - q[1])]);
  });
  let cut = smooth.findIndex((p) => Math.hypot(p[0] - MIN[0], p[1] - MIN[1]) < 0.3);
  if (cut < 0) cut = smooth.length - 1;
  const traj = smooth.slice(0, cut + 1);
  const last = traj[traj.length - 1];
  for (let k = 1; k <= 14; k++) {
    const e = 1 - (1 - k / 14) ** 3; // 減速しながら寄せる
    traj.push([last[0] + e * (MIN[0] - last[0]), last[1] + e * (MIN[1] - last[1])]);
  }
  return traj;
}

/** 表示する軌跡(θ₀ から θ* まで) */
export const traj = buildTrajectory();
/** 軌跡の反復回数(step の最大値) */
export const STEPS = traj.length - 1;
/** 各 step での損失 */
export const losses = traj.map(([x, y]) => f(x, y));

// 弧長。スクロール量 → 道のりの割合 u → 反復回数 t、の変換に使う(見た目の進み方を一定にする)
const arc = [0];
for (let i = 1; i < traj.length; i++)
  arc.push(arc[i - 1] + Math.hypot(traj[i][0] - traj[i - 1][0], traj[i][1] - traj[i - 1][1]));
const total = arc[arc.length - 1];

export interface Point {
  /** 反復回数(小数。step と step の間も補間する) */
  t: number;
  x: number;
  y: number;
  loss: number;
}

/** 道のりの割合 u(0〜1)の位置 */
export function at(u: number): Point {
  const target = Math.min(1, Math.max(0, u)) * total;
  let lo = 0,
    hi = arc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (arc[mid] < target) lo = mid;
    else hi = mid;
  }
  const k = (target - arc[lo]) / (arc[hi] - arc[lo] || 1);
  const x = traj[lo][0] + k * (traj[hi][0] - traj[lo][0]);
  const y = traj[lo][1] + k * (traj[hi][1] - traj[lo][1]);
  return { t: lo + k, x, y, loss: f(x, y) };
}

/** 軌跡と θ* を囲む矩形(地図の拡大率を決めるのに使う) */
export const bbox = (() => {
  const xs = traj.map((p) => p[0]),
    ys = traj.map((p) => p[1]);
  return {
    x0: Math.min(...xs, MIN[0]),
    x1: Math.max(...xs, MIN[0]),
    y0: Math.min(...ys, MIN[1]),
    y1: Math.max(...ys, MIN[1]),
  };
})();

/** 損失の表示範囲(0.5 刻みに丸める)。損失曲線の縦軸に使う */
export const lossRange = {
  min: Math.floor(Math.min(...losses) * 2) / 2,
  max: Math.ceil(Math.max(...losses) * 2) / 2,
};
