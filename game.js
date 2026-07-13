class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
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

    this.load.image(
      "laser-shot",
      "assets/effects/laser-shot.png"
    );

    this.load.image(
      "mercury-boss-projectile",
      "assets/effects/mercury-boss-projectile.png"
    );

    this.load.image(
      "mercury-boss",
      "assets/bosses/mercury-boss.png"
    );

    this.load.image(
      "mercury-boss-damage-01",
      "assets/bosses/mercury-boss-damage-01.png"
    );

    this.load.image(
      "mercury-boss-damage-02",
      "assets/bosses/mercury-boss-damage-02.png"
    );
  }

  create() {
    this.initializeGameValues();

    this.cameras.main.setBackgroundColor("#020805");

    this.createStarField();
    this.createGroups();
    this.prepareQuestions();
    this.preparePickupSchedule();
    this.createPlayer();
    this.createHUD();
    this.createControls();
    this.createCollisions();
    this.createObstacleTimer();

    this.statusText.setText(
      "GÖREV BAŞLADI // MERKÜR ROTASI"
    );
  }

  initializeGameValues() {
    this.fuel = 100;
    this.shield = 100;
    this.ammo = 0;
    this.score = 0;

    this.missionDuration = 120;
    this.bossStartTime = 110;
    this.missionElapsed = 0;
    this.progress = 0;

    this.correctAnswers = 0;
    this.wrongAnswers = 0;

    this.isQuestionOpen = false;
    this.isGameOver = false;
    this.isMissionComplete = false;
    this.isBossPhase = false;
    this.isBossEntering = false;
    this.isFinalQuestion = false;

    this.emergencyUsed = false;

    this.lastShotTime = 0;
    this.shotCooldown = 300;

    this.boss = null;
    this.bossHits = 0;
    this.bossRequiredHits = 3;
    this.bossBaseY = 470;
    this.bossFireTimer = null;

    this.pickupSchedule = [];
    this.nextPickupIndex = 0;

    this.questionElements = [];
    this.messageElements = [];

    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.lastPointerY = 0;
    this.pointerMoved = false;
    this.dragging = false;
  }

  createGroups() {
    this.obstacles = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.playerBullets = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();
  }

  createStarField() {
    this.stars = [];

    for (let i = 0; i < 135; i++) {
      const size = Phaser.Math.Between(1, 2);

      const star = this.add.circle(
        Phaser.Math.Between(0, 540),
        Phaser.Math.Between(130, 960),
        size,
        0xbaffba,
        Phaser.Math.FloatBetween(0.18, 0.8)
      );

      star.speed = Phaser.Math.FloatBetween(0.5, 2.4);
      this.stars.push(star);
    }
  }

  preparePickupSchedule() {
    /*
      4 silah ikonu:
      10, 38, 68 ve 98. saniyelerde.

      3 enerji ikonu:
      24, 54 ve 84. saniyelerde.

      Enerji soruları arasında yaklaşık 30 saniye bulunur.
    */

    this.pickupSchedule = [
      { time: 10, type: "weapon", spawned: false },
      { time: 24, type: "energy", spawned: false },
      { time: 38, type: "weapon", spawned: false },
      { time: 54, type: "energy", spawned: false },
      { time: 68, type: "weapon", spawned: false },
      { time: 84, type: "energy", spawned: false },
      { time: 98, type: "weapon", spawned: false }
    ];
  }

  prepareQuestions() {
    this.mercuryQuestions = [
      {
        question:
          "Merkür, Güneş’e en yakın kaçıncı gezegendir?",
        answers: ["Birinci", "İkinci", "Üçüncü"],
        correctIndex: 0,
        information:
          "Merkür, Güneş’e en yakın gezegendir."
      },
      {
        question:
          "Merkür’ün Güneş çevresindeki bir turu yaklaşık kaç Dünya günü sürer?",
        answers: ["88 gün", "365 gün", "687 gün"],
        correctIndex: 0,
        information:
          "Merkür bir yılını yaklaşık 88 Dünya gününde tamamlar."
      },
      {
        question:
          "Güneş Sistemi’nin en küçük gezegeni hangisidir?",
        answers: ["Merkür", "Mars", "Venüs"],
        correctIndex: 0,
        information:
          "Merkür, Güneş Sistemi’nin en küçük gezegenidir."
      },
      {
        question:
          "Merkür’ün atmosferi nasıldır?",
        answers: ["Çok ince", "Çok yoğun", "Dünya ile aynı"],
        correctIndex: 0,
        information:
          "Merkür’ün yoğun bir atmosferi değil, çok ince bir ekzosferi vardır."
      },
      {
        question:
          "Merkür’ün kraterli yüzeyi en çok hangi gök cismini andırır?",
        answers: ["Ay", "Jüpiter", "Satürn"],
        correctIndex: 0,
        information:
          "Merkür’ün kraterli yüzeyi Ay’a benzer."
      },
      {
        question:
          "Merkür gezegeni adını hangi mitolojideki tanrıdan alır?",
        answers: ["Roma", "Mısır", "İskandinav"],
        correctIndex: 0,
        information:
          "Merkür adı Roma mitolojisindeki Mercurius’tan gelir."
      },
      {
        question:
          "Roma mitolojisindeki Merkür en çok hangi göreviyle bilinir?",
        answers: [
          "Tanrıların habercisi",
          "Denizlerin tanrısı",
          "Savaş tanrısı"
        ],
        correctIndex: 0,
        information:
          "Merkür, Roma mitolojisinde tanrıların habercisidir."
      },
      {
        question:
          "Roma mitolojisindeki Merkür’ün Yunan karşılığı kimdir?",
        answers: ["Hermes", "Ares", "Poseidon"],
        correctIndex: 0,
        information:
          "Merkür’ün Yunan mitolojisindeki karşılığı Hermes’tir."
      },
      {
        question:
          "Merkür ve Hermes en çok hangi kavramlarla ilişkilendirilir?",
        answers: [
          "Hız ve haberleşme",
          "Tarım ve hasat",
          "Deniz ve fırtına"
        ],
        correctIndex: 0,
        information:
          "Merkür ve Hermes; hız, yolculuk, ticaret ve haberleşmeyle ilişkilendirilir."
      }
    ];

    this.normalQuestionPool = Phaser.Utils.Array.Shuffle(
      [...this.mercuryQuestions]
    ).slice(0, 3);

    this.finalQuestionPool = Phaser.Utils.Array.Shuffle([
      {
        question:
          "Merkür neden gökyüzünde Güneş’ten çok uzak görünmez?",
        answers: [
          "Güneş’e yakın yörüngede olduğu için",
          "Dünya’nın uydusu olduğu için",
          "Kendi ışığını ürettiği için"
        ],
        correctIndex: 0,
        information:
          "Merkür, Güneş’e çok yakın bir yörüngede hareket eder."
      },
      {
        question:
          "Merkür’ün yüzeyinde neden çok sayıda krater bulunur?",
        answers: [
          "Yoğun atmosferi olmadığı için",
          "Sürekli yağmur yağdığı için",
          "Büyük okyanusları olduğu için"
        ],
        correctIndex: 0,
        information:
          "Yoğun bir atmosferi olmadığı için birçok göktaşı Merkür’ün yüzeyine ulaşabilir."
      },
      {
        question:
          "Mitolojide Merkür neden hızlı bir tanrı olarak anlatılır?",
        answers: [
          "Tanrıların habercisi olduğu için",
          "Denizleri yönettiği için",
          "Dağları oluşturduğu için"
        ],
        correctIndex: 0,
        information:
          "Merkür, tanrıların mesajlarını taşıyan hızlı haberci olarak kabul edilir."
      }
    ]);
  }

  createPlayer() {
    this.player = this.physics.add.image(
      105,
      520,
      "altay-x"
    );

    // Araç önceki sürüme göre küçültüldü.
    this.player.setScale(0.105);
    this.player.setDepth(20);
    this.player.body.setAllowGravity(false);
    this.player.setImmovable(true);

    this.player.body.setSize(
      this.player.displayWidth * 0.68,
      this.player.displayHeight * 0.52
    );
  }

  createHUD() {
    this.add.rectangle(
      270,
      62,
      520,
      112,
      0x031006,
      0.94
    ).setStrokeStyle(2, 0x35ff35, 0.85);

    this.add.text(
      18,
      12,
      "KOZMİK ROTA // MERKÜR",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "20px",
        color: "#b7ffb2",
        stroke: "#002800",
        strokeThickness: 2
      }
    );

    // HUD değerleri farklı renklerde.
    this.fuelText = this.add.text(
      18,
      48,
      "YAKIT: 100%",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#ffe066"
      }
    );

    this.shieldText = this.add.text(
      185,
      48,
      "KALKAN: 100%",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#61dafb"
      }
    );

    this.ammoText = this.add.text(
      390,
      48,
      "LAZER: 0",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#ff79d1"
      }
    );

    this.progressText = this.add.text(
      18,
      77,
      "ROTA: 0%",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#7cff7a"
      }
    );

    this.scoreText = this.add.text(
      390,
      77,
      "SKOR: 0",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#ffad5c"
      }
    );

    this.fuelBarBackground = this.add.rectangle(
      18,
      103,
      220,
      7,
      0x443b18
    ).setOrigin(0, 0.5);

    this.fuelBar = this.add.rectangle(
      18,
      103,
      220,
      7,
      0xffe066
    ).setOrigin(0, 0.5);

    this.shieldBarBackground = this.add.rectangle(
      302,
      103,
      220,
      7,
      0x143546
    ).setOrigin(0, 0.5);

    this.shieldBar = this.add.rectangle(
      302,
      103,
      220,
      7,
      0x61dafb
    ).setOrigin(0, 0.5);

    this.statusText = this.add.text(
      270,
      137,
      "SİSTEMLER AKTİF",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "14px",
        color: "#b7ffb2",
        align: "center"
      }
    ).setOrigin(0.5);

    this.tapHint = this.add.text(
      270,
      925,
      "DOKUN: ATEŞ  //  SÜRÜKLE: HAREKET",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "13px",
        color: "#6fae70",
        align: "center"
      }
    ).setOrigin(0.5);
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on("keydown-SPACE", () => {
      this.fireLaser();
    });

    this.input.on("pointerdown", (pointer) => {
      if (
        this.isQuestionOpen ||
        this.isGameOver ||
        this.isMissionComplete
      ) {
        return;
      }

      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
      this.lastPointerY = pointer.y;

      this.pointerMoved = false;
      this.dragging = true;
    });

    this.input.on("pointermove", (pointer) => {
      if (
        !this.dragging ||
        this.isQuestionOpen ||
        this.isGameOver ||
        this.isMissionComplete
      ) {
        return;
      }

      const totalDistance =
        Phaser.Math.Distance.Between(
          this.pointerStartX,
          this.pointerStartY,
          pointer.x,
          pointer.y
        );

      if (totalDistance > 12) {
        this.pointerMoved = true;
      }

      if (this.pointerMoved) {
        const deltaY =
          pointer.y - this.lastPointerY;

        this.player.y += deltaY;
        this.lastPointerY = pointer.y;

        this.keepPlayerInsideScreen();
      }
    });

    this.input.on("pointerup", () => {
      if (
        this.dragging &&
        !this.pointerMoved &&
        !this.isQuestionOpen &&
        !this.isGameOver &&
        !this.isMissionComplete
      ) {
        this.fireLaser();
      }

      this.dragging = false;
      this.pointerMoved = false;
    });

    this.input.on("pointerupoutside", () => {
      this.dragging = false;
      this.pointerMoved = false;
    });

    this.input.on("pointercancel", () => {
      this.dragging = false;
      this.pointerMoved = false;
    });
  }

  createCollisions() {
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
      this.playerBullets,
      this.obstacles,
      this.handleBulletObstacleCollision,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.bossProjectiles,
      this.handleBossProjectilePlayerCollision,
      null,
      this
    );

    this.physics.add.overlap(
      this.playerBullets,
      this.bossProjectiles,
      this.handleBulletBossProjectileCollision,
      null,
      this
    );
  }

  createObstacleTimer() {
    this.obstacleTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });
  }

  spawnObstacle() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete ||
      this.isBossPhase ||
      this.isBossEntering
    ) {
      return;
    }

    const texture =
      Phaser.Math.Between(0, 1) === 0
        ? "asteroid-01"
        : "asteroid-02";

    const asteroid = this.obstacles.create(
      610,
      Phaser.Math.Between(180, 860),
      texture
    );

    asteroid.setScale(
      Phaser.Math.FloatBetween(0.095, 0.145)
    );

    asteroid.setVelocityX(
      Phaser.Math.Between(-215, -155)
    );

    asteroid.setAngularVelocity(
      Phaser.Math.Between(-85, 85)
    );

    asteroid.body.setAllowGravity(false);

    asteroid.setData("destroyed", false);
    asteroid.setData("falling", false);
    asteroid.setData("hitPlayer", false);

    asteroid.body.setSize(
      asteroid.displayWidth * 0.7,
      asteroid.displayHeight * 0.7
    );
  }

  spawnPickup(type) {
    const texture =
      type === "energy"
        ? "energy-icon"
        : "weapon-icon";

    const pickup = this.pickups.create(
      600,
      Phaser.Math.Between(200, 840),
      texture
    );

    pickup.setScale(0.105);
    pickup.setVelocityX(-140);
    pickup.body.setAllowGravity(false);
    pickup.setData("type", type);

    pickup.body.setSize(
      pickup.displayWidth * 0.72,
      pickup.displayHeight * 0.72
    );
  }

  checkPickupSchedule() {
    if (
      this.isQuestionOpen ||
      this.isBossPhase ||
      this.isBossEntering ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    while (
      this.nextPickupIndex <
        this.pickupSchedule.length &&
      this.missionElapsed >=
        this.pickupSchedule[this.nextPickupIndex].time
    ) {
      const event =
        this.pickupSchedule[this.nextPickupIndex];

      if (!event.spawned) {
        event.spawned = true;
        this.spawnPickup(event.type);
      }

      this.nextPickupIndex += 1;
    }
  }

  fireLaser() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete ||
      !this.player
    ) {
      return;
    }

    if (this.ammo <= 0) {
      this.statusText.setText(
        "LAZER CEPHANESİ YOK"
      );

      return;
    }

    const now = this.time.now;

    if (
      now - this.lastShotTime <
      this.shotCooldown
    ) {
      return;
    }

    this.lastShotTime = now;
    this.ammo -= 1;

    const laser = this.playerBullets.create(
      this.player.x +
        this.player.displayWidth * 0.42,
      this.player.y,
      "laser-shot"
    );

    laser.setScale(0.34);
    laser.setVelocityX(600);
    laser.body.setAllowGravity(false);
    laser.setData("hit", false);

    this.updateHUD();
  }

  handleBulletObstacleCollision(
    laser,
    asteroid
  ) {
    if (
      !laser.active ||
      !asteroid.active ||
      laser.getData("hit") ||
      asteroid.getData("destroyed")
    ) {
      return;
    }

    laser.setData("hit", true);
    laser.destroy();

    asteroid.setData("destroyed", true);
    asteroid.setData("falling", true);

    asteroid.setTint(0xff6b25);
    asteroid.setVelocityX(
      Phaser.Math.Between(-35, 20)
    );
    asteroid.setVelocityY(
      Phaser.Math.Between(300, 410)
    );
    asteroid.setAngularVelocity(
      Phaser.Math.Between(-350, 350)
    );

    this.score += 150;

    this.statusText.setText(
      "METEOR HASAR ALDI"
    );

    this.cameras.main.flash(
      90,
      255,
      100,
      20
    );

    this.time.delayedCall(160, () => {
      if (asteroid.active) {
        asteroid.clearTint();
      }
    });

    this.updateHUD();
  }

  handlePlayerObstacleCollision(
    player,
    asteroid
  ) {
    if (
      asteroid.getData("hitPlayer") ||
      asteroid.getData("falling") ||
      asteroid.getData("destroyed") ||
      this.isQuestionOpen ||
      this.isGameOver
    ) {
      return;
    }

    asteroid.setData("hitPlayer", true);
    asteroid.destroy();

    this.shield = Math.max(
      0,
      this.shield - 20
    );

    this.statusText.setText(
      "METEOR ÇARPMASI // KALKAN -20"
    );

    this.player.setTint(0xff4545);
    this.cameras.main.shake(170, 0.013);

    this.time.delayedCall(180, () => {
      if (this.player.active) {
        this.player.clearTint();
      }
    });

    this.updateHUD();
    this.checkFailureState();
  }

  handlePickupCollision(player, pickup) {
    const type = pickup.getData("type");
    pickup.destroy();

    if (type === "weapon") {
      // Her silah ikonu yalnızca 2 lazer verir.
      this.ammo += 2;
      this.score += 75;

      this.showLargeResult(
        "LAZER +2",
        "#ff79d1"
      );

      this.statusText.setText(
        "SİLAH MODÜLÜ ALINDI"
      );

      this.updateHUD();
      return;
    }

    if (type === "energy") {
      this.openNormalQuestion();
    }
  }

  openNormalQuestion() {
    if (
      this.isQuestionOpen ||
      this.normalQuestionPool.length === 0
    ) {
      return;
    }

    const question =
      this.normalQuestionPool.shift();

    this.openQuestionPanel(
      question,
      false
    );
  }

  openFinalQuestion() {
    if (this.finalQuestionPool.length === 0) {
      this.finalQuestionPool =
        Phaser.Utils.Array.Shuffle([
          ...this.mercuryQuestions
        ]);
    }

    this.isFinalQuestion = true;

    const question =
      this.finalQuestionPool.shift();

    this.openQuestionPanel(
      question,
      true
    );
  }

  openQuestionPanel(question, isFinal) {
    this.isQuestionOpen = true;
    this.dragging = false;

    this.physics.world.pause();

    if (this.bossFireTimer) {
      this.bossFireTimer.paused = true;
    }

    const answers = question.answers
      .map((text, index) => ({
        text,
        correct:
          index === question.correctIndex
      }))
      .sort(() => Math.random() - 0.5);

    const overlay = this.add.rectangle(
      270,
      480,
      540,
      960,
      0x010501,
      0.96
    ).setDepth(2000);

    const panel = this.add.rectangle(
      270,
      480,
      500,
      610,
      0x061408,
      1
    )
      .setStrokeStyle(
        3,
        isFinal ? 0xff8738 : 0x66ff66,
        1
      )
      .setDepth(2001);

    const header = this.add.text(
      270,
      225,
      isFinal
        ? "MERKÜR SON PROTOKOLÜ"
        : "ENERJİ SORUSU",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "22px",
        color: isFinal
          ? "#ffad67"
          : "#b7ffb2",
        align: "center"
      }
    )
      .setOrigin(0.5)
      .setDepth(2002);

    const questionText = this.add.text(
      270,
      335,
      question.question,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "23px",
        color: "#ffffff",
        align: "center",
        wordWrap: {
          width: 430
        }
      }
    )
      .setOrigin(0.5)
      .setDepth(2002);

    this.questionElements = [
      overlay,
      panel,
      header,
      questionText
    ];

    answers.forEach((answer, index) => {
      const y = 485 + index * 110;

      const button = this.add.rectangle(
        270,
        y,
        430,
        78,
        0x0b2a10,
        1
      )
        .setStrokeStyle(2, 0x63ff68, 1)
        .setInteractive({
          useHandCursor: true
        })
        .setDepth(2002);

      const text = this.add.text(
        270,
        y,
        answer.text,
        {
          fontFamily: '"Courier New", monospace',
          fontSize: "20px",
          color: "#caffc8",
          align: "center",
          wordWrap: {
            width: 390
          }
        }
      )
        .setOrigin(0.5)
        .setDepth(2003);

      button.on("pointerdown", () => {
        this.answerQuestion(
          answer.correct,
          question.information,
          isFinal
        );
      });

      this.questionElements.push(
        button,
        text
      );
    });
  }

  answerQuestion(
    isCorrect,
    information,
    isFinal
  ) {
    this.clearQuestionPanel();
    this.isQuestionOpen = false;

    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += isFinal ? 500 : 250;

      this.showLargeResult(
        "DOĞRU CEVAP!",
        "#79ff78",
        information
      );

      if (isFinal) {
        this.time.delayedCall(2300, () => {
          this.completeBossBattle();
        });

        return;
      }

      this.fuel = Math.min(
        100,
        this.fuel + 18
      );

      this.statusText.setText(
        "DOĞRU CEVAP // YAKIT +18"
      );
    } else {
      this.wrongAnswers += 1;

      this.showLargeResult(
        "YANLIŞ CEVAP",
        "#ff6565",
        information
      );

      if (isFinal) {
        this.fuel = Math.max(
          1,
          this.fuel - 12
        );

        this.statusText.setText(
          "ERİŞİM REDDEDİLDİ // YAKIT -12"
        );

        this.updateHUD();

        this.time.delayedCall(2300, () => {
          this.openFinalQuestion();
        });

        return;
      }

      this.fuel = Math.max(
        0,
        this.fuel - 10
      );

      this.statusText.setText(
        "YANLIŞ CEVAP // YAKIT -10"
      );
    }

    this.updateHUD();
    this.checkFailureState();

    this.time.delayedCall(2300, () => {
      if (
        !this.isGameOver &&
        !this.isMissionComplete
      ) {
        this.physics.world.resume();
      }
    });
  }

  showLargeResult(
    title,
    color,
    information = ""
  ) {
    const background = this.add.rectangle(
      270,
      480,
      500,
      information ? 250 : 130,
      0x020a03,
      0.94
    )
      .setStrokeStyle(3, 0x63ff68, 0.85)
      .setDepth(3000);

    const resultText = this.add.text(
      270,
      information ? 425 : 480,
      title,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "34px",
        color,
        align: "center",
        stroke: "#001500",
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(3001);

    const informationText = information
      ? this.add.text(
          270,
          515,
          information,
          {
            fontFamily: '"Courier New", monospace',
            fontSize: "17px",
            color: "#d8ffd7",
            align: "center",
            wordWrap: {
              width: 440
            }
          }
        )
          .setOrigin(0.5)
          .setDepth(3001)
      : null;

    this.time.delayedCall(
      information ? 2200 : 1250,
      () => {
        background.destroy();
        resultText.destroy();

        if (informationText) {
          informationText.destroy();
        }
      }
    );
  }

  clearQuestionPanel() {
    this.questionElements.forEach(
      (element) => {
        if (element && element.destroy) {
          element.destroy();
        }
      }
    );

    this.questionElements = [];
  }

  startBossPhase() {
    if (
      this.isBossPhase ||
      this.isBossEntering ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    this.isBossEntering = true;
    this.progress = 0.99;

    if (this.obstacleTimer) {
      this.obstacleTimer.paused = true;
    }

    this.obstacles.clear(true, true);
    this.pickups.clear(true, true);
    this.bossProjectiles.clear(true, true);

    this.progressText.setText(
      "ROTA: 99%"
    );

    this.statusText.setText(
      "UYARI: MERKÜR MUHAFIZI"
    );

    const warningBackground =
      this.add.rectangle(
        270,
        480,
        510,
        210,
        0x1a0301,
        0.94
      )
        .setStrokeStyle(4, 0xff4f35, 1)
        .setDepth(1500);

    const warning = this.add.text(
      270,
      480,
      "UYARI\nMERKÜR BOSSU",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "38px",
        color: "#ff684d",
        align: "center",
        stroke: "#380000",
        strokeThickness: 5
      }
    )
      .setOrigin(0.5)
      .setDepth(1501);

    this.cameras.main.flash(
      500,
      255,
      55,
      20
    );

    this.time.delayedCall(1600, () => {
      warningBackground.destroy();
      warning.destroy();
      this.spawnBoss();
    });
  }

  spawnBoss() {
    this.isBossEntering = false;
    this.isBossPhase = true;

    /*
      Oyuncu önceki mermilerini kullanmış olsa bile
      boss aşamasında en az 3 atış hakkı verilir.
    */
    if (this.ammo < 3) {
      this.ammo = 3;

      this.showLargeResult(
        "BOSS LAZERİ +3",
        "#ff79d1"
      );
    }

    this.bossBaseY = 475;

    this.boss = this.physics.add.image(
      650,
      this.bossBaseY,
      "mercury-boss"
    );

    // Boss dikey ekrana uygun biçimde küçültüldü.
    this.boss.setScale(0.145);
    this.boss.setDepth(18);
    this.boss.body.setAllowGravity(false);
    this.boss.setImmovable(true);
    this.boss.setVelocityX(-105);

    this.boss.body.setSize(
      this.boss.displayWidth * 0.68,
      this.boss.displayHeight * 0.68
    );

    this.physics.add.overlap(
      this.playerBullets,
      this.boss,
      this.handleBulletBossCollision,
      null,
      this
    );

    this.updateHUD();

    this.time.delayedCall(1500, () => {
      if (!this.boss || !this.boss.active) {
        return;
      }

      this.boss.setVelocityX(0);
      this.boss.x = 430;

      this.statusText.setText(
        "BOSS SAVAŞI // 3 İSABET"
      );

      this.startBossAttacks();
    });
  }

  startBossAttacks() {
    if (this.bossFireTimer) {
      this.bossFireTimer.remove();
    }

    this.bossFireTimer = this.time.addEvent({
      delay: 1550,
      callback: this.bossFire,
      callbackScope: this,
      loop: true
    });
  }

  bossFire() {
    if (
      !this.isBossPhase ||
      this.isQuestionOpen ||
      !this.boss ||
      !this.boss.active
    ) {
      return;
    }

    const projectile =
      this.bossProjectiles.create(
        this.boss.x -
          this.boss.displayWidth * 0.35,
        this.boss.y +
          Phaser.Math.Between(-22, 22),
        "mercury-boss-projectile"
      );

    projectile.setScale(0.33);
    projectile.setVelocityX(
      Phaser.Math.Between(-325, -275)
    );
    projectile.body.setAllowGravity(false);
    projectile.setData("hitPlayer", false);
  }

  handleBulletBossCollision(
    laser,
    boss
  ) {
    if (
      !this.isBossPhase ||
      this.isQuestionOpen ||
      !laser.active ||
      laser.getData("hit")
    ) {
      return;
    }

    laser.setData("hit", true);
    laser.destroy();

    this.bossHits += 1;
    this.score += 300;

    boss.setTint(0xffffff);
    this.cameras.main.shake(170, 0.015);

    this.time.delayedCall(130, () => {
      if (boss.active) {
        boss.clearTint();
      }
    });

    if (this.bossHits === 1) {
      boss.setTexture(
        "mercury-boss-damage-01"
      );

      this.statusText.setText(
        "BOSS HASARI: 1 / 3"
      );
    }

    if (this.bossHits === 2) {
      boss.setTexture(
        "mercury-boss-damage-02"
      );

      this.statusText.setText(
        "BOSS HASARI: 2 / 3"
      );
    }

    if (
      this.bossHits >=
      this.bossRequiredHits
    ) {
      this.statusText.setText(
        "BOSS SAVUNMASI KIRILDI"
      );

      if (this.bossFireTimer) {
        this.bossFireTimer.paused = true;
      }

      this.bossProjectiles.clear(true, true);

      this.time.delayedCall(600, () => {
        this.openFinalQuestion();
      });
    }

    this.updateHUD();
  }

  handleBossProjectilePlayerCollision(
    player,
    projectile
  ) {
    if (
      projectile.getData("hitPlayer") ||
      this.isQuestionOpen ||
      this.isGameOver
    ) {
      return;
    }

    projectile.setData("hitPlayer", true);
    projectile.destroy();

    this.shield = Math.max(
      0,
      this.shield - 16
    );

    this.statusText.setText(
      "BOSS SALDIRISI // KALKAN -16"
    );

    this.cameras.main.shake(180, 0.014);
    this.player.setTint(0xff4545);

    this.time.delayedCall(180, () => {
      if (this.player.active) {
        this.player.clearTint();
      }
    });

    this.updateHUD();
    this.checkFailureState();
  }

  handleBulletBossProjectileCollision(
    laser,
    projectile
  ) {
    if (
      !laser.active ||
      !projectile.active
    ) {
      return;
    }

    laser.destroy();
    projectile.destroy();

    this.score += 35;

    this.statusText.setText(
      "BOSS ATIŞI ENGELLENDİ"
    );

    this.updateHUD();
  }

  completeBossBattle() {
    this.physics.world.resume();

    if (this.bossFireTimer) {
      this.bossFireTimer.remove();
      this.bossFireTimer = null;
    }

    this.bossProjectiles.clear(true, true);

    if (this.boss && this.boss.active) {
      this.tweens.add({
        targets: this.boss,
        alpha: 0,
        angle: 25,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 900,
        ease: "Power2",
        onComplete: () => {
          if (this.boss) {
            this.boss.destroy();
          }
        }
      });
    }

    this.isBossPhase = false;

    this.statusText.setText(
      "MERKÜR YÖRÜNGESİNE GİRİLİYOR"
    );

    this.time.delayedCall(1100, () => {
      this.showMercuryArrival();
    });
  }

  showMercuryArrival() {
    /*
      Merkür görsel dosyası gerektirmeyen
      kod tabanlı gezegen görünümü.
    */

    const mercuryGlow = this.add.circle(
      680,
      470,
      155,
      0xff8a42,
      0.17
    ).setDepth(300);

    const mercury = this.add.circle(
      680,
      470,
      125,
      0xa66345,
      1
    )
      .setStrokeStyle(5, 0xe69a6a, 0.9)
      .setDepth(301);

    const crater1 = this.add.circle(
      650,
      430,
      22,
      0x74432f,
      0.65
    ).setDepth(302);

    const crater2 = this.add.circle(
      720,
      495,
      30,
      0x70402e,
      0.6
    ).setDepth(302);

    const crater3 = this.add.circle(
      635,
      530,
      15,
      0x7a4934,
      0.7
    ).setDepth(302);

    this.tweens.add({
      targets: [
        mercuryGlow,
        mercury,
        crater1,
        crater2,
        crater3
      ],
      x: "-=420",
      duration: 1900,
      ease: "Power2",
      onComplete: () => {
        this.time.delayedCall(850, () => {
          this.completeMission();
        });
      }
    });
  }

  completeMission() {
    if (this.isMissionComplete) {
      return;
    }

    this.isMissionComplete = true;
    this.physics.world.pause();

    this.score += Math.ceil(this.fuel) * 10;

    localStorage.setItem(
      "kozmikRotaMercuryCompleted",
      "true"
    );

    const overlay = this.add.rectangle(
      270,
      480,
      540,
      960,
      0x010501,
      0.91
    ).setDepth(5000);

    const title = this.add.text(
      270,
      260,
      "MERKÜR’E ULAŞILDI",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "32px",
        color: "#ffb06b",
        align: "center",
        stroke: "#351300",
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(5001);

    const endText = this.add.text(
      270,
      325,
      "BÖLÜM SONU",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "29px",
        color: "#b7ffb2"
      }
    )
      .setOrigin(0.5)
      .setDepth(5001);

    const results = this.add.text(
      270,
      500,
      [
        `YAKIT: ${Math.ceil(this.fuel)}%`,
        `KALKAN: ${Math.ceil(this.shield)}%`,
        `DOĞRU: ${this.correctAnswers}`,
        `YANLIŞ: ${this.wrongAnswers}`,
        `SKOR: ${this.score}`
      ].join("\n"),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "21px",
        color: "#7cff7a",
        align: "center",
        lineSpacing: 14
      }
    )
      .setOrigin(0.5)
      .setDepth(5001);

    const restartButton = this.add.rectangle(
      270,
      740,
      300,
      74,
      0x0b2b0e,
      1
    )
      .setStrokeStyle(3, 0x7cff7a, 1)
      .setInteractive({
        useHandCursor: true
      })
      .setDepth(5001);

    const restartText = this.add.text(
      270,
      740,
      "TEKRAR OYNA",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "21px",
        color: "#b7ffb2"
      }
    )
      .setOrigin(0.5)
      .setDepth(5002);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
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
    this.keepPlayerInsideScreen();
    this.cleanupObjects();

    if (this.isBossPhase) {
      this.updateBossMovement(time);
      this.updateHUD();
      return;
    }

    if (this.isBossEntering) {
      return;
    }

    this.missionElapsed += delta / 1000;

    this.fuel = Math.max(
      0,
      this.fuel -
        (delta / 1000) * 0.34
    );

    /*
      Normal rota en fazla %99 gösterir.
      110. saniyede boss kesin olarak başlar.
    */
    this.progress = Phaser.Math.Clamp(
      this.missionElapsed /
        this.bossStartTime,
      0,
      0.99
    );

    this.progressText.setText(
      `ROTA: ${Math.min(
        99,
        Math.floor(this.progress * 100)
      )}%`
    );

    this.checkPickupSchedule();
    this.updateHUD();
    this.checkFailureState();

    if (
      this.missionElapsed >=
        this.bossStartTime &&
      !this.isBossPhase &&
      !this.isBossEntering
    ) {
      this.startBossPhase();
    }
  }

  updateStars(delta) {
    const multiplier = delta / 16.67;

    this.stars.forEach((star) => {
      star.x -=
        star.speed * multiplier;

      if (star.x < -5) {
        star.x = 545;
        star.y = Phaser.Math.Between(
          145,
          940
        );
      }
    });
  }

  updateBossMovement(time) {
    if (
      !this.boss ||
      !this.boss.active ||
      this.isQuestionOpen
    ) {
      return;
    }

    this.boss.y =
      this.bossBaseY +
      Math.sin(time * 0.0024) * 100;
  }

  handleKeyboardMovement(delta) {
    if (
      !this.player ||
      !this.cursors
    ) {
      return;
    }

    const speed = delta * 0.39;

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    }

    if (this.cursors.down.isDown) {
      this.player.y += speed;
    }
  }

  keepPlayerInsideScreen() {
    if (!this.player) {
      return;
    }

    const halfHeight =
      this.player.displayHeight / 2;

    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      160 + halfHeight,
      900 - halfHeight
    );

    this.player.x = 105;
  }

  cleanupObjects() {
    this.obstacles
      .getChildren()
      .forEach((object) => {
        if (
          object.x < -150 ||
          object.y > 1100
        ) {
          object.destroy();
        }
      });

    this.pickups
      .getChildren()
      .forEach((object) => {
        if (object.x < -120) {
          object.destroy();
        }
      });

    this.playerBullets
      .getChildren()
      .forEach((object) => {
        if (object.x > 650) {
          object.destroy();
        }
      });

    this.bossProjectiles
      .getChildren()
      .forEach((object) => {
        if (object.x < -100) {
          object.destroy();
        }
      });
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
      220 *
      Phaser.Math.Clamp(
        this.fuel / 100,
        0,
        1
      );

    this.shieldBar.width =
      220 *
      Phaser.Math.Clamp(
        this.shield / 100,
        0,
        1
      );

    if (this.fuel <= 25) {
      this.fuelText.setColor("#ff5e57");
      this.fuelBar.setFillStyle(0xff5e57);
    } else {
      this.fuelText.setColor("#ffe066");
      this.fuelBar.setFillStyle(0xffe066);
    }

    if (this.shield <= 25) {
      this.shieldText.setColor("#ff5e57");
      this.shieldBar.setFillStyle(0xff5e57);
    } else {
      this.shieldText.setColor("#61dafb");
      this.shieldBar.setFillStyle(0x61dafb);
    }
  }

  checkFailureState() {
    if (
      this.fuel > 0 &&
      this.shield > 0
    ) {
      return;
    }

    if (!this.emergencyUsed) {
      this.emergencyUsed = true;
      this.fuel = 25;
      this.shield = 30;

      this.showLargeResult(
        "ACİL ENERJİ",
        "#ffdf63"
      );

      this.statusText.setText(
        "ACİL SİSTEM DEVREDE"
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
    this.physics.world.pause();

    if (this.bossFireTimer) {
      this.bossFireTimer.paused = true;
    }

    this.add.rectangle(
      270,
      480,
      540,
      960,
      0x010501,
      0.95
    ).setDepth(6000);

    this.add.text(
      270,
      380,
      "GÖREV BAŞARISIZ",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "34px",
        color: "#ff5d55"
      }
    )
      .setOrigin(0.5)
      .setDepth(6001);

    const restartButton = this.add.rectangle(
      270,
      565,
      340,
      76,
      0x0b2b0e,
      1
    )
      .setStrokeStyle(3, 0x7cff7a, 1)
      .setInteractive({
        useHandCursor: true
      })
      .setDepth(6001);

    this.add.text(
      270,
      565,
      "GÖREVİ YENİDEN BAŞLAT",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "18px",
        color: "#b7ffb2"
      }
    )
      .setOrigin(0.5)
      .setDepth(6002);

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