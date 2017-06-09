const { ccclass, property } = cc._decorator;
import Global from "./Global"

@ccclass
export default class NewClass extends cc.Component {

    @property({
        url: cc.AudioClip,
        default: null
    })
    cheeringAudioClip: cc.AudioClip;

    onLoad() {
        // init logic
    }

    update(dt) {

    }

    onEnable() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.node.getComponent(cc.Sprite).enabled = true;
        this.node.getChildByName("PlusTimeLabel").active = false;
    }

    onCollisionEnter(other, self) {
        // this.node.color = cc.Color.RED;

        var manager = cc.director.getCollisionManager();
        manager.enabled = false;

        this.node.getComponent(cc.Sprite).enabled = false;

        let plusTimeLabelNode: cc.Node = <cc.Node>this.node.getChildByName("PlusTimeLabel");
        plusTimeLabelNode.active = true;

        let plusTimeLabel: cc.Label = <cc.Label>plusTimeLabelNode.getComponent(cc.Label);
        let plusTime = Global.math.getRandomInt(1, 3)
        plusTimeLabel.string = "+" + plusTime;

        Global.data.gameTime += plusTime;

        //吃道具音效
        if (this.cheeringAudioClip && Global.fn.getIsPlaySoundEffect()) {
            var id = cc.audioEngine.play(this.cheeringAudioClip, false, 1);
        }

        this.node.dispatchEvent(new cc.Event.EventCustom(Global.EventType.PlusTimeHitPlane, true));
    }
}
