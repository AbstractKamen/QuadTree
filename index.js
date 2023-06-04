const BRUSH_MAX = 10;
const DRAW_SELECTION = [{
  label: 'Paint Points',
  draw() {
    if (mouseIsPressed) {
      for (let i = 0; i < brush; ++i) {
        quadTree.insert(new Point(mouseX + random(-brush, brush), mouseY + random(-brush, brush)))
      }
    }
  }
}, {
  label: 'Select Points',
  draw() {
    if (mouseIsPressed) {
      stroke(0, 255, 0);
      noFill();
      rectMode(CENTER);
      const selectionSize = treeSize / (BRUSH_MAX + 2 - brush);
      const selection = new Quadrant(mouseX, mouseY, selectionSize, selectionSize);
      const cq = new CountingQuery();
      const result = cq.querySteps(quadTree, selection);
      rect(selection.x, selection.y, selection.h * 2, selection.w * 2);
      stroke(255, 0, 0);
      for (let p of result.resList) {
        strokeWeight(1);
        text(`Found in ${result.steps} steps`, mouseX - selectionSize, mouseY - selectionSize);
        strokeWeight(3);
        point(p.x, p.y);
      }
    }
  }
}];
var canvas;
var quadTree;
var offsetX;
var offsetY;
var treeSize;
var drawSwitch;
var curDraw;
var brush;

onload = () => {
  setup();
}

function setup() {
  brush = 1;
  curDraw = DRAW_SELECTION[0];
  let s = 0.8;
  let h = ((window.innerHeight > 0) ? window.innerHeight : screen.height) * s;
  let w = ((window.innerWidth > 0) ? window.innerWidth : screen.width) * s;
  treeSize = Math.min(w, h);
  canvas = createCanvas(treeSize, treeSize);
  canvas.parent = 'sketch-holder';
  centerCanvas();
  quadTree = new QuadTree(new Quadrant(treeSize, treeSize, treeSize, treeSize), 4);
  document.getElementById('clear').addEventListener('click', () => {
    quadTree.clear();
    clear();
    background(0);
  });

  const content = document.getElementById('dropdown-content');
  const dropdownButton = document.getElementById('dropbtn');
  dropdownButton.textContent = curDraw.label;
  loadDropDownContent(content, dropdownButton, DRAW_SELECTION, (i) => {
    curDraw = DRAW_SELECTION[i];
    dropdownButton.textContent = curDraw.label;
    content.classList.toggle('show');
  });

  function loadDropDownContent(contentHtmlElement, contentBtn, labeledContent, onClickFunc) {
    for (let i = 0; i < labeledContent.length; i++) {
      let a = document.createElement('a');
      const curI = i;
      a.onclick = () => onClickFunc(curI);
      a.href = '#';
      a.textContent = labeledContent[i].label;
      a.classList = ['dropdown-content-a'];
      contentHtmlElement.appendChild(a);
    }
    contentBtn.addEventListener('click', () => contentHtmlElement.classList.toggle('show'));
  }
  const b = document.getElementById("brush");
  b.value = brush;
  b.oninput = () => {
    brush = parseInt(b.value);
  }
}

function draw() {
  let visitor = new DrawingVisitor()
  background(0);
  quadTree.accept(visitor);
  strokeWeight(1);
  stroke(0, 0, 255);
  text(`Total points: ${quadTree.size()}`, 0, treeSize * 0.05);
  curDraw.draw();
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