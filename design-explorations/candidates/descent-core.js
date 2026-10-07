// 勾配降下系の候補(09・10)が共有する、損失曲面・SGD の軌跡・等高線描画。d3(d3-contour)が先に読み込まれている前提。
window.Descent = (() => {
  // 損失曲面: 浅いお椀 + 3 つの谷(大域最小は右下)+ 細かい凹凸
  const f = (x, y) =>
    0.08 * (x * x + y * y) -
    1.4 * Math.exp(-((x - 1.3) ** 2 + (y + 0.9) ** 2) / 0.7) -
    0.9 * Math.exp(-((x + 1.4) ** 2 + (y - 0.9) ** 2) / 0.6) -
    0.6 * Math.exp(-((x + 0.2) ** 2 + (y + 1.9) ** 2) / 0.35) +
    0.12 * Math.sin(2.2 * x) * Math.cos(1.8 * y);
  const grad = (x, y) => {
    const h = 1e-4;
    return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
  };
  const MIN = [1.3, -0.9];

  // モメンタム付き SGD。いったん局所解(左上の谷)に寄ってから抜け出し、大域最小で止まる系列を選ぶ
  const N = 420;
  function run(seed) {
    const r = window.seeded(seed);
    const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    let x = -2.7, y = 2.5, vx = 0, vy = 0, near = false;
    const pts = [[x, y]];
    for (let t = 0; t < N; t++) {
      const [gx, gy] = grad(x, y);
      const s = 1.4 * (1 - t / N) + 0.02;
      vx = 0.85 * vx - 0.05 * (gx + s * gauss());
      vy = 0.85 * vy - 0.05 * (gy + s * gauss());
      x += vx; y += vy;
      pts.push([x, y]);
      if (t < 250 && Math.hypot(x + 1.4, y - 0.9) < 0.4) near = true;
    }
    return { pts, ok: near && Math.hypot(x - MIN[0], y - MIN[1]) < 0.35 };
  }
  let raw = run(6).pts;
  for (let s = 1; s < 300; s++) { const r = run(s); if (r.ok) { raw = r.pts; break; } }

  // 表示用に指数移動平均でならし、大域最小のすぐ近くに入ったところで打ち切って θ* まで滑らかに寄せる
  // (谷底での細かい振動まで含めると、道のりの大半が谷底に偏ってしまうため)
  const smooth = [];
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
  const STEPS = traj.length - 1;

  // 弧長。スクロール量 → 道のりの割合 → 反復回数 t、の変換に使う(見た目の進み方を一定にする)
  const arc = [0];
  for (let i = 1; i < traj.length; i++) arc.push(arc[i - 1] + Math.hypot(traj[i][0] - traj[i - 1][0], traj[i][1] - traj[i - 1][1]));
  const total = arc[arc.length - 1];
  function at(u) {
    const target = Math.min(1, Math.max(0, u)) * total;
    let lo = 0, hi = arc.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; arc[mid] < target ? (lo = mid) : (hi = mid); }
    const seg = arc[hi] - arc[lo] || 1;
    const k = (target - arc[lo]) / seg;
    const x = traj[lo][0] + k * (traj[hi][0] - traj[lo][0]);
    const y = traj[lo][1] + k * (traj[hi][1] - traj[lo][1]);
    return { t: lo + k, i: lo, x, y, loss: f(x, y) };
  }

  // 軌跡の外接矩形(地図の拡大率を決めるのに使う)
  const xs = traj.map((p) => p[0]), ys = traj.map((p) => p[1]);
  const bbox = { x0: Math.min(...xs, MIN[0]), x1: Math.max(...xs, MIN[0]), y0: Math.min(...ys, MIN[1]), y1: Math.max(...ys, MIN[1]) };

  // 等高線を描く。view = { W, H, dpr, scale, cx, cy }(cx, cy は原点の画面座標)
  function drawContours(ctx, view, rgb, opts = {}) {
    const { W, H, dpr, scale, cx, cy } = view;
    const cell = opts.cell || 4;
    // 外周の閉じ線が画面内に出ないよう、2 セルぶん外側まで計算する
    const n = Math.ceil(W / cell) + 5, m = Math.ceil(H / cell) + 5;
    const values = new Float64Array(n * m);
    for (let j = 0; j < m; j++)
      for (let i = 0; i < n; i++) values[j * n + i] = f(((i - 2) * cell - cx) / scale, (cy - (j - 2) * cell) / scale);
    const thresholds = d3.range(-1.3, 2.6, opts.step || 0.1);
    const contours = d3.contours().size([n, m]).thresholds(thresholds)(values);
    ctx.setTransform(dpr * cell, 0, 0, dpr * cell, -2 * cell * dpr, -2 * cell * dpr);
    ctx.clearRect(0, 0, W, H);
    const path = d3.geoPath(null, ctx);
    const strong = opts.strong ?? 0.5, weak = opts.weak ?? 0.22;
    contours.forEach((c, k) => {
      const depth = 1 - k / thresholds.length; // 谷ほど濃く
      ctx.beginPath();
      path(c);
      ctx.strokeStyle = `rgb(${rgb} / ${(k % 5 === 0 ? strong : weak) * (0.4 + depth)})`;
      ctx.lineWidth = (k % 5 === 0 ? 1.1 : 0.6) / cell;
      ctx.stroke();
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { f, N: STEPS, traj, total, at, bbox, MIN, drawContours };
})();
