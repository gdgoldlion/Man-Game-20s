const { ccclass, property } = cc._decorator;
import Global from "./Global"
import BulletCtrl from "./BulletCtrl"
import PlaneCtrl from "./PlaneCtrl"
import plusTimeCtrl from "./plusTimeCtrl"

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab;

    @property(cc.Node)
    bulletRootNode: cc.Node;

    @property(cc.Node)
    planeNode: cc.Node;

    @property(cc.Node)
    plusTimeNode: cc.Node;

    @property(cc.Node)
    joystick1: cc.Node;

    @property(cc.Node)
    joystick2: cc.Node;

    @property({
        default: NaN
    })
    plusTimeGenerateInterval: number = NaN;

    joystickRadius: number;
    isOnJoystick: boolean = false;

    bulletCount: number = 0;
    bulletPool: cc.NodePool;

    planeCtrl: PlaneCtrl;

    generatePlusTimeTimer: number;
    reservePlusTimeTimer : number;

    onLoad() {
        // init logic
        Global.data.gameTime = 0;
        this.bulletPool = new cc.NodePool("BulletCtrl");

        this.joystickRadius = this.joystick1.getContentSize().width / 2;

        this.planeCtrl = <PlaneCtrl>this.planeNode.getComponent("PlaneCtrl");
        let plusTimeCtrl = <plusTimeCtrl>this.plusTimeNode.getComponent("PlusTimeCtrl");

        //add keyboard input listener to call onKeyDown and onKeyUp
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN.toString(), this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP.toString(), this.onKeyUp, this);

        //这些都是冒泡事件，注意节点的挂接，以及使用dispatchEvent方式发射事件
        if(!this.planeCtrl.invincible)
            this.node.on(Global.EventType.BulletHitPlane, this.bulletHitPlaneHandler.bind(this));
        this.node.on(Global.EventType.BulletOffScreen, this.bulletOffScreenHandler.bind(this));
        this.node.on(Global.EventType.PlaneExplosionFinished, this.planeExplosionHandler.bind(this));
        this.node.on(Global.EventType.PlusTimeHitPlane, this.plusTimeHitPlaneHandler.bind(this));

        //触摸事件，用于摇杆
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));

        this.generatePlusTimeTimer = setInterval(this.generatePlusTime.bind(this), this.plusTimeGenerateInterval);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN.toString(), this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP.toString(), this.onKeyUp, this);

        if(!this.planeCtrl.invincible)
            this.node.off(Global.EventType.BulletHitPlane, this.bulletHitPlaneHandler.bind(this));
        this.node.off(Global.EventType.BulletOffScreen, this.bulletOffScreenHandler.bind(this));
        this.node.off(Global.EventType.PlaneExplosionFinished, this.planeExplosionHandler.bind(this));
        this.node.off(Global.EventType.PlusTimeHitPlane, this.plusTimeHitPlaneHandler.bind(this));

        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this));
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));

        clearInterval(this.generatePlusTimeTimer);
        clearInterval(this.reservePlusTimeTimer);
    }

    update(dt) {
        this.updateGameTime(dt);
        this.generateBullet(dt);
    }

    updateGameTime(dt) {
        Global.data.gameTime += dt;
    }

    //飞船操控相关///////////////////////////////////////////////////////////////////
    onTouchStart(event: cc.Event.EventTouch) {
        let touches = event.getTouches();
        let pointInJoystick: cc.Vec2 = this.joystick1.convertTouchToNodeSpaceAR(touches[0]);

        //判断点击在摇杆上
        let isInRange = Math.pow(pointInJoystick.x, 2) + Math.pow(pointInJoystick.y, 2) < Math.pow(this.joystickRadius, 2);
        if (isInRange) {
            this.planeCtrl.speedX = this.planeCtrl.speedY = 0;

            this.joystick2.position = pointInJoystick;
            this.isOnJoystick = true;
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isOnJoystick) {
            return;
        }

        let touches = event.getTouches();
        let pointInJoystick: cc.Vec2 = this.joystick1.convertTouchToNodeSpaceAR(touches[0]);

        this.joystick2.position = Global.math.clacJokstickPosition(0,0,this.joystickRadius,pointInJoystick.x, pointInJoystick.y);

        //等比三角形计算速度
        let hypotenuse = Math.sqrt(Math.pow(this.joystick2.x, 2) + Math.pow(this.joystick2.y, 2));//斜边

        this.planeCtrl.speedX = this.planeCtrl.speed * this.joystick2.x / hypotenuse;
        this.planeCtrl.speedY = this.planeCtrl.speed * this.joystick2.y / hypotenuse;
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.isOnJoystick = false;
        this.joystick2.position = cc.Vec2.ZERO;

        this.planeCtrl.speedX = this.planeCtrl.speedY = 0;
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
                this.planeCtrl.speedY += this.planeCtrl.speed;
                break;
            case cc.KEY.s:
            case cc.KEY.down:
                this.planeCtrl.speedY -= this.planeCtrl.speed;
                break;
            case cc.KEY.a:
            case cc.KEY.left:
                this.planeCtrl.speedX -= this.planeCtrl.speed;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.planeCtrl.speedX += this.planeCtrl.speed;
                break;
        }

        if (cc.sys.platform === cc.sys.DESKTOP_BROWSER) {
            this.onDesktopBrowserSpeedFix();
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case cc.KEY.w:
            case cc.KEY.up:
                this.planeCtrl.speedY -= this.planeCtrl.speed;
                break;
            case cc.KEY.s:
            case cc.KEY.down:
                this.planeCtrl.speedY += this.planeCtrl.speed;
                break;
            case cc.KEY.a:
            case cc.KEY.left:
                this.planeCtrl.speedX += this.planeCtrl.speed;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.planeCtrl.speedX -= this.planeCtrl.speed;
                break;
        }

        if (cc.sys.platform === cc.sys.DESKTOP_BROWSER) {
            this.onDesktopBrowserSpeedFix();
        }
    }

    //xxx
    onDesktopBrowserSpeedFix() {
        if (this.planeCtrl.speedX > this.planeCtrl.speed) {
            this.planeCtrl.speedX = this.planeCtrl.speed;
        }
        else if (this.planeCtrl.speedX < -this.planeCtrl.speed) {
            this.planeCtrl.speedX = -this.planeCtrl.speed;
        }

        if (this.planeCtrl.speedY > this.planeCtrl.speed) {
            this.planeCtrl.speedY = this.planeCtrl.speed;
        }
        else if (this.planeCtrl.speedY < -this.planeCtrl.speed) {
            this.planeCtrl.speedY = -this.planeCtrl.speed;
        }
    }

    //道具操控相关///////////////////////////////////////////////////////////////////
    generatePlusTime() {
        this.plusTimeNode.active = true;
        this.plusTimeNode.getComponent("PlusTimeCtrl").enabled = true;

        this.plusTimeNode.x = cc.winSize.width * Global.math.getRandomArbitrary(0.2, 0.8);
        this.plusTimeNode.y = cc.winSize.height * Global.math.getRandomArbitrary(0.2, 0.8);

    }

    //子弹操控相关///////////////////////////////////////////////////////////////////
    generateBullet(dt) {
        if (this.bulletCount > Global.fn.getBulletCount()) {
            return;
        }

        //生成子弹精灵//
        let bullet: cc.Node = this.bulletPool.get(undefined);
        if (!bullet) {
            bullet = cc.instantiate(this.bulletPrefab);
            bullet.addComponent("BulletCtrl");
        }

        bullet.parent = this.bulletRootNode;//千万不要忘记挂到父节点
        this.bulletCount++;

        //设置子弹位置和速度//
        let getRandomInt = Global.math.getRandomInt;
        let bulletCtrl: BulletCtrl = <BulletCtrl>bullet.getComponent("BulletCtrl");
        let bulletSpeed = bulletCtrl.speed;
        let entrance: Number = getRandomInt(0, 3);
        switch (entrance) {
            case 0://上侧飞入
                bullet.x = cc.winSize.width * Math.random();
                bullet.y = cc.winSize.height - bullet.getContentSize().height;
                bulletCtrl.speedX = getRandomInt(-2, 2) * bulletSpeed;
                bulletCtrl.speedY = getRandomInt(-1, -3) * bulletSpeed;
                break;
            case 1://下侧飞入
                bullet.x = cc.winSize.width * Math.random();
                bullet.y = -bullet.getContentSize().height;
                bulletCtrl.speedX = getRandomInt(-2, 2) * bulletSpeed;
                bulletCtrl.speedY = getRandomInt(1, 3) * bulletSpeed;
                break;
            case 2://左侧飞入
                bullet.x = -bullet.getContentSize().width;
                bullet.y = cc.winSize.height * Math.random();
                bulletCtrl.speedX = getRandomInt(1, 3) * bulletSpeed;
                bulletCtrl.speedY = getRandomInt(-2, 2) * bulletSpeed;
                break;
            case 3://右侧飞入
                bullet.x = cc.winSize.width + bullet.getContentSize().width;
                bullet.y = cc.winSize.height * Math.random();
                bulletCtrl.speedX = getRandomInt(-1, -3) * bulletSpeed;
                bulletCtrl.speedY = getRandomInt(-2, 2) * bulletSpeed;
                break;
        }
    }

    //事件相关///////////////////////////////////////////////////////////////////
    bulletOffScreenHandler(event: cc.Event) {
        let bullet = <cc.Node>event.target;
        this.bulletPool.put(bullet);
        this.bulletCount--;
    }

    bulletHitPlaneHandler(event: cc.Event) {
        this.planeCtrl.explosion();
    }

    planeExplosionHandler(event: cc.Event) {
        cc.director.loadScene("GameOverScene");
    }

    plusTimeHitPlaneHandler(event: cc.Event) {
        //重置定时器，重要
        clearInterval(this.generatePlusTimeTimer);
        this.generatePlusTimeTimer = setInterval(this.generatePlusTime.bind(this), this.plusTimeGenerateInterval);

        this.reservePlusTimeTimer = setTimeout((() => {
            this.plusTimeNode.active = false;
            this.plusTimeNode.getComponent("PlusTimeCtrl").enabled = false;

        }).bind(this), this.plusTimeGenerateInterval/5);//道具文字停留时间是刷新间隔时间的1/5
    }
}