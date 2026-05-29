import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.add.text(this.scale.width / 2, this.scale.height / 2, "Split Second", {
      color: "#f3f0e7",
      fontFamily: "Inter",
      fontSize: "42px",
      fontStyle: "800",
    }).setOrigin(0.5);
  }
}
