class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

    // Ana nesneler
    this.player = null;
    this.boss = null;

    // Phaser grupları
    this.obstacles = null;
    this.pickups = null;
    this.playerBullets = null;
    this.bossProjectiles = null;

    // Arka plan
    this.stars = [];

    // Kontrol
    this.dragging = false;
    this.lastPointerY = 0;
    this.cursors = null;

    // Oyuncu kaynakları
    this.fuel = 100;
    this.shield = 100;
    this.ammo = 0;
    this.score = 0;

    // Görev
    this.missionDuration = 120;
    this.missionElapsed = 0;
    this.progress = 0;

    // Durumlar
    this.isQuestionOpen = false;
    this.isGameOver = false;
    this.isMissionComplete = false;
    this.isBossPhase = false;
    this.isBossEntering = false;
    this.isFinalQuestion = false;
    this.emergencyEnergyUsed = false;

    // Ateş sistemi
    this.lastShotTime = 0;
    this.shotCooldown = 250;

    // Boss
    this.bossHits = 0;
    this.bossRequiredHits = 3;
    this.bossFireTimer = null;
    this.bossBaseY = 0;

    // Soru istatistikleri
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.currentQuestionPool = [];
    this.finalQuestionPool = [];

    // Pickup planı
    this.pickupSchedule = [];
    this.nextPickupIndex = 0;

    // UI
    this.questionElements = [];
    this.endScreenElements = [];
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

    this.load.image(
      "mercury",
      "assets/planets/mercury.png"
    );
  }

  create() {
    this.resetGameValues();

    this.cameras.main.setBackgroundColor("#020805");

    this.createStarField();
    this.createGroups();
    this.prepareQuestions();
    this.preparePickupSchedule();
    this.createPlayer();
    this.createHUD();
    this.createFireButton();
    this.createInputControls();
    this.createObstacleTimer();

    this.statusText.setText("DÜNYA ÜSSÜNDEN ÇIKIŞ YAPILDI");
  }

  resetGameValues() {
    this.fuel = 100;
    this.shield = 100;
    this.ammo = 0;
    this.score = 0;

    this.missionElapsed = 0;
    this.progress = 0;

    this.isQuestionOpen = false;
    this.isGameOver = false;
    this.isMissionComplete = false;
    this.isBossPhase = false;
    this.isBossEntering = false;
    this.isFinalQuestion = false;
    this.emergencyEnergyUsed = false;

    this.lastShotTime = 0;

    this.boss = null;
    this.bossHits = 0;

    this.correctAnswers = 0;
    this.wrongAnswers = 0;

    this.nextPickupIndex = 0;
    this.questionElements = [];
    this.endScreenElements = [];
  }

  createStarField() {
    this.stars = [];

    for (let i = 0; i < 130; i++) {
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
    this.playerBullets = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();
  }

  preparePickupSchedule() {
    // Toplam 6 pickup:
    // 3 silah ve 3 enerji.
    // Enerji soruları arka arkaya gelmez.
    this.pickupSchedule = [
      { time: 15, type: "weapon", spawned: false },
      { time: 30, type: "energy", spawned: false },
      { time: 48, type: "weapon", spawned: false },
      { time: 65, type: "energy", spawned: false },
      { time: 82, type: "weapon", spawned: false },
      { time: 100, type: "energy", spawned: false }
    ];
  }

  prepareQuestions() {
    this.mercuryQuestions = [
      {
        id: "mercury-01",
        category: "science",
        question: "Merkür, Güneş’e en yakın kaçıncı gezegendir?",
        answers: ["Birinci", "İkinci", "Üçüncü"],
        correctIndex: 0,
        information:
          "Merkür, Güneş Sistemi’nde Güneş’e en yakın gezegendir."
      },
      {
        id: "mercury-02",
        category: "science",
        question:
          "Merkür’ün Güneş çevresindeki bir turu yaklaşık kaç Dünya günü sürer?",
        answers: ["88 gün", "365 gün", "687 gün"],
        correctIndex: 0,
        information:
          "Merkür, Güneş çevresindeki turunu yaklaşık 88 Dünya gününde tamamlar."
      },
      {
        id: "mercury-03",
        category: "science",
        question:
          "Güneş Sistemi’nin en küçük gezegeni hangisidir?",
        answers: ["Merkür", "Mars", "Venüs"],
        correctIndex: 0,
        information:
          "Merkür, Güneş Sistemi’nin en küçük gezegenidir."
      },
      {
        id: "mercury-04",
        category: "science",
        question: "Merkür’ün atmosferi nasıldır?",
        answers: ["Çok ince", "Çok yoğun", "Dünya ile aynı"],
        correctIndex: 0,
        information:
          "Merkür’ün yoğun bir atmosferi yoktur; çok ince bir ekzosferi vardır."
      },
      {
        id: "mercury-05",
        category: "science",
        question:
          "Merkür’ün yüzeyi en çok hangi gök cismini andırır?",
        answers: ["Ay", "Jüpiter", "Satürn"],
        correctIndex: 0,
        information:
          "Merkür’ün yüzeyi çok sayıdaki krateri nedeniyle Ay’a benzer."
      },
      {
        id: "mercury-06",
        category: "mythology",
        question:
          "Merkür gezegeni adını hangi mitolojideki tanrıdan alır?",
        answers: ["Roma", "Mısır", "İskandinav"],
        correctIndex: 0,
        information:
          "Merkür adı, Roma mitolojisindeki Mercurius’tan gelir."
      },
      {
        id: "mercury-07",
        category: "mythology",
        question:
          "Roma mitolojisindeki Merkür en çok hangi göreviyle bilinir?",
        answers: [
          "Tanrıların habercisi",
          "Denizlerin tanrısı",
          "Yeraltı dünyasının kralı"
        ],
        correctIndex: 0,
        information:
          "Merkür, Roma mitolojisinde tanrıların hızlı habercisidir."
      },
      {
        id: "mercury-08",
        category: "mythology",
        question:
          "Roma mitolojisindeki Merkür’ün Yunan karşılığı kimdir?",
        answers: ["Hermes", "Ares", "Poseidon"],
        correctIndex: 0,
        information:
          "Merkür’ün Yunan mitolojisindeki karşılığı Hermes’tir."
      },
      {
        id: "mercury-09",
        category: "mythology",
        question:
          "Merkür ve Hermes en çok hangi özelliklerle ilişkilendirilir?",
        answers: [
          "Hız ve haberleşme",
          "Tarım ve hasat",
          "Deniz ve fırtına"
        ],
        correctIndex: 0,
        information:
          "Merkür ve Hermes hız, yolculuk, ticaret ve haberleşmeyle ilişkilendirilir."
      }
    ];

    this.currentQuestionPool = Phaser.Utils.Array.Shuffle([
      ...this.mercuryQuestions
    ]).slice(0, 3);

    this.finalQuestionPool = Phaser.Utils.Array.Shuffle([
      {
        id: "final-01",
        question:
          "Merkür neden gökyüzünde Güneş’ten çok uzak görünmez?",
        answers: [
          "Güneş’e en yakın gezegen olduğu için",
          "Dünya’nın uydusu olduğu için",
          "Işık üretmediği için"
        ],
        correctIndex: 0,
        information:
          "Merkür Güneş’e çok yakın yörüngede bulunduğu için gökyüzünde Güneş’ten fazla uzaklaşmaz."
      },
      {
        id: "final-02",
        question:
          "Merkür’ün yüzeyinde çok sayıda krater bulunmasının temel nedeni nedir?",
        answers: [
          "Yoğun atmosferinin olmaması",
          "Büyük okyanuslarının olması",
          "Sürekli yağmur yağması"
        ],
        correctIndex: 0,
        information:
          "Merkür’ün yoğun bir atmosferi olmadığı için birçok göktaşı yüzeye ulaşabilir."
      },
      {
        id: "final-03",
        question:
          "Roma mitolojisindeki Merkür neden hızlı bir tanrı olarak anlatılır?",
        answers: [
          "Tanrıların habercisi olduğu için",
          "Denizleri yönettiği için",
          "Dağları yarattığı için"
        ],
        correctIndex: 0,
        information:
          "Merkür, tanrıların mesajlarını taşıyan hızlı haberci olarak kabul edilir."
      }
    ]);
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

    // Araç görseli sola bakıyorsa aç:
    // this.player.setFlipX(true);

    this.player.body.setSize(
      this.player.displayWidth * 0.68,
      this.player.displayHeight * 0.52
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
      this.playerBullets,
      this.obstacles,
      this.handleBulletObstacleCollision,
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

    this.physics.add.overlap(
      this.player,
      this.bossProjectiles,
      this.handleBossProjectilePlayerCollision,
      null,
      this
    );
  }

  createHUD() {
    const titleStyle = {
      fontFamily: '"Courier New", monospace',
      fontSize: "20px",
      color: "#b7ffb2",
      stroke: "#002b00",
      strokeThickness: 2
    };

    const hudStyle = {
      fontFamily: '"Courier New", monospace',
      fontSize: "15px",
      color: "#7cff7a"
    };

    this.hudBackground = this.add.rectangle(
      this.scale.width / 2,
      64,
      this.scale.width - 20,
      112,
      0x031006,
      0.92
    );

    this.hudBackground.setStrokeStyle(
      2,
      0x35ff35,
      0.85
    );

    this.titleText = this.add.text(
      18,
      14,
      "KOZMİK ROTA // MERKÜR",
      titleStyle
    );

    this.fuelText = this.add.text(
      18,
      48,
      "YAKIT: 100%",
      hudStyle
    );

    this.shieldText = this.add.text(
      190,
      48,
      "KALKAN: 100%",
      hudStyle
    );

    this.ammoText = this.add.text(
      390,
      48,
      "LAZER: 0",
      hudStyle
    );

    this.progressText = this.add.text(
      18,
      75,
      "ROTA: 0%",
      hudStyle
    );

    this.scoreText = this.add.text(
      390,
      75,
      "SKOR: 0",
      hudStyle
    );

    this.fuelBarBackground = this.add.rectangle(
      18,
      102,
      220,
      7,
      0x123814
    ).setOrigin(0, 0.5);

    this.fuelBar = this.add.rectangle(
      18,
      102,
      220,
      7,
      0x7cff7a
    ).setOrigin(0, 0.5);

    this.shieldBarBackground = this.add.rectangle(
      302,
      102,
      220,
      7,
      0x123814
    ).setOrigin(0, 0.5);

    this.shieldBar = this.add.rectangle(
      302,
      102,
      220,
      7,
      0x7cff7a
    ).setOrigin(0, 0.5);

    this.statusText = this.add.text(
      this.scale.width / 2,
      132,
      "SİSTEMLER AKTİF",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "15px",
        color: "#b7ffb2",
        align: "center"
      }
    );

    this.statusText.setOrigin(0.5);
  }

  createFireButton() {
    this.fireButton = this.add.circle(
      this.scale.width - 72,
      this.scale.height - 78,
      49,
      0x0a2a0d,
      0.92
    );

    this.fireButton.setStrokeStyle(
      3,
      0x7cff7a,
      0.95
    );

    this.fireButton.setInteractive({
      useHandCursor: true
    });

    this.fireButtonText = this.add.text(
      this.fireButton.x,
      this.fireButton.y,
      "ATEŞ",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "17px",
        color: "#b7ffb2"
      }
    );

    this.fireButtonText.setOrigin(0.5);

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

      const distanceToFireButton =
        Phaser.Math.Distance.Between(
          pointer.x,
          pointer.y,
          this.fireButton.x,
          this.fireButton.y
        );

      if (distanceToFireButton < 75) {
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

  createObstacleTimer() {
    this.obstacleTimer = this.time.addEvent({
      delay: 1450,
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

    const textureKey =
      Phaser.Math.Between(0, 1) === 0
        ? "asteroid-01"
        : "asteroid-02";

    const obstacle = this.obstacles.create(
      this.scale.width + 90,
      Phaser.Math.Between(
        175,
        this.scale.height - 135
      ),
      textureKey
    );

    obstacle.setScale(
      textureKey === "asteroid-01"
        ? Phaser.Math.FloatBetween(0.11, 0.17)
        : Phaser.Math.FloatBetween(0.10, 0.16)
    );

    obstacle.setVelocityX(
      Phaser.Math.Between(-215, -150)
    );

    obstacle.setAngularVelocity(
      Phaser.Math.Between(-65, 65)
    );

    obstacle.body.setAllowGravity(false);

    obstacle.setData("isFalling", false);
    obstacle.setData("isDestroyed", false);
    obstacle.setData("hasHitPlayer", false);

    obstacle.body.setSize(
      obstacle.displayWidth * 0.72,
      obstacle.displayHeight * 0.72
    );
  }

  checkPickupSchedule() {
    if (
      this.isBossPhase ||
      this.isBossEntering ||
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    while (
      this.nextPickupIndex < this.pickupSchedule.length &&
      this.missionElapsed >=
        this.pickupSchedule[this.nextPickupIndex].time
    ) {
      const scheduledPickup =
        this.pickupSchedule[this.nextPickupIndex];

      if (!scheduledPickup.spawned) {
        scheduledPickup.spawned = true;

        if (scheduledPickup.type === "energy") {
          this.spawnEnergyPickup();
        } else {
          this.spawnWeaponPickup();
        }
      }

      this.nextPickupIndex += 1;
    }
  }

  spawnEnergyPickup() {
    const pickup = this.pickups.create(
      this.scale.width + 70,
      Phaser.Math.Between(
        200,
        this.scale.height - 180
      ),
      "energy-icon"
    );

    pickup.setScale(0.12);
    pickup.setVelocityX(-135);
    pickup.body.setAllowGravity(false);
    pickup.setData("type", "energy");
  }

  spawnWeaponPickup() {
    const pickup = this.pickups.create(
      this.scale.width + 70,
      Phaser.Math.Between(
        200,
        this.scale.height - 180
      ),
      "weapon-icon"
    );

    pickup.setScale(0.12);
    pickup.setVelocityX(-145);
    pickup.body.setAllowGravity(false);
    pickup.setData("type", "weapon");
  }

  fireLaser() {
    if (
      this.isQuestionOpen ||
      this.isGameOver ||
      this.isMissionComplete
    ) {
      return;
    }

    if (this.ammo <= 0) {
      this.statusText.setText("LAZER CEPHANESİ YOK");
      return;
    }

    const currentTime = this.time.now;

    if (
      currentTime - this.lastShotTime <
      this.shotCooldown
    ) {
      return;
    }

    this.lastShotTime = currentTime;
    this.ammo -= 1;

    const bullet = this.playerBullets.create(
      this.player.x +
        this.player.displayWidth * 0.45,
      this.player.y,
      "laser-shot"
    );

    bullet.setScale(0.45);
    bullet.body.setAllowGravity(false);
    bullet.setVelocityX(570);
    bullet.setData("hasHit", false);

    this.updateHUD();
  }

  handleBulletObstacleCollision(bullet, obstacle) {
    if (
      !bullet.active ||
      !obstacle.active ||
      bullet.getData("hasHit") ||
      obstacle.getData("isDestroyed")
    ) {
      return;
    }

    bullet.setData("hasHit", true);
    bullet.destroy();

    obstacle.setData("isDestroyed", true);
    obstacle.setData("isFalling", true);

    obstacle.setTint(0xff6c32);

    obstacle.setVelocityX(
      Phaser.Math.Between(-50, 20)
    );

    obstacle.setVelocityY(
      Phaser.Math.Between(280, 390)
    );

    obstacle.setAngularVelocity(
      Phaser.Math.Between(-320, 320)
    );

    this.score += 150;
    this.statusText.setText("METEOR HASAR ALDI");

    this.cameras.main.flash(
      90,
      255,
      110,
      35
    );

    this.time.delayedCall(180, () => {
      if (obstacle.active) {
        obstacle.clearTint();
      }
    });

    this.updateHUD();
  }

  handlePlayerObstacleCollision(player, obstacle) {
    if (
      obstacle.getData("hasHitPlayer") ||
      obstacle.getData("isFalling") ||
      obstacle.getData("isDestroyed") ||
      this.isQuestionOpen ||
      this.isGameOver
    ) {
      return;
    }

    obstacle.setData("hasHitPlayer", true);
    obstacle.destroy();

    this.shield = Math.max(
      0,
      this.shield - 20
    );

    this.statusText.setText(
      "UYARI: KALKAN HASARI"
    );

    this.cameras.main.shake(
      170,
      0.012
    );

    this.player.setTint(0xff5555);

    this.time.delayedCall(180, () => {
      if (this.player.active) {
        this.player.clearTint();
      }
    });

    this.updateHUD();
    this.checkFailureState();
  }

  handlePickupCollision(player, pickup) {
    const pickupType = pickup.getData("type");

    pickup.destroy();

    if (pickupType === "energy") {
      this.openNormalQuestion();
      return;
    }

    if (pickupType === "weapon") {
      this.ammo = Math.min(
        30,
        this.ammo + 10
      );

      this.score += 100;

      this.statusText.setText(
        "LAZER MODÜLÜ ALINDI: +10"
      );

      this.updateHUD();
    }
  }

  openNormalQuestion() {
    if (
      this.isQuestionOpen ||
      this.currentQuestionPool.length === 0
    ) {
      return;
    }

    const question =
      this.currentQuestionPool.shift();

    this.openQuestionPanel(
      question,
      false
    );
  }

  openFinalQuestion() {
    this.isFinalQuestion = true;

    if (this.finalQuestionPool.length === 0) {
      this.prepareQuestions();
    }

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

    const shuffledAnswers = question.answers
      .map((answer, index) => ({
        answer,
        isCorrect:
          index === question.correctIndex
      }))
      .sort(() => Math.random() - 0.5);

    this.questionElements = [];

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.95
    );

    overlay.setDepth(2000);

    const panel = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width - 46,
      590,
      0x061408,
      1
    );

    panel
      .setStrokeStyle(
        3,
        isFinal ? 0xff8a32 : 0x7cff7a,
        1
      )
      .setDepth(2001);

    const header = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 245,
      isFinal
        ? "MERKÜR ERİŞİM PROTOKOLÜ"
        : "ENERJİ TERMİNALİ // MERKÜR",
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "20px",
        color: isFinal
          ? "#ffb06b"
          : "#b7ffb2",
        align: "center",
        wordWrap: {
          width: this.scale.width - 90
        }
      }
    );

    header
      .setOrigin(0.5)
      .setDepth(2002);

    const questionText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 145,
      question.question,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: "22px",
        color: "#7cff7a",
        align: "center",
        wordWrap: {
          width: this.scale.width - 95
        }
      }
    );

    questionText
      .setOrigin(0.5)
      .setDepth(2002);

    this.questionElements.push(
      overlay,
      panel,
      header,
      questionText
    );

    shuffledAnswers.forEach(
      (answerData, index) => {
        const y =
          this.scale.height / 2 -
          10 +
          index * 105;

        const answerBackground =
          this.add.rectangle(
            this.scale.width / 2,
            y,
            this.scale.width - 90,
            72,
            0x0a2710,
            1
          );

        answerBackground
          .setStrokeStyle(
            2,
            0x4cff54,
            0.9
          )
          .setDepth(2002)
          .setInteractive({
            useHandCursor: true
          });

        const answerText = this.add.text(
          this.scale.width / 2,
          y,
          answerData.answer,
          {
            fontFamily:
              '"Courier New", monospace',
            fontSize: "20px",
            color: "#b7ffb2",
            align: "center",
            wordWrap: {
              width:
                this.scale.width - 125
            }
          }
        );

        answerText
          .setOrigin(0.5)
          .setDepth(2003);

        answerBackground.on(
          "pointerdown",
          () => {
            this.answerQuestion(
              answerData.isCorrect,
              question.information,
              isFinal
            );
          }
        );

        this.questionElements.push(
          answerBackground,
          answerText
        );
      }
    );
  }

  answerQuestion(
    isCorrect,
    information,
    isFinal
  ) {
    this.clearQuestionPanel();

    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += isFinal ? 500 : 250;

      if (isFinal) {
        this.statusText.setText(
          "ERİŞİM ONAYLANDI"
        );

        this.isQuestionOpen = false;
        this.isFinalQuestion = false;

        this.showInformationMessage(
          information,
          () => {
            this.defeatBossAndReachMercury();
          }
        );

        return;
      }

      this.fuel = Math.min(
        100,
        this.fuel + 20
      );

      this.statusText.setText(
        "DOĞRU CEVAP // YAKIT +20"
      );
    } else {
      this.wrongAnswers += 1;

      if (isFinal) {
        this.fuel = Math.max(
          1,
          this.fuel - 15
        );

        this.statusText.setText(
          "ERİŞİM REDDEDİLDİ // YAKIT -15"
        );

        this.isQuestionOpen = false;

        this.showInformationMessage(
          information,
          () => {
            this.openFinalQuestion();
          }
        );

        this.updateHUD();
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

    this.isQuestionOpen = false;
    this.physics.world.resume();

    if (this.bossFireTimer) {
      this.bossFireTimer.paused = false;
    }

    this.updateHUD();
    this.checkFailureState();

    this.showInformationMessage(
      information
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

  showInformationMessage(
    information,
    onComplete = null
  ) {
    const informationText =
      this.add.text(
        this.scale.width / 2,
        this.scale.height * 0.72,
        information,
        {
          fontFamily:
            '"Courier New", monospace',
          fontSize: "17px",
          color: "#b7ffb2",
          backgroundColor: "#031006",
          padding: {
            x: 14,
            y: 12
          },
          align: "center",
          wordWrap: {
            width:
              this.scale.width - 70
          }
        }
      );

    informationText
      .setOrigin(0.5)
      .setDepth(2500);

    this.time.delayedCall(
      2600,
      () => {
        informationText.destroy();

        if (onComplete) {
          onComplete();
        }
      }
    );
  }

  startBossPhase() {
    if (
      this.isBossPhase ||
      this.isBossEntering ||
      this.isMissionComplete ||
      this.isGameOver
    ) {
      return;
    }

    this.isBossEntering = true;

    this.missionElapsed =
      this.missionDuration * 0.99;

    this.progress = 0.99;

    if (this.obstacleTimer) {
      this.obstacleTimer.paused = true;
    }

    this.obstacles.clear(
      true,
      true
    );

    this.pickups.clear(
      true,
      true
    );

    this.bossProjectiles.clear(
      true,
      true
    );

    this.statusText.setText(
      "UYARI: MERKÜR MUHAFIZI YAKLAŞIYOR"
    );

    const warning = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "WARNING\nMERCURY BOSS",
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "35px",
        color: "#ff643d",
        align: "center",
        stroke: "#300000",
        strokeThickness: 5
      }
    );

    warning
      .setOrigin(0.5)
      .setDepth(1500);

    this.cameras.main.flash(
      450,
      255,
      70,
      25
    );

    this.time.delayedCall(
      1800,
      () => {
        warning.destroy();
        this.spawnBoss();
      }
    );
  }

  spawnBoss() {
    this.isBossEntering = false;
    this.isBossPhase = true;

    // Oyuncu bossu bitirebilsin diye
    // en az 3 atış garanti edilir.
    if (this.ammo < 3) {
      this.ammo = 3;

      this.statusText.setText(
        "ACİL LAZER DESTEĞİ: 3 ATIŞ"
      );
    }

    this.bossBaseY =
      this.scale.height * 0.48;

    this.boss = this.physics.add.image(
      this.scale.width + 170,
      this.bossBaseY,
      "mercury-boss"
    );

    this.boss.setScale(0.25);
    this.boss.body.setAllowGravity(false);
    this.boss.setImmovable(true);

    this.boss.setVelocityX(-95);

    this.boss.body.setSize(
      this.boss.displayWidth * 0.72,
      this.boss.displayHeight * 0.72
    );

    this.physics.add.overlap(
      this.playerBullets,
      this.boss,
      this.handleBulletBossCollision,
      null,
      this
    );

    this.updateHUD();

    this.time.delayedCall(
      1700,
      () => {
        if (!this.boss || !this.boss.active) {
          return;
        }

        this.boss.setVelocityX(0);
        this.boss.x =
          this.scale.width - 115;

        this.statusText.setText(
          "BOSS SAVAŞI // 3 İSABET GEREKLİ"
        );

        this.startBossAttacks();
      }
    );
  }

  startBossAttacks() {
    if (this.bossFireTimer) {
      this.bossFireTimer.remove();
    }

    this.bossFireTimer =
      this.time.addEvent({
        delay: 1450,
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
          Phaser.Math.Between(-25, 25),
        "mercury-boss-projectile"
      );

    projectile.setScale(0.42);
    projectile.body.setAllowGravity(false);
    projectile.setVelocityX(
      Phaser.Math.Between(-330, -270)
    );

    projectile.setData(
      "hasHitPlayer",
      false
    );
  }

  handleBulletBossCollision(
    bullet,
    boss
  ) {
    if (
      !this.isBossPhase ||
      this.isQuestionOpen ||
      !bullet.active ||
      bullet.getData("hasHit")
    ) {
      return;
    }

    bullet.setData("hasHit", true);
    bullet.destroy();

    this.bossHits += 1;
    this.score += 300;

    this.cameras.main.shake(
      160,
      0.014
    );

    boss.setTint(0xffffff);

    this.time.delayedCall(
      120,
      () => {
        if (boss.active) {
          boss.clearTint();
        }
      }
    );

    if (this.bossHits === 1) {
      boss.setTexture(
        "mercury-boss-damage-01"
      );

      this.statusText.setText(
        "BOSS HASARI: 1 / 3"
      );
    } else if (this.bossHits === 2) {
      boss.setTexture(
        "mercury-boss-damage-02"
      );

      this.statusText.setText(
        "BOSS HASARI: 2 / 3"
      );
    } else if (
      this.bossHits >=
      this.bossRequiredHits
    ) {
      this.statusText.setText(
        "BOSS SAVUNMASI KIRILDI"
      );

      if (this.bossFireTimer) {
        this.bossFireTimer.paused = true;
      }

      this.bossProjectiles.clear(
        true,
        true
      );

      this.time.delayedCall(
        650,
        () => {
          this.openFinalQuestion();
        }
      );
    }

    this.updateHUD();
  }

  handleBossProjectilePlayerCollision(
    player,
    projectile
  ) {
    if (
      projectile.getData(
        "hasHitPlayer"
      ) ||
      this.isQuestionOpen ||
      this.isGameOver
    ) {
      return;
    }

    projectile.setData(
      "hasHitPlayer",
      true
    );

    projectile.destroy();

    this.shield = Math.max(
      0,
      this.shield - 18
    );

    this.statusText.setText(
      "BOSS SALDIRISI // KALKAN -18"
    );

    this.cameras.main.shake(
      180,
      0.015
    );

    this.player.setTint(0xff3d35);

    this.time.delayedCall(
      180,
      () => {
        if (this.player.active) {
          this.player.clearTint();
        }
      }
    );

    this.updateHUD();
    this.checkFailureState();
  }

  handleBulletBossProjectileCollision(
    bullet,
    projectile
  ) {
    if (
      !bullet.active ||
      !projectile.active
    ) {
      return;
    }

    bullet.destroy();
    projectile.destroy();

    this.score += 30;
    this.statusText.setText(
      "BOSS MERMİSİ ENGELLENDİ"
    );

    this.updateHUD();
  }

  defeatBossAndReachMercury() {
    this.physics.world.resume();

    if (this.bossFireTimer) {
      this.bossFireTimer.remove();
      this.bossFireTimer = null;
    }

    this.bossProjectiles.clear(
      true,
      true
    );

    if (this.boss && this.boss.active) {
      this.tweens.add({
        targets: this.boss,
        alpha: 0,
        scaleX:
          this.boss.scaleX * 1.3,
        scaleY:
          this.boss.scaleY * 1.3,
        angle: 30,
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

    this.time.delayedCall(
      1000,
      () => {
        this.showMercuryArrival();
      }
    );
  }

  showMercuryArrival() {
    this.obstacles.clear(
      true,
      true
    );

    this.pickups.clear(
      true,
      true
    );

    const mercury = this.add.image(
      this.scale.width + 180,
      this.scale.height * 0.48,
      "mercury"
    );

    mercury.setScale(0.35);
    mercury.setAlpha(0);
    mercury.setDepth(500);

    this.tweens.add({
      targets: mercury,
      x: this.scale.width * 0.68,
      alpha: 1,
      duration: 1800,
      ease: "Power2",
      onComplete: () => {
        this.time.delayedCall(
          900,
          () => {
            this.completeMission(
              mercury
            );
          }
        );
      }
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
      this.updateHUD();
      return;
    }

    this.updateMission(delta);
    this.checkPickupSchedule();
  }

  updateMission(delta) {
    this.missionElapsed +=
      delta / 1000;

    const fuelDrain =
      (delta / 1000) * 0.38;

    this.fuel = Math.max(
      0,
      this.fuel - fuelDrain
    );

    this.progress =
      Phaser.Math.Clamp(
        this.missionElapsed /
          this.missionDuration,
        0,
        0.99
      );

    this.progressText.setText(
      `ROTA: ${Math.floor(
        this.progress * 100
      )}%`
    );

    this.updateHUD();

    if (
      this.fuel <= 0 ||
      this.shield <= 0
    ) {
      this.checkFailureState();
    }

    if (
      this.progress >= 0.99 &&
      !this.isBossPhase &&
      !this.isBossEntering
    ) {
      this.startBossPhase();
    }
  }

  updateStars(delta) {
    const multiplier =
      delta / 16.67;

    const speedBoost =
      this.isBossPhase ? 0.35 : 1;

    for (const star of this.stars) {
      star.x -=
        star.speed *
        multiplier *
        speedBoost;

      if (star.x < -4) {
        star.x =
          this.scale.width + 4;

        star.y =
          Phaser.Math.Between(
            145,
            this.scale.height
          );
      }
    }
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
      Math.sin(time * 0.0022) * 95;
  }

  handleKeyboardMovement(delta) {
    if (
      !this.player ||
      this.isQuestionOpen
    ) {
      return;
    }

    const speed =
      0.42 * delta;

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

    const topLimit =
      155 + halfHeight;

    const bottomLimit =
      this.scale.height -
      halfHeight -
      20;

    this.player.y =
      Phaser.Math.Clamp(
        this.player.y,
        topLimit,
        bottomLimit
      );

    this.player.x =
      this.scale.width * 0.22;
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
      this.fuelText.setColor(
        "#ff6b5f"
      );

      this.fuelBar.setFillStyle(
        0xff4b3e
      );
    } else {
      this.fuelText.setColor(
        "#7cff7a"
      );

      this.fuelBar.setFillStyle(
        0x7cff7a
      );
    }

    if (this.shield <= 25) {
      this.shieldText.setColor(
        "#ff6b5f"
      );

      this.shieldBar.setFillStyle(
        0xff4b3e
      );
    } else {
      this.shieldText.setColor(
        "#7cff7a"
      );

      this.shieldBar.setFillStyle(
        0x7cff7a
      );
    }
  }

  cleanupObjects() {
    this.obstacles
      .getChildren()
      .forEach((object) => {
        if (
          object.x < -140 ||
          object.y >
            this.scale.height + 160
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
      .forEach((bullet) => {
        if (
          bullet.x >
          this.scale.width + 100
        ) {
          bullet.destroy();
        }
      });

    this.bossProjectiles
      .getChildren()
      .forEach((projectile) => {
        if (projectile.x < -100) {
          projectile.destroy();
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
        450,
        90,
        255,
        90
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

    if (this.bossFireTimer) {
      this.bossFireTimer.paused = true;
    }

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.95
    );

    overlay.setDepth(4000);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      "GÖREV BAŞARISIZ",
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "34px",
        color: "#ff6055"
      }
    );

    title
      .setOrigin(0.5)
      .setDepth(4001);

    const score = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 30,
      `SKOR: ${this.score}`,
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "22px",
        color: "#7cff7a"
      }
    );

    score
      .setOrigin(0.5)
      .setDepth(4001);

    const restartButton =
      this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2 + 90,
        320,
        74,
        0x0b2b0e,
        1
      );

    restartButton
      .setStrokeStyle(
        3,
        0x7cff7a,
        1
      )
      .setDepth(4001)
      .setInteractive({
        useHandCursor: true
      });

    const restartText =
      this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 + 90,
        "GÖREVİ YENİDEN BAŞLAT",
        {
          fontFamily:
            '"Courier New", monospace',
          fontSize: "18px",
          color: "#b7ffb2"
        }
      );

    restartText
      .setOrigin(0.5)
      .setDepth(4002);

    restartButton.on(
      "pointerdown",
      () => {
        this.scene.restart();
      }
    );
  }

  completeMission(mercuryImage) {
    if (this.isMissionComplete) {
      return;
    }

    this.isMissionComplete = true;
    this.dragging = false;

    this.physics.world.pause();

    this.score +=
      Math.ceil(this.fuel) * 10;

    localStorage.setItem(
      "kozmikRotaMercuryCompleted",
      "true"
    );

    localStorage.setItem(
      "kozmikRotaMercuryBestScore",
      String(
        Math.max(
          Number(
            localStorage.getItem(
              "kozmikRotaMercuryBestScore"
            ) || 0
          ),
          this.score
        )
      )
    );

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x010501,
      0.87
    );

    overlay.setDepth(5000);

    if (mercuryImage) {
      mercuryImage.setDepth(5001);
      mercuryImage.setAlpha(0.75);
    }

    const title = this.add.text(
      this.scale.width / 2,
      240,
      "MERKÜR’E ULAŞILDI",
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "31px",
        color: "#ffb06b",
        align: "center",
        stroke: "#351300",
        strokeThickness: 4
      }
    );

    title
      .setOrigin(0.5)
      .setDepth(5002);

    const chapterEnd = this.add.text(
      this.scale.width / 2,
      305,
      "BÖLÜM SONU",
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "26px",
        color: "#b7ffb2",
        align: "center"
      }
    );

    chapterEnd
      .setOrigin(0.5)
      .setDepth(5002);

    const details = this.add.text(
      this.scale.width / 2,
      465,
      [
        `KALAN YAKIT: ${Math.ceil(
          this.fuel
        )}%`,
        `KALAN KALKAN: ${Math.ceil(
          this.shield
        )}%`,
        `DOĞRU CEVAP: ${this.correctAnswers}`,
        `YANLIŞ CEVAP: ${this.wrongAnswers}`,
        `TOPLAM SKOR: ${this.score}`
      ].join("\n"),
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "20px",
        color: "#7cff7a",
        align: "center",
        lineSpacing: 13
      }
    );

    details
      .setOrigin(0.5)
      .setDepth(5002);

    const nextMission = this.add.text(
      this.scale.width / 2,
      650,
      "SONRAKİ GÖREV YAKINDA",
      {
        fontFamily:
          '"Courier New", monospace',
        fontSize: "18px",
        color: "#b7ffb2",
        align: "center"
      }
    );

    nextMission
      .setOrigin(0.5)
      .setDepth(5002);

    const restartButton =
      this.add.rectangle(
        this.scale.width / 2,
        760,
        290,
        72,
        0x0b2b0e,
        1
      );

    restartButton
      .setStrokeStyle(
        3,
        0x7cff7a,
        1
      )
      .setDepth(5002)
      .setInteractive({
        useHandCursor: true
      });

    const restartText =
      this.add.text(
        this.scale.width / 2,
        760,
        "TEKRAR OYNA",
        {
          fontFamily:
            '"Courier New", monospace',
          fontSize: "20px",
          color: "#b7ffb2"
        }
      );

    restartText
      .setOrigin(0.5)
      .setDepth(5003);

    restartButton.on(
      "pointerdown",
      () => {
        this.scene.restart();
      }
    );
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
    autoCenter:
      Phaser.Scale.CENTER_BOTH
  },

  scene: MainScene
};

new Phaser.Game(config);