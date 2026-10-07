// 損失曲面の等高線を、ビルド時に SVG のパス文字列にする(ブラウザに d3 を送らないため)。
// 座標は損失曲面の座標そのまま(SVG は y が下向きなので y だけ符号を反転する)。
import { contours } from 'd3-contour';
import { f } from './descent';

/** 等高線を計算する範囲。軌跡を画面の右寄せにしても、スマホの縦長の画面でも外周が見えない広さにとる */
export const EXTENT = { x0: -12, x1: 8, y0: -8, y1: 9 };
const CELL = 0.06;
/** 折れ線の間引きの許容誤差(曲面の座標で。PC の表示で約 1px) */
const TOLERANCE = 0.008;
const STEP = 0.1;

export interface ContourLevel {
  d: string;
  /** 5 本ごとの主曲線 */
  major: boolean;
  /** 0(高い)〜 1(谷底)。谷ほど濃く描くのに使う */
  depth: number;
}

export function buildContours(): ContourLevel[] {
  const n = Math.round((EXTENT.x1 - EXTENT.x0) / CELL) + 1;
  const m = Math.round((EXTENT.y1 - EXTENT.y0) / CELL) + 1;
  const values = new Array<number>(n * m);
  // 行 j = 0 が上端(y1)。SVG の y と同じ向きにする
  for (let j = 0; j < m; j++)
    for (let i = 0; i < n; i++) values[j * n + i] = f(EXTENT.x0 + i * CELL, EXTENT.y1 - j * CELL);

  const thresholds: number[] = [];
  for (let v = -1.3; v < 4.2; v += STEP) thresholds.push(Math.round(v * 10) / 10);

  const fmt = (v: number) => (Math.round(v * 100) / 100).toString().replace(/^(-?)0\./, '$1.');
  return contours()
    .size([n, m])
    .thresholds(thresholds)(values)
    .map((geometry, k) => {
      let d = '';
      // 始点だけ絶対座標、あとは相対座標(l)で書いて文字数を減らす
      const polyline = (pts: [number, number][], close: boolean) => {
        if (pts.length < 2) return '';
        let [px, py] = pts[0];
        let out = `M${fmt(px)} ${fmt(py)}`;
        for (let i = 1; i < pts.length; i++) {
          const [x, y] = pts[i];
          out += `l${fmt(x - px)} ${fmt(y - py)}`;
          px = x;
          py = y;
        }
        return close ? `${out}z` : out;
      };
      for (const polygon of geometry.coordinates)
        for (const ring of polygon) {
          // 計算範囲の外周に沿う辺は描かない(等高線ではなく、領域を閉じるための辺なので)。
          // 外周上の点で輪を切り、内側を通る区間だけを折れ線として出す
          const onEdge = ([gx, gy]: number[]) => gx <= 0 || gy <= 0 || gx >= n || gy >= m;
          let start = ring.findIndex(onEdge);
          if (start < 0) start = 0;
          const loop = start ? [...ring.slice(start), ...ring.slice(1, start + 1)] : ring;
          const closed = !ring.some(onEdge);
          let run: [number, number][] = [];
          const flush = () => {
            if (run.length >= 2)
              d += polyline(closed ? simplify(run, TOLERANCE) : rdp(run, TOLERANCE), closed);
            run = [];
          };
          loop.forEach(([gx, gy], i) => {
            const edge = onEdge([gx, gy]);
            // グリッド座標(セルの中心が整数)→ 曲面の座標(SVG の y は -y)
            const pt: [number, number] = [
              EXTENT.x0 + (gx - 0.5) * CELL,
              -(EXTENT.y1 - (gy - 0.5) * CELL),
            ];
            if (edge) {
              // 外周の点は区間の端としてだけ使う(外周どうしを結ぶ辺は描かない)
              if (run.length) {
                run.push(pt);
                flush();
              }
              const next = loop[i + 1];
              if (next && !onEdge(next)) run = [pt];
            } else run.push(pt);
          });
          flush();
        }
      return { d, major: k % 5 === 0, depth: 1 - k / thresholds.length };
    })
    .filter((level) => level.d);
}

/** 閉じた輪を間引く。始点と終点が同じ点なので、始点から最も遠い点で 2 本に分けてから RDP にかける */
function simplify(ring: [number, number][], eps: number): [number, number][] {
  if (ring.length < 4) return ring;
  const [sx, sy] = ring[0];
  let far = 1;
  ring.forEach(([x, y], i) => {
    if (Math.hypot(x - sx, y - sy) > Math.hypot(ring[far][0] - sx, ring[far][1] - sy)) far = i;
  });
  return [...rdp(ring.slice(0, far + 1), eps).slice(0, -1), ...rdp(ring.slice(far), eps)];
}

/** Ramer–Douglas–Peucker(端点は残す) */
function rdp(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = pts[a],
      [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay);
    let worst = -1,
      dist = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = pts[i];
      const e = len
        ? Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / len
        : Math.hypot(x - ax, y - ay);
      if (e > dist) {
        dist = e;
        worst = i;
      }
    }
    if (worst >= 0 && dist > eps) {
      keep[worst] = 1;
      stack.push([a, worst], [worst, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}
