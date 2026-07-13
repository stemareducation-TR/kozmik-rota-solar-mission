class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

    this.player = null;
    this.stars = [];
    this.obstacles = null;
    this.pickups = null;
    this.bullets = null;

    this.dragging = false;
    this.lastPointerY = 0;

    this.fuel = 100;
    this.shield = 100;
    this.ammo = 0;
    this.score = 0;

    this.missionDuration = 120;
    this.missionElapsed = 0;

    this.emergencyEnergyUsed = false;
    this.isQuestionOpen = false;
    this.isGameOver = false;
    this.isMissionComplete = false;

    this.lastFuelUpdate = 0;

    this.questions = [
      {
        question: "Merkür, Güneş'e en yakın kaçıncı gezegendir?",
        answers: ["Birinci", "İkinci", "Üçüncü"],
        correctIndex: 0,
        information: "Merkür, Güneş'e en yakın gezegendir."
      },
      {
        question: "Merkür'ün atmosferi nasıldır?",
        answers: [
          "Çok yoğun",
          "Çok ince",
          "Dünya ile aynıdır"
        ],
        correctIndex: 1,
        information: "Merkür'ün son derece ince bir ekzosferi vardır."
      },
      {
        question: "Merkür'ün Güneş çevresindeki bir turu yaklaşık kaç Dünya günü sürer?",
        answers: ["88 gün", "365 gün", "687 gün"],
        correctIndex: 0,
        information: "Merkür, Güneş çevresindeki turunu yaklaşık 88 günde tamamlar."
      }
    ];
  }

  preload() {
    this.load.image(
      "altay-x",
      "assets/player/altay-x-side-idle.png"
    );

    this.load.image(
      "asteroid-01",
      "assets/obstacles/asteroid-01.png"
    );

    this.load.image(
      "asteroid-02",
      "assets/obstacles/asteroid-02.png"
    );

    this.load.image(
      "energy-icon",
      "assets/pickups/energy-icon.png"
    );

    this.load.image(
      "weapon-icon",
      "assets/pickups/weapon-icon.png"
    );
  }

  create() {
    this.cameras.main.setBackgroundColor("#020805");

    this.createStarField();
    this.createGroups();
    this.createPlayer();
    this.createHUD();
    this.createFireButton();
    this.createInputControls();
    this.createSpawnTimers();

    this.lastFuelUpdate = this.time.now;
  }

  createStarField() {
    for (let i = 0; i < 120; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(0, this.scale.height),
        Phaser.Math.Between(1, 2),
        0x8dff8a,
        Phaser.Math.FloatBetween(0.15, 0.75)
      );

      star.speed = Phaser.Math.FloatBetween(0.4, 2.2);
      this.stars.push(star);
    }
  }

  createGroups() {
    this.obstacles = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.bullets = this.physics.add.group();
  }

  createPlayer() {
    this.player = this.physics.add.image(
      this.scale.width * 0.22,
      this.scale.height * 0.55,
      "altay-x"
    );

    this.player.setScale(0.16);
    this.player.setOrigin(0.5);
    this.player.setImmovable(true);
    this.player.body.setAllowGravity(false);

    // Araç görseli sola bakıyorsa sağa çevirmek için:
    // this.player.setFlipX(true);

    this.player.body.setSize(
      this.player.displayWidth * 0.7,
      this.player.displayHeight * 0.55
    );

    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handlePlayerObstacleCollision,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.pickups,
      this.handlePickupCollision,
      null,
      this
    );

    this.physics.add.overlap(
      this.bullets,
      this.obstacles,
      this.handleBulletObstacleCollision,
      null,
      this
    );
  }

  createHUD() {
    const hudStyle = {
      fontFamily: '"Courier New", monospace',
      fontSize: "19px",
      color: "#7cff7a",
      stroke: "#002b00",
      strokeThickness: 2
    };

    const smallHudStyle = {
      fontFamily: '"Courier New", monospace',
      fontSize: "16px",
      color: "#7cff7a"
    };

    this.add.rectangle(
      this.scale.width / 2,
      58,
      this.scale.width - 24,
      96,
      0x031006,
      0.88
    ).setStrokeStyle(2, 0x35ff35, 0.75);

    this.titleText = this.add.text(
      20,
      15,
      "KOZMİK ROTA // MERKÜR GÖREVİ",
      hudStyle
    );

    this.fuelText = this.add.text(
      20,
      48,
      "YAKIT: 100%",
      smallHudStyle
    );

    this.shieldText = this.add.text(
      195,
      48,
      "KALKAN: 100%",
      smallHudStyle
    );

    this.ammoText = this.add.text(
      390,
      48,
      "LAZER: 0",
      smallHudStyle
    );

    this.progressText = this.add.text(
      20,
      75,
      "MERKÜR ROTASI: 0%",
      smallHudStyle
    );

    this.scoreText = this.add.text(
      390,
      75,
      "SKOR: 0",
      smallHudStyle
    );

    this.statusText = this.add.text(
      this.scale.width / 2,
      120,
      "SİSTEMLER AKTİF",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "16px",
        color: "#b7ffb2",
        align: "center"
      }
    ).setOrigin(0.5);

    this.fuelBarBackground = this.add.rectangle(
      95,
      108,
      150,
      8,
      0x123814
    ).setOrigin(0, 0.5);

    this.fuelBar = this.add.rectangle(
      95,
      108,
      150,
      8,
      0x7cff7a
    ).setOrigin(0, 0.5);

    this.shieldBarBackground = this.add.rectangle(
      330,
      108,
      150,
      8,
      0x123814
    ).setOrigin(0, 0.5);

    this.shieldBar = this.add.rectangle(
      330,
      108,
      150,
      8,
      0x7cff7a
    ).setOrigin(0, 0.5);
  }

  createFireButton() {
    this.fireButton = this.add.circle(
      this.scale.width - 72,
      this.scale.height - 82,
      48,
      0x0a2a0d,
      0.9
    );

    this.fireButton.setStrokeStyle(3, 0x7cff7a, 0.9);
    this.fireButton.setInteractive();

    this.fireButtonText = this.add.text(
      this.fireButton.x,
      this.fireButton.y,
      "ATEŞ",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "17px",
        color: "#7cff7a"
      }
    ).setOrigin(0.5);

    this.fireButton.on("pointerdown", () => {
      this.fireLaser();
    });

    this.input.keyboard.on("keydown-SPACE", () => {
      this.fireLaser();
    });
  }

  createInputControls() {
    this.input.on("pointerdown", (pointer) => {
      if (
        this.isQuestionOpen ||
        this.isGameOver ||
        this.isMissionComplete
      ) {
        return;
      }

      const distanceToFireButton = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.fireButton.x,
        this.fireButton.y
      );

      if (distanceToFireButton < 70) {
        return;
      }

      this.dragging = true;
      this.lastPointerY = pointer.y;
    });

    this.input.on("pointermove", (pointer) => {
      if (
        !this.dragging ||
        !this.player ||
        this.isQuestionOpen ||
        this.isGameOver ||
        this.isMissionComplete
      ) {
        return;
      }

      const deltaY = pointer.y - this.lastPointerY;

      this.player.y += deltaY;
      this.lastPointerY = pointer.y;

      this.keepPlayerInsideScreen();
    });

    this.input.on("pointerup", () => {
      this.dragging = false;
    });

    this.input.on("pointerupoutside", () => {
      this.dragging = false;
    });

    this.input.on("pointercancel", () => {
      this.dragging = false;
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createSpawnTimers() {
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 9000,
      callback: this.spawnEnergyPickup,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 12000,
      callback: this.spawnWeaponPickup,
      callbackScope: this,
      loop: true
    });
  }

  spawnObstacle() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    const textureKey =
      Phaser.Math.Between(0, 1) === 0
        ? "asteroid-01"
        : "asteroid-02";

    const obstacle = this.obstacles.create(
      this.scale.width + 80,
      Phaser.Math.Between(170, this.scale.height - 130),
      textureKey
    );

    obstacle.setScale(
      textureKey === "asteroid-01"
        ? Phaser.Math.FloatBetween(0.12, 0.18)
        : Phaser.Math.FloatBetween(0.11, 0.16)
    );

    obstacle.setVelocityX(
      Phaser.Math.Between(-210, -145)
    );

    obstacle.setAngularVelocity(
      Phaser.Math.Between(-45, 45)
    );

    obstacle.body.setAllowGravity(false);
    obstacle.setData(
      "destructible",
      textureKey === "asteroid-01"
    );

    obstacle.body.setSize(
      obstacle.displayWidth * 0.72,
      obstacle.displayHeight * 0.72
    );
  }

  spawnEnergyPickup() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    const pickup = this.pickups.create(
      this.scale.width + 60,
      Phaser.Math.Between(190, this.scale.height - 170),
      "energy-icon"
    );

    pickup.setScale(0.12);
    pickup.setVelocityX(-135);
    pickup.body.setAllowGravity(false);
    pickup.setData("type", "energy");
  }

  spawnWeaponPickup() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    const pickup = this.pickups.create(
      this.scale.width + 60,
      Phaser.Math.Between(190, this.scale.height - 170),
      "weapon-icon"
    );

    pickup.setScale(0.12);
    pickup.setVelocityX(-145);
    pickup.body.setAllowGravity(false);
    pickup.setData("type", "weapon");
  }

  handlePlayerObstacleCollision(player, obstacle) {
    if (
      obstacle.getData("hasHitPlayer") ||
      this.isQuestionOpen ||
      this.isGameOver
    ) {
      return;
    }

    obstacle.setData("hasHitPlayer", true);
    obstacle.destroy();

    this.shield = Math.max(0, this.shield - 20);
    this.statusText.setText("UYARI: KALKAN HASARI");

    this.cameras.main.shake(180, 0.012);
    this.player.setTint(0xff5555);

    this.time.delayedCall(180, () => {
      if (this.player && this.player.active) {
        this.player.clearTint();
      }
    });

    this.checkFailureState();
  }

  handlePickupCollision(player, pickup) {
    const pickupType = pickup.getData("type");
    pickup.destroy();

    if (pickupType === "energy") {
      this.openQuestion();
      return;
    }

    if (pickupType === "weapon") {
      this.ammo = Math.min(30, this.ammo + 10);
      this.score += 100;
      this.statusText.setText("LAZER MODÜLÜ: +10 ATIŞ");
      this.updateHUD();
    }
  }

  handleBulletObstacleCollision(bullet, obstacle) {
    bullet.destroy();

    const destructible = obstacle.getData("destructible");

    if (destructible) {
      obstacle.destroy();
      this.score += 150;
      this.statusText.setText("HEDEF İMHA EDİLDİ");
    } else {
      obstacle.setTint(0x777777);

      this.time.delayedCall(120, () => {
        if (obstacle && obstacle.active) {
          obstacle.clearTint();
        }
      });

      this.statusText.setText("ZIRH DELİNEMEDİ");
    }

    this.updateHUD();
  }

  fireLaser() {
    if (
      this.ammo <= 0 ||
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      if (this.ammo <= 0) {
        this.statusText.setText("LAZER CEPhANESİ YOK");
      }
      return;
    }

    this.ammo -= 1;

    const bullet = this.add.rectangle(
      this.player.x + this.player.displayWidth / 2,
      this.player.y,
      26,
      5,
      0x7cff7a
    );

    this.physics.add.existing(bullet);

    bullet.body.setAllowGravity(false);
    bullet.body.setVelocityX(520);

    this.bullets.add(bullet);

    this.updateHUD();
  }

  openQuestion() {
    if (this.isQuestionOpen) {
      return;
    }

    this.isQuestionOpen = true;
    this.dragging = false;
    this.physics.world.pause();

    const question = Phaser.Utils.Array.GetRandom(
      this.questions
    );

    const shuffledAnswers = question.answers
      .map((answer, index) => ({
        answer,
        isCorrect: index === question.correctIndex
      }))
      .sort(() => Math.random() - 0.5);

    this.questionElements = [];

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.94
    ).setDepth(1000);

    const panel = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width - 48,
      560,
      0x061408,
      1
    ).setStrokeStyle(3, 0x7cff7a, 1)
      .setDepth(1001);

    const header = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 235,
      "ENERJİ TERMİNALİ // MERKÜR",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "21px",
        color: "#b7ffb2",
        align: "center"
      }
    ).setOrigin(0.5).setDepth(1002);

    const questionText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 155,
      question.question,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "23px",
        color: "#7cff7a",
        align: "center",
        wordWrap: {
          width: this.scale.width - 100
        }
      }
    ).setOrigin(0.5).setDepth(1002);

    this.questionElements.push(
      overlay,
      panel,
      header,
      questionText
    );

    shuffledAnswers.forEach((answerData, index) => {
      const y =
        this.scale.height / 2 - 30 + index * 105;

      const answerBackground = this.add.rectangle(
        this.scale.width / 2,
        y,
        this.scale.width - 100,
        72,
        0x0a2710,
        1
      ).setStrokeStyle(2, 0x4cff54, 0.85)
        .setDepth(1002)
        .setInteractive({
          useHandCursor: true
        });

      const answerText = this.add.text(
        this.scale.width / 2,
        y,
        answerData.answer,
        {
          fontFamily: '"Courier New", monospace',
          fontSize: "21px",
          color: "#b7ffb2",
          align: "center",
          wordWrap: {
            width: this.scale.width - 130
          }
        }
      ).setOrigin(0.5).setDepth(1003);

      answerBackground.on("pointerdown", () => {
        this.answerQuestion(
          answerData.isCorrect,
          question.information
        );
      });

      this.questionElements.push(
        answerBackground,
        answerText
      );
    });
  }

  answerQuestion(isCorrect, information) {
    if (isCorrect) {
      this.fuel = Math.min(100, this.fuel + 20);
      this.score += 250;
      this.statusText.setText(
        "DOĞRU CEVAP // YAKIT +20"
      );
    } else {
      this.fuel = Math.max(0, this.fuel - 10);
      this.statusText.setText(
        "YANLIŞ CEVAP // YAKIT -10"
      );
    }

    this.questionElements.forEach((element) => {
      if (element && element.destroy) {
        element.destroy();
      }
    });

    this.questionElements = [];

    this.isQuestionOpen = false;
    this.physics.world.resume();

    this.updateHUD();
    this.checkFailureState();

    const informationText = this.add.text(
      this.scale.width / 2,
      this.scale.height * 0.72,
      information,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "17px",
        color: "#b7ffb2",
        backgroundColor: "#031006",
        padding: {
          x: 14,
          y: 10
        },
        align: "center",
        wordWrap: {
          width: this.scale.width - 80
        }
      }
    ).setOrigin(0.5).setDepth(900);

    this.time.delayedCall(3000, () => {
      informationText.destroy();
    });
  }

  update(time, delta) {
    if (
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    this.updateStars(delta);

    if (this.isQuestionOpen) {
      return;
    }

    this.handleKeyboardMovement(delta);
    this.updateMission(delta);
    this.cleanupObjects();
  }

  updateStars(delta) {
    const deltaMultiplier = delta / 16.67;

    for (const star of this.stars) {
      star.x -= star.speed * deltaMultiplier;

      if (star.x < -4) {
        star.x = this.scale.width + 4;
        star.y = Phaser.Math.Between(
          130,
          this.scale.height
        );
      }
    }
  }

  handleKeyboardMovement(delta) {
    const movementSpeed = 0.42 * delta;

    if (this.cursors.up.isDown) {
      this.player.y -= movementSpeed;
    }

    if (this.cursors.down.isDown) {
      this.player.y += movementSpeed;
    }

    this.keepPlayerInsideScreen();
  }

  updateMission(delta) {
    this.missionElapsed += delta / 1000;

    const fuelDrain = (delta / 1000) * 0.38;
    this.fuel = Math.max(0, this.fuel - fuelDrain);

    const progress = Phaser.Math.Clamp(
      this.missionElapsed / this.missionDuration,
      0,
      1
    );

    this.progressText.setText(
      `MERKÜR ROTASI: ${Math.floor(progress * 100)}%`
    );

    this.updateHUD();

    if (this.fuel <= 0 || this.shield <= 0) {
      this.checkFailureState();
    }

    if (this.missionElapsed >= this.missionDuration) {
      this.completeMission();
    }
  }

  updateHUD() {
    this.fuelText.setText(
      `YAKIT: ${Math.ceil(this.fuel)}%`
    );

    this.shieldText.setText(
      `KALKAN: ${Math.ceil(this.shield)}%`
    );

    this.ammoText.setText(
      `LAZER: ${this.ammo}`
    );

    this.scoreText.setText(
      `SKOR: ${this.score}`
    );

    this.fuelBar.width =
      150 * Phaser.Math.Clamp(this.fuel / 100, 0, 1);

    this.shieldBar.width =
      150 * Phaser.Math.Clamp(this.shield / 100, 0, 1);

    if (this.fuel <= 25) {
      this.fuelText.setColor("#ff6b5f");
      this.fuelBar.setFillStyle(0xff4b3e);
    } else {
      this.fuelText.setColor("#7cff7a");
      this.fuelBar.setFillStyle(0x7cff7a);
    }

    if (this.shield <= 25) {
      this.shieldText.setColor("#ff6b5f");
      this.shieldBar.setFillStyle(0xff4b3e);
    } else {
      this.shieldText.setColor("#7cff7a");
      this.shieldBar.setFillStyle(0x7cff7a);
    }
  }

  keepPlayerInsideScreen() {
    if (!this.player) {
      return;
    }

    const halfHeight =
      this.player.displayHeight / 2;

    const topLimit = 145 + halfHeight;
    const bottomLimit =
      this.scale.height - halfHeight - 20;

    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      topLimit,
      bottomLimit
    );

    this.player.x = this.scale.width * 0.22;
  }

  cleanupObjects() {
    this.obstacles.getChildren().forEach((object) => {
      if (object.x < -120) {
        object.destroy();
      }
    });

    this.pickups.getChildren().forEach((object) => {
      if (object.x < -120) {
        object.destroy();
      }
    });

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.x > this.scale.width + 80) {
        bullet.destroy();
      }
    });
  }

  checkFailureState() {
    if (
      this.fuel > 0 &&
      this.shield > 0
    ) {
      return;
    }

    if (!this.emergencyEnergyUsed) {
      this.emergencyEnergyUsed = true;

      this.fuel = 25;
      this.shield = 30;

      this.statusText.setText(
        "ACİL ENERJİ SİSTEMİ DEVREDE"
      );

      this.cameras.main.flash(
        400,
        100,
        255,
        100
      );

      this.updateHUD();
      return;
    }

    this.showGameOver();
  }

  showGameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.dragging = false;
    this.physics.world.pause();

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.94
    ).setDepth(2000);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 90,
      "GÖREV BAŞARISIZ",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "34px",
        color: "#ff6055"
      }
    ).setOrigin(0.5).setDepth(2001);

    const score = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 25,
      `SKOR: ${this.score}`,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "22px",
        color: "#7cff7a"
      }
    ).setOrigin(0.5).setDepth(2001);

    const restartButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2 + 80,
      310,
      72,
      0x0b2b0e,
      1
    ).setStrokeStyle(3, 0x7cff7a, 1)
      .setDepth(2001)
      .setInteractive({
        useHandCursor: true
      });

    const restartText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 80,
      "GÖREVİ YENİDEN BAŞLAT",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "19px",
        color: "#b7ffb2"
      }
    ).setOrigin(0.5).setDepth(2002);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });
  }

  completeMission() {
    if (this.isMissionComplete) {
      return;
    }

    this.isMissionComplete = true;
    this.dragging = false;
    this.physics.world.pause();

    this.score += Math.ceil(this.fuel) * 10;

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.95
    ).setDepth(3000);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 130,
      "MERKÜR ROTASI TAMAMLANDI",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "29px",
        color: "#b7ffb2",
        align: "center",
        wordWrap: {
          width: this.scale.width - 70
        }
      }
    ).setOrigin(0.5).setDepth(3001);

    const details = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 20,
      [
        `KALAN YAKIT: ${Math.ceil(this.fuel)}%`,
        `KALAN KALKAN: ${Math.ceil(this.shield)}%`,
        `TOPLAM SKOR: ${this.score}`
      ].join("\n"),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "21px",
        color: "#7cff7a",
        align: "center",
        lineSpacing: 14
      }
    ).setOrigin(0.5).setDepth(3001);

    const restartButton = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2 + 150,
      290,
      72,
      0x0b2b0e,
      1
    ).setStrokeStyle(3, 0x7cff7a, 1)
      .setDepth(3001)
      .setInteractive({
        useHandCursor: true
      });

    const restartText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 150,
      "TEKRAR OYNA",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "21px",
        color: "#b7ffb2"
      }
    ).setOrigin(0.5).setDepth(3002);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",

  width: 540,
  height: 960,

  backgroundColor: "#020805",

  pixelArt: true,
  roundPixels: true,

  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 0
      },
      debug: false
    }
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: MainScene
};

new Phaser.Game(config);