import { frameLoop, radToDeg, randomColor } from 'simulationjs';
import { randInt } from 'simulationjs';
import { Simulation, Color, Vector, Circle, Line } from 'simulationjs';

const canvas = new Simulation('canvas');
const bgColor = new Color(0, 0, 0);
canvas.setBgColor(bgColor);
canvas.fitElement();

class Flame extends Circle {
  rotation: number;
  color: Color;
  speed: number;
  lifetime = 3; // s
  constructor(pos: Vector, rotation: number) {
    const maxRadius = 30;
    const minRadius = 15;
    super(pos, randInt(maxRadius, minRadius));
    this.rotation = this.offsetRotation(rotation);
    this.color = this.generateColor();
    this.speed = this.generateSpeed();
    this.fill(bgColor.clone(), this.lifetime);
    this.setRadius(0, this.lifetime);
  }
  generateSpeed() {
    const maxSpeed = 10;
    const minSpeed = 4;
    return Math.random() * (maxSpeed - minSpeed) + minSpeed;
  }
  generateColor() {
    const max = 255;
    const one = Math.max(randInt(max), 120);
    const two = one / randInt(3.5, 2);
    const three = one / randInt(5.5, 4);
    return new Color(one, two, three);
  }
  offsetRotation(rotation: number) {
    const max = 40;
    const amount = randInt(max / 2, -max / 2);
    return rotation + amount;
  }
  step() {
    const vec = new Vector(1, 0).rotate(this.rotation).multiply(this.speed);
    this.move(vec);
  }
}

const start = new Vector((canvas.width / 2) * canvas.ratio, (canvas.height / 2) * canvas.ratio);
const centerPoint = new Circle(start, 10 * canvas.ratio, new Color(200, 200, 200));
canvas.add(centerPoint);

const line = new Line(start, new Vector(0, 0), new Color(200, 200, 200), canvas.ratio + 1);
canvas.add(line);

let shooting = false;
const flames: Flame[] = [];
let mousePos = new Vector(0, 0);

canvas.on('mousemove', (e: MouseEvent) => {
  const p = new Vector(e.offsetX * canvas.ratio, e.offsetY * canvas.ratio);
  mousePos = p;
  line.setEnd(mousePos);
});

canvas.on('mousedown', () => {
  shooting = true;
});

canvas.on('mouseup', () => {
  shooting = false;
});

let pressingW = false;
let pressingA = false;
let pressingS = false;
let pressingD = false;

const keydownEvents = {
  w: () => (pressingW = true),
  a: () => (pressingA = true),
  s: () => (pressingS = true),
  d: () => (pressingD = true)
};

const keyupEvents = {
  w: () => (pressingW = false),
  a: () => (pressingA = false),
  s: () => (pressingS = false),
  d: () => (pressingD = false)
};

addEventListener('keydown', (e: KeyboardEvent) => {
  const f = keydownEvents[e.key.toLowerCase() as keyof typeof keydownEvents];
  f && f();
});

addEventListener('keyup', (e: KeyboardEvent) => {
  const f = keyupEvents[e.key.toLowerCase() as keyof typeof keyupEvents];
  f && f();
});

const speed = 2;
frameLoop(() => {
  const numOfFlames = 3;
  if (shooting) for (let i = 0; i < numOfFlames; i++) flames.push(generateFlame(start, mousePos));

  for (let i = 0; i < flames.length; i++) {
    if (flameOutOfBounds(flames[i])) {
      flames.splice(i, 1);
      i--;
      continue;
    }

    flames[i].step();
    if (!canvas.ctx) return;
    flames[i].draw(canvas.ctx);
  }

  if (pressingW) {
    start.y -= speed;
  }
  if (pressingA) {
    start.x -= speed;
  }
  if (pressingS) {
    start.y += speed;
  }
  if (pressingD) {
    start.x += speed;
  }
})();

function flameOutOfBounds(flame: Flame) {
  return (
    flame.pos.x - flame.radius < 0 ||
    flame.pos.y - flame.radius < 0 ||
    flame.pos.x + flame.radius > canvas.width * canvas.ratio ||
    flame.pos.y + flame.radius > canvas.height * canvas.ratio
  );
}

function generateFlame(start: Vector, to: Vector) {
  const rotation = radToDeg(Math.atan2(to.x - start.x, start.y - to.y)) - 90;
  return new Flame(start.clone(), rotation);
}
