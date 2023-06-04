var canvas;
var tree;
var offsetX;
var offsetY;
var treeSize;

function setup() {
  let s = 0.7;
  let h = ((window.innerHeight > 0) ? window.innerHeight : screen.height) * s;
  let w = ((window.innerWidth > 0) ? window.innerWidth : screen.width) * s;
  treeSize = Math.min(w, h);
  canvas = createCanvas(treeSize, treeSize);
  canvas.parent = 'sketch-holder';
  centerCanvas();
  tree = new QuadTree(new Quadrant(treeSize, treeSize, treeSize, treeSize), 4);
  for (let i = 0; i < 2000; ++i) {
    tree.insert(new Point(random(treeSize), random(treeSize)))
  }
}

function draw() {
  // if (mouseIsPressed) {
  //   for (let i = 0; i < 2; ++i) {
  //     tree.insert(new Point(mouseX + random(-5, +5), mouseY + random(-5, +5)))
  //   }
  // }
  let visitor = new DrawingVisitor()
  background(0);
  tree.accept(visitor);
  strokeWeight(1);
  if (mouseIsPressed) {
    stroke(0, 255, 0);
    noFill();
    rectMode(CENTER);
    const selectionSize = treeSize / 7;
    const selection = new Quadrant(mouseX, mouseY, selectionSize, selectionSize);
    const cq = new CountingQuery();
    const result = cq.querySteps(tree, selection);
    rect(selection.x, selection.y, selection.h * 2, selection.w * 2);
    for (let p of result.resList) {
      strokeWeight(1);
      text(`Points found in ${result.steps} steps`, mouseX - selectionSize, mouseY - selectionSize);
      fill(0, 255, 0);
      strokeWeight(3);
      point(p.x, p.y);
    }
  }
}

function centerCanvas() {
  offsetX = (windowWidth - treeSize) / 2;
  offsetY = (windowHeight - treeSize) / 2;
  canvas.position(offsetX, offsetY);
}

function windowResized() {
  centerCanvas();
}
class DrawingVisitor {
  visit(qt) {
    stroke(255);
    strokeWeight(1);
    noFill();
    rectMode(CENTER);
    rect(qt.quadrant.x, qt.quadrant.y, qt.quadrant.w * 2, qt.quadrant.h * 2);
    if (qt.divided) {
      qt.upLeft.accept(this);
      qt.upRight.accept(this);
      qt.downLeft.accept(this);
      qt.downRight.accept(this);
    }

    for (let p of qt.points) {
      strokeWeight(3);
      point(p.x, p.y);
    }
  }
}
class CountingQuery {

  querySteps(qt, quadrant, result) {
    if (!result) {
      result = {
        resList: [],
        steps: 0
      };
    }
    result.steps++;
    if (qt.quadrant.intersetcs(quadrant)) {
      for (let p of qt.points) {
        if (quadrant.contains(p)) {
          result.resList.push(p);
          result.steps++;
        }
      }
      if (qt.divided) {
        this.querySteps(qt.upLeft, quadrant, result);
        this.querySteps(qt.upRight, quadrant, result);
        this.querySteps(qt.downLeft, quadrant, result);
        this.querySteps(qt.downRight, quadrant, result);
      }
    }
    return result;
  }
}