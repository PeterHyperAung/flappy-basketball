const game = (function (bird, btn, restart, pointElId = "point") {
  class Game {
    // a set of blocks
    #blocks = [
      [this.#createBlock("20", "top"), this.#createBlock("50", "bottom")],
      [this.#createBlock("30", "top"), this.#createBlock("40", "bottom")],
      [this.#createBlock("40", "top"), this.#createBlock("30", "bottom")],
      [this.#createBlock("50", "top"), this.#createBlock("20", "bottom")],
    ].sort(() => 0.5 - Math.random());

    #bird;
    #firsttime = true;
    #points = 0;
    #movingInterval;
    #show;

    constructor(bird, btn, pointElId = "point", restart = "restart") {
      // elements
      this.btn = document.getElementById(btn);
      this.pointEl = document.getElementById(pointElId);
      this.screen = document.querySelector(".screen");
      this.restartEl = document.getElementById(restart);
      this.restartEl.parentNode.style.visibility = "hidden";

      // Events
      this.btn.addEventListener("click", this.#btnOnClick.bind(this));
      this.restartEl.addEventListener("click", this.#restart.bind(this));

      // bird object
      this.#bird = bird;
    }

    // Generating blocks
    #createBlock(height, position) {
      return { height, position };
    }

    // btn click event handler
    #btnOnClick() {
      if (!this.#firsttime) return this.#bird.jump();
      this.#start();
      this.#firsttime = false;
    }

    // starting or restarting the game
    #start() {
      this.#bird.continuouslyDropping();
      this.#show = setInterval(this.#showBlocks.bind(this), 1500);
      this.#movingInterval = setInterval(this.#moving.bind(this), 20);
      this.btn.innerText = "Jump!";
    }

    #restart() {
      this.#points = 0;
      this.pointEl.innerText = this.#points;
      this.btn.innerText = "Start";
      document.querySelectorAll(".block").forEach((el) => el.remove());
      this.#bird.init();
      this.#firsttime = true;
      this.restartEl.parentNode.style.visibility = "hidden";
    }

    // ending the game when it is over
    #end() {
      clearInterval(this.#movingInterval);
      clearInterval(this.#show);
      this.#bird.die();
      this.restartEl.parentNode.style.visibility = "visible";
      this.btn.removeEventListener("click", this.#btnOnClick.bind(this));
    }

    // generating a div element which has classes and styles of a block
    #generateBlock(block) {
      const el = document.createElement("div");
      el.classList.add("block");
      el.classList.add(block.position);
      el.style.right = "-30px";
      el.style.height = block.height + "%";
      return el;
    }

    // showing blocks to the screen
    #showBlocks() {
      const blocks = this.#selectRandomBlocks();
      blocks.forEach((el) => this.screen.append(this.#generateBlock(el)));
    }

    // selecting random blocks to show them to the screen
    #selectRandomBlocks() {
      return this.#blocks[Math.floor(Math.random() * this.#blocks.length)];
    }

    // making those blocks move
    #moving() {
      // selecting all the blocks on the screen
      const blocks = document.querySelectorAll(".block");
      blocks.forEach((el) => {
        // moving them
        const right = parseInt(el.style.right);
        el.style.right = right + 2 + "px";

        // adding check class to element if they are near to the bird

        // checking whether if the game is over or not
        this.#checkIfOver(blocks);

        // Condition for adding points
        if (right === 380) {
          this.#gainPoint();
        }

        // removing elements for better performance after it passes through the screen
        if (right > 420) {
          el.remove();
        }
      });
    }

    // adding points and showing it to the screen
    #gainPoint() {
      this.#points += 0.5;
      this.pointEl.innerText = this.#points;
    }

    // checking if the game is over and not by checking each block
    #checkIfOver(blocks) {
      for (let block of blocks) this.#gameOverLogics(block) && this.#end();
    }

    // game over conditions
    #gameOverLogics(block) {
      if (this.#bird.el.classList.contains("die")) return true;

      const left = parseInt(block.style.right) + 30;
      const screenHeight = parseInt(
        window.getComputedStyle(this.screen).height
      );
      const style = window.getComputedStyle(block);
      const blockHeightpercent = (parseInt(style.height) / screenHeight) * 100;

      if (left > 345 && left < 382) {
        if (
          block.classList.contains("top") &&
          this.#bird.jumpedHeight + this.#bird.height > 100 - blockHeightpercent
        )
          return true;
        if (
          block.classList.contains("bottom") &&
          this.#bird.jumpedHeight < blockHeightpercent
        )
          return true;
      }
    }
  }

  class Bird {
    jumpedHeight = 50;

    // height estimated value (1sf) in percentage
    height = 10;

    #riseRate = 12;
    #dropRate = 2;

    #droppingInterval;

    constructor(id) {
      // getting the element
      this.el = document.getElementById(id);
      this.el.style.bottom = this.jumpedHeight + "%";
    }

    // initial state
    init() {
      this.el.classList.remove("die");
      this.jumpedHeight = 50;
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
        this.jumpedHeight += this.#riseRate;
      }

      this.el.style.bottom = this.jumpedHeight + "%";
    }

    // game over scene for the bird
    die() {
      this.el.classList.add("die");
      this.jumpedHeight = 0;
      this.el.style.bottom = this.jumpedHeight + "%";
      clearInterval(this.#droppingInterval);
    }

    // making the bird drop to the ground when it is alive
    continuouslyDropping() {
      this.#droppingInterval = setInterval(() => {
        if (this.jumpedHeight < 0) return this.die();
        this.jumpedHeight -= this.#dropRate;
        this.el.style.bottom = this.jumpedHeight + "%";
      }, 60);
    }
  }

  return new Game(new Bird(bird), btn, pointElId, restart);
})("bird", "jump", (restart = "restart"));
