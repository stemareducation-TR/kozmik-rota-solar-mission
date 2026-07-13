class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

    this.player = null;
    this.dragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
  }

  preload() {
    this.load.image(
      "altay-x",
      "assets/player/altay-x-side-idle.png"
    );
  }

  create() {
    this.cameras.main.setBackgroundColor("#050812");
    this.stars = [];

for (let i = 0; i < 100; i++) {
  const star = this.add.circle(
    Phaser.Math.Between(0, this.scale.width),
    Phaser.Math.Between(0, this.scale.height),
    Phaser.Math.Between(1, 2),
    0xffffff,
    Phaser.Math.FloatBetween(0.3, 1)
  );

  star.speed = Phaser.Math.FloatBetween(0.5, 2);
  this.stars.push(star);
}

    this.add.text(24, 20, "KOZMİK ROTA: SOLAR MISSION", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff"
    });

    this.add.text(24, 58, "Altay-X'i fareyle veya parmağınla sürükle", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#9fdcff"
    });

    this.player = this.add.image(
      this.scale.width * 0.25,
      this.scale.height * 0.55,
      "altay-x"
    );

    this.player.setScale(0.18);
    this.player.setOrigin(0.5);

    this.input.on("pointerdown", (pointer) => {
      this.dragging = true;
      this.lastPointerX = pointer.x;
      this.lastPointerY = pointer.y;
    });

    this.input.on("pointermove", (pointer) => {
      if (!this.dragging || !this.player) {
        return;
      }

      const deltaX = pointer.x - this.lastPointerX;
      const deltaY = pointer.y - this.lastPointerY;

      this.player.x += deltaX;
      this.player.y += deltaY;

      this.lastPointerX = pointer.x;
      this.lastPointerY = pointer.y;
update() {
  for (const star of this.stars) {
    star.x -= star.speed;

    if (star.x < 0) {
      star.x = this.scale.width;
      star.y = Phaser.Math.Between(0, this.scale.height);
    }
  }
}
      this.keepPlayerInsideScreen();
    });

    this.input.on("pointerup", () => {
      this.dragging = false;
    });

    this.input.on("pointerupoutside", () => {
      this.dragging = false;
    });
  }

  keepPlayerInsideScreen() {
    const halfWidth = this.player.displayWidth / 2;
    const halfHeight = this.player.displayHeight / 2;

    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      halfWidth,
      this.scale.width - halfWidth
    );

    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      halfHeight,
      this.scale.height - halfHeight
    );
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 540,
  backgroundColor: "#050812",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: MainScene
};

new Phaser.Game(config);