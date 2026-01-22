#ifdef GL_ES
precision mediump float;
#endif

  uniform vec2  u_resolution;
  uniform vec3  u_color;        // fill color
  uniform vec3  u_bg;           // background
  uniform float u_delta;        // soft-max temperature
  uniform float u_sigma;        // sigmoid steepness
  uniform float u_B[4];         // offsets b: n·x + b = 0
  uniform float u_np[8];
  //uniform vec2  u_N[4];         // outward normals (y-up space)

  void main() {
    // Convert to y-up pixel coords to match CPU-side edge math
    vec2 p = vec2(u_resolution.x-gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    float near = 0.0;

    float d[4];
    for (int i = 0; i < 4; ++i) {
      vec2 normal = vec2(u_np[i*2], u_np[(i*2)+1]);
      d[i] = dot(normal, p) + 123.; //u_B[i];   // signed distance to each half-space
      
      vec2 pt = vec2(211.*cos(float(i)*1.6), 211.*sin(float(i)*1.6));
      vec2 p2 = vec2(normal.x*10.,normal.y*10.);
      if (d[i]<20.0) {
        near = 1.0;
      }
    }

    // Soft maximum via LogSumExp (numerically stable)
    float m = -1e20;
    for (int i = 0; i < 4; ++i) {
      float t = u_delta * d[i];
      m = max(m, t);
    }

    float pd = 1e20;
    for (int i = 0; i < 4; ++i) {
      pd = min(pd, d[i]);
    }
    //pd += 1.0;
    pd += 250.0;
    pd /= 500.0;

    float sumExp = 0.0;
    for (int i = 0; i < 4; ++i) {
      sumExp += exp(u_delta * d[i] - m);
    }
    float phi = (m + log(sumExp)) / u_delta;   // ≈ max_i d_i

    // Smooth convex indicator: inside when max(d_i) <= 0
    float C = 1.0 / (1.0 + exp(u_sigma * phi));   // 1 inside, 0 outside (smoothly)
    //C = (p.y+250.0)/500.0;
    //C = near;
    C = pd;
    vec3 col = mix(u_bg, u_color, C);
    //vec3 col = vec3(C,0,C);
    gl_FragColor = vec4(col, 1.0);
  }