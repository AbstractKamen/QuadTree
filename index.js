const BRUSH_MAX = 10;
const TEXT_SIZE = 12;
const DRAW_SELECTION = [{
  label: 'Paint Points',
  draw(sketch) {
    if (sketch.mouseIsPressed && sketch.mouseX <= treeSize && sketch.mouseY <= treeSize) {
      for (let i = 0; i < brush; ++i) {
        quadTree.insert(new Point(sketch.mouseX + sketch.random(-brush, brush), sketch.mouseY + sketch.random(-brush, brush)))
      }
    }
  }
}, {
  label: 'Select Points',
  draw(sketch) {
    if (sketch.mouseIsPressed) {
      sketch.stroke(0, 255, 0);
      sketch.noFill();
      sketch.rectMode(sketch.CENTER);
      const selectionSize = treeSize / (BRUSH_MAX + 2 - brush);
      const selection = new Quadrant(sketch.mouseX, sketch.mouseY, selectionSize, selectionSize);
      const cq = new CountingQuery();
      const result = cq.querySteps(quadTree, selection);
      sketch.rect(selection.x, selection.y, selection.h * 2, selection.w * 2);
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
      sketch.text(`Found ${c} points in ${s} steps`, sketch.mouseX - selectionSize, sketch.mouseY - selectionSize);
    }
  }
}];
var canvas;
var sketch;
var quadTree;
var offsetX;
var offsetY;
var treeSize;
var drawSwitch;
var curDraw;
var brush;
var p5;

onload = () => {
  init();
}

function init() {
  const s = (sketch) => {
    sketch.setup = () => {
      brush = 1;
      curDraw = DRAW_SELECTION[0];
      let s = 0.8;
      let h = ((window.innerHeight > 0) ? window.innerHeight : screen.height) * s;
      let w = ((window.innerWidth > 0) ? window.innerWidth : screen.width) * s;
      treeSize = Math.min(w, h);
      canvas = sketch.createCanvas(treeSize, treeSize);
      centerCanvas(sketch);
      quadTree = new QuadTree(new Quadrant(treeSize, treeSize, treeSize, treeSize), 4);
    };
    sketch.draw = () => {
      let visitor = new DrawingVisitor(sketch)
      sketch.background(0);
      quadTree.accept(visitor);
      sketch.strokeWeight(1);
      sketch.fill(0, 0, 255);
      sketch.stroke(0, 0, 255);
      sketch.textSize(TEXT_SIZE);
      sketch.text(`Total points: ${quadTree.size()}`, 0, treeSize * 0.05);
      curDraw.draw(sketch);
    };
  };
  p5 = new p5(s, 'sketch-holder');
  document.getElementById('clear').addEventListener('click', () => {
    quadTree.clear();
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
  const b = document.getElementById('brush');
  b.value = brush;
  b.oninput = () => {
    brush = parseInt(b.value);
  }
}

function centerCanvas(sketch) {
  // let holder = document.getElementById('sketch-holder')
  // console.log(holder);
  // offsetX = (sketch.windowWidth - treeSize) / 2;
  // offsetY = (sketch.windowHeight - treeSize);
  // canvas.position(offsetX, offsetY);
}

function windowResized() {
  centerCanvas(p5.sketch);
}
class DrawingVisitor {
  constructor(sketch) {
    this.sketch = sketch;
  }
  visit(qt) {
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

  querySteps(qt, quadrant, result) {
    if (!result) {
      result = {
        resList: [],
        steps: 0
      };
    }
    if (qt.quadrant.intersetcs(quadrant)) {
      result.steps++;
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