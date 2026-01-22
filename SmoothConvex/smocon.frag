precision mediump float;

  uniform vec2  u_resolution;
  uniform vec3  u_color;        // fill color
  uniform vec3  u_bg;           // background
  uniform float u_delta;        // soft-max temperature
  uniform float u_sigma;        // sigmoid steepness
  uniform vec2  u_N[5];         // outward normals (y-up space)
  uniform float u_B[5];         // offsets b: n·x + b = 0

  void main() {
    // Convert to y-up pixel coords to match CPU-side edge math
    vec2 p = vec2(u_resolution.x - gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    float near = 0.0;


    float d[5];
    for (int i = 0; i < 5; ++i) {
      d[i] = dot(u_N[i], p) + u_B[i];   // signed distance to each half-space
        if (length(p-u_N[i]*u_B[i])<50.0) {
            near = 1.0;
        }
    }

    // Soft maximum via LogSumExp (numerically stable)
    float m = -1e20;
    for (int i = 0; i < 5; ++i) {
      float t = u_delta * d[i];
      m = max(m, t);
    }

    float pd = 1e20;
    for (int i = 0; i < 5; ++i) {
      pd = min(pd, d[i]);
    }
    //pd += 1.0;
    pd += 500.0;
    pd /= 500.0;

    float sumExp = 0.0;
    for (int i = 0; i < 5; ++i) {
      sumExp += exp(u_delta * d[i] - m);
    }
    float phi = (m + log(sumExp)) / u_delta;   // ≈ max_i d_i

    // Smooth convex indicator: inside when max(d_i) <= 0
    float C = 1.0 / (1.0 + exp(u_sigma * phi));   // 1 inside, 0 outside (smoothly)
    //C = (p.y+250.0)/500.0;
    C = near;
    vec3 col = mix(u_bg, u_color, C);
    //vec3 col = vec3(C,C,C);
    gl_FragColor = vec4(col, 1.0);
  }

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}