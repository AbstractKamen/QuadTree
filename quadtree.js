class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Quadrant {
    constructor(x, y, h, w) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
    }
    contains(point) {
        return this.x - this.w <= point.x &&
            point.x <= this.x + this.w &&
            this.y - this.h <= point.y &&
            point.y <= this.y + this.h;
    }
    intersetcs(other) {
        return !(other.x - other.w > this.x + this.w ||
            other.x + other.w < this.x - this.w ||
            other.y - other.h > this.y + this.h ||
            other.y + other.h < this.y - this.h);
    }
}
class QuadTree {
    constructor(quadrant, capacity) {
        this.quadrant = quadrant;
        this.capacity = capacity;
        this.points = [];
    }
    insert(point) {
        if (!this.quadrant.contains(point)) {
            return;
        }
        if (this.points.length < this.capacity) {
            this.points.push(point);
        } else {
            if (!this.divided) {
                let halfW = this.quadrant.w / 2;
                let halfH = this.quadrant.h / 2;
                let parentX = this.quadrant.x;
                let parentY = this.quadrant.y;
                this.upLeft = new QuadTree(new Quadrant(parentX + halfW, parentY - halfH, halfW, halfH), this.capacity);
                this.upRight = new QuadTree(new Quadrant(parentX - halfW, parentY - halfH, halfW, halfH), this.capacity);
                this.downLeft = new QuadTree(new Quadrant(parentX + halfW, parentY + halfH, halfW, halfH), this.capacity);
                this.downRight = new QuadTree(new Quadrant(parentX - halfW, parentY + halfH, halfW, halfH), this.capacity);
                this.divided = true;
            }
            this.upLeft.insert(point);
            this.upRight.insert(point);
            this.downLeft.insert(point);
            this.downRight.insert(point);
        }
    }
    query(quadrant, resList) {
        if (!resList) {
            resList = [];
        }
        if (this.quadrant.intersetcs(quadrant)) {
            for (let p of this.points) {
                if (quadrant.contains(p)) {
                    resList.push(p);
                }
            }
            if (this.divided) {
                this.upLeft.query(quadrant, resList);
                this.upRight.query(quadrant, resList);
                this.downLeft.query(quadrant, resList);
                this.downRight.query(quadrant, resList);
            }
        }
        return resList;
    }
    accept(visitor) {
        visitor.visit(this);
    }
}