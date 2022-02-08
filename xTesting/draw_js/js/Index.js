class Index {

  constructor() {
    this.coordinates = [];
    this.tip = {
      x: undefined,
      y: undefined
    }
    this.prev = {
      x: 0,
      y: 0
    }
  }

  update() {
    this.coordinate();
    // this.display();
  }

  coordinate() {
    this.prev.x = this.tip.x;
    this.prev.y = this.tip.y;
    this.tip.x = this.coordinates.annotations.indexFinger[3][0];
    this.tip.y = this.coordinates.annotations.indexFinger[3][1];
  }

  display() {
    push();
    fill(this.tip.col);
    strokeWeight(2);
    line(this.base.x, this.base.y, this.tip.x, this.tip.y);
    pop();

    push();
    fill(this.base.r, this.base.g, this.base.b);
    noStroke();
    circle(this.base.x, this.base.y, this.base.size, this.base.size);
    pop();
  }

}
