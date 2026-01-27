#ifdef GL_ES
precision mediump float;
#endif


  uniform vec2  u_resolution;
  uniform vec3  u_color;        // fill color
  uniform vec3  u_bg;           // background
  uniform float u_delta;        // soft-max temperature
  uniform float u_sigma;        // sigmoid steepness
  uniform float u_B[6];         // offsets b: n·x + b = 0
  uniform float u_np[6*2];
  //uniform vec2  u_N[4];         // outward normals (y-up space)
  uniform int numpts;

  #define MAX_VERTS 6

  void main() {
    // Convert to y-up pixel coords to match CPU-side edge math
    vec2 p = vec2(-(u_resolution.x-gl_FragCoord.x), (u_resolution.y - gl_FragCoord.y));

    float d[6];
    for (int i = 0; i < MAX_VERTS; ++i) {
      if (i>=numpts) { break; }
      vec2 normal = vec2(u_np[i*2], u_np[(i*2)+1]);
      d[i] = dot(normal, p) - u_B[i]*2.;   // signed distance to each half-space, but wrong! with +B would be correct...
    }

    // Soft maximum via LogSumExp (numerically stable)
    float m = -1e20;
    for (int i = 0; i < MAX_VERTS; ++i) {
      if (i>=numpts) { break; }
      float t = u_delta * d[i];
      m = max(m, t);
    }

    float pd = 1e20;
    for (int i = 0; i < MAX_VERTS; ++i) {
      if (i>=numpts) { break; }
      pd = min(pd, d[i]);
    }

    float sumExp = 0.0;
    for (int i = 0; i < MAX_VERTS; ++i) {
      if (i>=numpts) { break; }
      sumExp += exp(u_delta * d[i] - m);
    }
    float phi = (m + log(sumExp)) / u_delta;   // ≈ max_i d_i

    // Smooth convex indicator: inside when max(d_i) <= 0
    float C = 1.0 / (1.0 + exp(u_sigma * phi));   // 1 inside, 0 outside (smoothly)
    //C = (sin(pd/5.0)+1.0)/2.0;
    vec3 col = mix(u_bg, u_color, C);
    gl_FragColor = vec4(col, 1.0);
  }