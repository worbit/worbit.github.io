// simplify.js — Ramer–Douglas–Peucker for small polylines
function simplifyPolyline(pts, eps=0.6){
  if (!pts || pts.length < 4) return pts || [];
  const out = [];
  function d2(a,b,p){
    const vx=b[0]-a[0], vy=b[1]-a[1];
    const wx=p[0]-a[0], wy=p[1]-a[1];
    const c1 = vx*wx + vy*wy;
    const c2 = vx*vx + vy*vy + 1e-12;
    let t = c1 / c2; t = Math.max(0, Math.min(1, t));
    const dx = a[0] + t*vx - p[0];
    const dy = a[1] + t*vy - p[1];
    return dx*dx + dy*dy;
  }
  function rdp(s,e){
    let maxd=0, idx=-1;
    for (let i=s+1; i<e; i++){
      const d = d2(pts[s], pts[e], pts[i]);
      if (d > maxd){ maxd = d; idx = i; }
    }
    if (Math.sqrt(maxd) > eps){
      rdp(s, idx); rdp(idx, e);
    } else {
      out.push(pts[s]);
    }
  }
  rdp(0, pts.length-1); out.push(pts[pts.length-1]);
  return out;
}
window.simplifyPolyline = simplifyPolyline;