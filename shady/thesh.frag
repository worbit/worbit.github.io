precision mediump float;

varying vec2 pos;

void main() {
    vec3 circle = vec3(0.5, 0.5, 0.3);
    float d = length(pos - circle.xy) - circle.z;
    gl_FragColor = vec4(d,d,d,1);
}