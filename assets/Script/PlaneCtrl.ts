const { ccclass, property } = cc._decorator;
import Global from "./Global"

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    explosionSprite: cc.Sprite;

    @property({
        url: cc.AudioClip,
        default: null
    })
    explosionAudioClip: cc.AudioClip;

    @property({
        default: NaN
    })
    public speed: number = NaN;

    @property({
        default: false,
        tooltip: "无敌"
    })
    public invincible: boolean = false;

    private isDead: boolean = false;

    public speedX: number = 0;

    public speedY: number = 0;

    onLoad() {
        // init logic
    }

    onDestroy() {
        this.stopPlane();
    }

    update(dt) {
        if(this.isDead){
            return;
        }
        
        this.node.x += this.speedX * dt;
        this.node.y += this.speedY * dt;
    }

    stopPlane() {
        this.speedX = this.speedY = 0;
    }

    private animation: cc.Animation;

    explosion() {
        if(this.isDead){
            return;
        }

        this.isDead = true;

        this.stopPlane();

        //爆炸音效
        if (this.explosionAudioClip && Global.fn.getIsPlaySoundEffect()) {
            var id = cc.audioEngine.play(this.explosionAudioClip, false, 1);
        }

        //爆炸动画
        this.explosionSprite.node.active = true;

        this.animation = <cc.Animation>this.explosionSprite.getComponent(cc.Animation);
        let animationState: cc.AnimationState = this.animation.play();

        this.animation.on('finished', this.onFinished, this);
    }

    onFinished() {
        this.animation.off('finished', this.onFinished, this);
        this.node.dispatchEvent(new cc.Event.EventCustom(Global.EventType.PlaneExplosionFinished, true));
    }
}
