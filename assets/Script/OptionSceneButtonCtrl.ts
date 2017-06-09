const {ccclass, property} = cc._decorator;
import Global from "./Global"

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    soundButtonLabel: cc.Label;

    @property(cc.Label)
    bulletCountButtonLabel: cc.Label;

    onLoad() {
        // init logic
        this.updateIsPlaySoundEffect();
        this.updateBulletCount();
    }

    onSoundButtonClicked() {
        Global.fn.toggleIsPlaySoundEffect();
        this.updateIsPlaySoundEffect();
    }

    onBulletCountButtonClicked() {
        Global.fn.addBulletCount();
        this.updateBulletCount();
    }

    onBackButtonClicked() {
        cc.director.loadScene("TitleScene");
    }

    updateIsPlaySoundEffect() {
        this.soundButtonLabel.string = Global.fn.getIsPlaySoundEffect() ? "开" : "关" ;
    }

    updateBulletCount() {
        this.bulletCountButtonLabel.string = Global.fn.getBulletCount().toString();
    }
}
