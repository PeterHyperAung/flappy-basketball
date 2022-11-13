const game = (function (bird, btn, pointElId = "point") {
  class Game {
    // a set of blocks
    #blocks = [
      [this.createBlock("20", "top"), this.createBlock("50", "bottom")],
      [this.createBlock("30", "top"), this.createBlock("40", "bottom")],
      [this.createBlock("40", "top"), this.createBlock("30", "bottom")],
      [this.createBlock("50", "top"), this.createBlock("20", "bottom")],
    ].sort(() => 0.5 - Math.random());

    #bird;
    #firsttime = true;
    #points = 0;

    constructor(bird, btn, block, pointElId = "point") {
      // elements
      this.btn = document.getElementById(btn);
      this.screen = document.querySelector(".screen");

      // id for showing points
      this.pointElId = pointElId;

      // bird object
      this.#bird = bird;

      // reacting to button event
      this.btn.addEventListener("click", this.btnOnClick.bind(this));
    }

    // Generating blocks
    createBlock(height, position) {
      return { height, position };
    }

    // btn click event handler
    btnOnClick() {
      if (!this.#firsttime) return this.#bird.jump();
      this.#firsttime = false;
      this.start();
    }

    // starting the game
    start() {
      this.show = setInterval(this.showBlocks.bind(this), 1500);
      this.movingInterval = setInterval(this.moving.bind(this), 20);
      this.#bird.continuouslyDropping();
      this.btn.innerText = "Jump!";
    }

    // ending the game when it is over
    end() {
      clearInterval(this.morningInterval);
      clearInterval(this.show);
      this.#bird.die();
      this.btn.innerText = "Restart";
    }

    // generating a div element which has classes and styles of a block
    generateBlock(block) {
      const el = document.createElement("div");
      el.classList.add("block");
      el.classList.add(block.position);
      el.style.right = "-30px";
      el.style.height = block.height + "%";
      return el;
    }

    // showing blocks to the screen
    showBlocks() {
      const blocks = this.selectRandomBlocks();
      blocks.forEach((el) => this.screen.append(this.generateBlock(el)));
    }

    // selecting random blocks to show them to the screen
    selectRandomBlocks() {
      return this.#blocks[Math.floor(Math.random() * this.#blocks.length)];
    }

    // making those blocks move
    moving() {
      // selecting all the blocks on the screen
      const blocks = document.querySelectorAll(".block");
      blocks.forEach((el) => {
        // moving them
        const right = parseInt(el.style.right);
        el.style.right = right + 2 + "px";

        // adding check class to element if they are near to the bird

        // checking whether if the game is over or not
        this.checkIfOver(blocks);

        // Condition for adding points
        if (right === 380) {
          this.gainPoint();
        }

        // removing elements for better performance after it passes through the screen
        if (right > 420) {
          el.remove();
        }
      });
    }

    // adding points and showing it to the screen
    gainPoint() {
      this.#points += 0.5;
      document.getElementById(this.pointElId).innerText = this.#points;
    }

    checkIfOver(blocks) {
      for (let block of blocks) this.gameOverLogics(block) && this.end();
    }

    gameOverLogics(block) {
      const left = parseInt(block.style.right) + 30;
      const screenHeight = parseInt(
        window.getComputedStyle(this.screen).height
      );
      const style = window.getComputedStyle(block);
      const blockHeightpercent = (parseInt(style.height) / screenHeight) * 100;

      if (left > 345 && left < 382) {
        if (
          block.classList.include("top") &&
          this.#bird.jumpedHeight + this.bird.height > 100 - blockHeightpercent
        )
          return true;
        if (
          block.classList.include("bottom") &&
          this.#bird.jumpedHeight < blockHeightpercent
        )
          return true;
      }
    }
  }

  class Bird {
    jumpedHeight = 50;
    riseRate = 12;

    // height estimated value in percentage
    height = 13;
    dropRate = 2;
    dropping;

    constructor(id) {
      this.el = document.getElementById(id);
      this.el.style.bottom = this.jumpedHeight + "%";
    }

    // making the bird jump
    jump() {
      // making sure that the bird doesn't fly higher than the box
      if (this.jumpedHeight > 92 || !this.jumpedHeight) return;

      // slowing it down to make it relastic when it is bounced with or too closed to the upper border
      if (this.jumpedHeight > 75) {
        this.jumpedHeight += 10;
      } else if (this.jumpedHeight < 85) {
        // normal when the bird is flying lower than 85%
        this.jumpedHeight += this.riseRate;
      }

      this.el.style.bottom = this.jumpedHeight + "%";
    }

    // game over scene for the bird
    die() {
      this.el.classList.add("die");
      this.jumpedHeight = 0;
      clearInterval(this.dropping);
    }

    // making the bird drop to the ground when it is alive
    continuouslyDropping() {
      this.dropping = setInterval(() => {
        if (this.jumpedHeight < 0) return this.die();
        this.jumpedHeight -= this.dropRate;
        this.el.style.bottom = this.jumpedHeight + "%";
      }, 60);
    }
  }

  return new Game(new Bird(bird), btn, pointElId);
})("bird", "jump");
