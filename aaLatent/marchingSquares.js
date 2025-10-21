// marchingSquares.js
// Minimal marching squares (single region, iso=0.5). data: row-major [W*H].

function interp(x1,y1, v1, x2,y2, v2, iso){
  const t = (iso - v1) / (v2 - v1 + 1e-12);
  return [x1 + t*(x2-x1), y1 + t*(y2-y1)];
}

function marchingSquares(data, W, H, iso=0.5){
  const edges = []; // segments [[x,y],[x,y]]
  for (let j=0; j<H-1; j++){
    for (let i=0; i<W-1; i++){
      const idx = j*W + i;
      const v00 = data[idx];
      const v10 = data[idx+1];
      const v01 = data[idx+W];
      const v11 = data[idx+W+1];

      // Build case index
      let c = 0;
      if (v00 > iso) c |= 1;
      if (v10 > iso) c |= 2;
      if (v11 > iso) c |= 4;
      if (v01 > iso) c |= 8;

      if (c === 0 || c === 15) continue;

      const x = i, y = j;
      // midpoints on cell edges
      const pL = interp(x, y, v00, x, y+1, v01, iso);
      const pR = interp(x+1, y, v10, x+1, y+1, v11, iso);
      const pT = interp(x, y, v00, x+1, y, v10, iso);
      const pB = interp(x, y+1, v01, x+1, y+1, v11, iso);

      // Resolve cases (no ambiguous tie-breaking for our smooth field)
      switch (c) {
        case 1: case 14: edges.push([pL, pT]); break;
        case 2: case 13: edges.push([pT, pR]); break;
        case 3: case 12: edges.push([pL, pR]); break;
        case 4: case 11: edges.push([pR, pB]); break;
        case 5:           edges.push([pL, pT]); edges.push([pR, pB]); break;
        case 6: case 9:  edges.push([pT, pB]); break;
        case 7: case 8:  edges.push([pL, pB]); break;
        case 10:         edges.push([pT, pR]); edges.push([pL, pB]); break;
      }
    }
  }

  // Link segments into a single loop by nearest neighbor
  if (edges.length === 0) return [];
  const loop = [edges[0][0], edges[0][1]];
  edges.splice(0,1);

  function near(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]) < 1e-3; }

  while (edges.length){
    const end = loop[loop.length-1];
    let found = false;
    for (let k=0; k<edges.length; k++){
      const [p,q] = edges[k];
      if (near(end, p)) { loop.push(q); edges.splice(k,1); found = true; break; }
      if (near(end, q)) { loop.push(p); edges.splice(k,1); found = true; break; }
    }
    if (!found) break; // should not happen with single region
  }
  return loop;
}

window.marchingSquares = marchingSquares;