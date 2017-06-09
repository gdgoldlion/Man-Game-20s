const { ccclass, property } = cc._decorator;
import Global from "./Global"

@ccclass
export default class NewClass extends cc.Component {
    @property({
        default: NaN
    })
    public speed: number = NaN;

    public speedX: number = 0;

    public speedY: number = 0;

    onLoad() {
        // init logic

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    }

    update(dt) {
        this.node.x += this.speedX * dt;
        this.node.y += this.speedY * dt;
        this.checkOffScreen(dt);
    }

    onCollisionEnter (other, self) {
        // this.node.color = cc.Color.RED;

        this.node.dispatchEvent(new cc.Event.EventCustom(Global.EventType.BulletHitPlane, true));
    }

    checkOffScreen(dt) {
        if (this.node.x + this.node.getContentSize().width < 0
            || this.node.x - this.node.getContentSize().width > cc.winSize.width
            || this.node.y + this.node.getContentSize().height < 0
            || this.node.y - this.node.getContentSize().height > cc.winSize.height) {

            this.node.dispatchEvent(new cc.Event.EventCustom(Global.EventType.BulletOffScreen, true));
        }
    }
}
