const BRUSH_MAX = 10;
const TEXT_SIZE = 12;
const CANVAS_SCALE = 0.8;

const DRAW_SELECTION = [{
  label: 'Paint Points',
  draw(sketch) {
    if (sketch.mouseIsPressed) {
      doPaintPoints(sketch, sketch.mouseX, sketch.mouseY);
    }
  }
}, {
  label: 'Select Points',
  draw(sketch) {
    if (sketch.mouseIsPressed) {
      doSelectPoints(sketch, sketch.mouseX, sketch.mouseY);
    }
  }
}];

var canvas;
var sketch;
var quadTree;
var w;
var h;
var treeCapacity;
var drawSwitch;
var curDraw;
var brush;
var p5;

onload = () => {
  initP5();
  brush = 1;
  curDraw = DRAW_SELECTION[0];
  document.getElementById('clear').addEventListener('click', () => {
    quadTree.clear();
  });
  const content = document.getElementById('dropdown-content');
  const dropdownButton = document.getElementById('dropbtn');
  dropdownButton.textContent = curDraw.label;
  for (let i = 0; i < DRAW_SELECTION.length; i++) {
    let a = document.createElement('a');
    a.onclick = () => {
      curDraw = DRAW_SELECTION[i];
      dropdownButton.textContent = curDraw.label;
      content.classList.toggle('show');
    };
    a.href = '#';
    a.textContent = DRAW_SELECTION[i].label;
    a.classList = ['dropdown-content-a'];
    content.appendChild(a);
  }
  dropdownButton.addEventListener('click', () => content.classList.toggle('show'));

  const b = document.getElementById('brush');
  b.value = brush;
  b.oninput = () => {
    brush = parseInt(b.value);
  }
  const t = document.getElementById('tree-capacity');
  const tv = document.getElementById('tree-capacity-value');
  t.value = treeCapacity;
  tv.innerText = 'Capacity: ' + treeCapacity;
  t.oninput = () => {
    treeCapacity = parseInt(t.value);
    tv.innerText = 'Capacity: ' + treeCapacity;
    quadTree.clear()
    quadTree = new QuadTree(new Quadrant(w, h, h, w), treeCapacity);
  }
}

function initP5() {
  p5 = new p5(
    (sketch) => {
      sketch.touchStarted = (e) => {
        return e.target.id !== canvas.canvas.id;
      };
      sketch.touchMoved = (e) => {
        return e.target.id !== canvas.canvas.id;
      };
      sketch.setup = () => {
        treeCapacity = 4;
        h = ((window.innerHeight > 0) ? window.innerHeight : screen.height) * CANVAS_SCALE;
        w = ((window.innerWidth > 0) ? window.innerWidth : screen.width) * CANVAS_SCALE;

        canvas = sketch.createCanvas(w, h);
        quadTree = new QuadTree(new Quadrant(w, h, h, w), treeCapacity);
      };
      sketch.draw = () => {
        let visitor = new Visitor(sketch)
        sketch.background(0);
        quadTree.accept(visitor);
        sketch.strokeWeight(1);
        sketch.fill(0, 0, 255);
        sketch.stroke(0, 0, 255);
        sketch.textSize(TEXT_SIZE);
        sketch.text(`Total sub-trees: ${visitor.subTrees}`, w * 0.005, h * 0.03);
        sketch.text(`Total points: ${quadTree.size()}`, w * 0.005, h * 0.07);
        curDraw.draw(sketch);
      };
    },
    'sketch-holder');
}

function doPaintPoints(sketch, x, y) {
  if (x <= w && y <= h) {
    for (let i = 0; i < brush; ++i) {
      quadTree.insert(new Point(Math.fround(x + sketch.random(-brush, brush)), Math.fround(y + sketch.random(-brush, brush))))
    }
  }
}

function doSelectPoints(sketch, x, y) {
  sketch.stroke(0, 255, 0);
  sketch.noFill();
  sketch.rectMode(sketch.CENTER);
  const selection = new Quadrant(x, y, h / (BRUSH_MAX + 2 - brush), w / (BRUSH_MAX + 2 - brush));
  const cq = new CountingQuery();
  const result = cq.query(quadTree, selection);
  sketch.rect(selection.x, selection.y, selection.w * 2, selection.h * 2);
  sketch.stroke(255, 0, 0);
  for (let p of result.resList) {
    sketch.strokeWeight(3);
    sketch.point(p.x, p.y);
  }
  sketch.strokeWeight(1);
  sketch.textSize(TEXT_SIZE);
  sketch.fill(255, 0, 0);
  let c = result.resList.length;
  let s = result.steps;
  sketch.text(`Found ${c} points in ${s} steps`, x - selection.w, y - selection.h);
}

class Visitor {
  constructor(sketch) {
    this.sketch = sketch;
    this.subTrees = -1; // skip root
  }
  visit(qt) {
    this.subTrees++;
    this.sketch.stroke(255);
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    this.sketch.rectMode(this.sketch.CENTER);
    this.sketch.rect(qt.quadrant.x, qt.quadrant.y, qt.quadrant.w * 2, qt.quadrant.h * 2);
    if (qt.divided) {
      qt.upLeft.accept(this);
      qt.upRight.accept(this);
      qt.downLeft.accept(this);
      qt.downRight.accept(this);
    }

    for (let p of qt.points) {
      this.sketch.strokeWeight(3);
      this.sketch.point(p.x, p.y);
    }
  }
}
class CountingQuery {

  query(qt, quadrant, result) {
    if (!result) {
      result = {
        resList: [],
        steps: 0
      };
    }
    if (qt.quadrant.intersetcs(quadrant)) {
      for (let p of qt.points) {
        if (quadrant.contains(p)) {
          result.resList.push(p);
          result.steps++;
        }
      }
      if (qt.divided) {
        result.steps += 4;
        this.query(qt.upLeft, quadrant, result);
        this.query(qt.upRight, quadrant, result);
        this.query(qt.downLeft, quadrant, result);
        this.query(qt.downRight, quadrant, result);
      }
    }
    return result;
  }
}