//OptionScene全局相关///////////////////////////////////////////////////////////////////
let isPlaySoundEffect: boolean = true;

let bulletCountMin: number = 500;

let bulletCountIncremental: number = 100;

let bulletCountTimesOfIncremental: number = 5;

let bulletCountMax: number = bulletCountMin + bulletCountIncremental * bulletCountTimesOfIncremental;

let bulletCount: number = bulletCountMin;

function toggleIsPlaySoundEffect() {
    return isPlaySoundEffect = !isPlaySoundEffect;
}

function getIsPlaySoundEffect(): boolean {
    return isPlaySoundEffect;
}

function addBulletCount() {
    bulletCount += bulletCountIncremental;
    if (bulletCount > bulletCountMax) {
        bulletCount = bulletCountMin;
    }
}

function getBulletCount(): number {
    return bulletCount;
}

//GameScene全局相关///////////////////////////////////////////////////////////////////
let gameTime: number = 0;

//GameOverScene全局相关///////////////////////////////////////////////////////////////////

let appraise = {
    "0": "东方不败",
    "6": "猥琐男",
    "10": "火影忍者之下下下忍",
    "12": "圣诞老人",
    "14": "斯巴达三百勇士之三百零一",
    "16": "多拉A梦的裤兜",
    "18": "马里奥的胡子",
    "20": "哈利波特的眼镜",
    "22": "蝙蝠侠的汽车轮子",
    "24": "超人的裤衩",
    "26": "孙悟空的尾巴",
    "28": "曾哥模仿秀冠军",
    "30": "春哥模仿秀安慰奖",
    "32": "世界上最后一个男人",
}

//事件///////////////////////////////////////////////////////////////////

let EventType = {
    BulletOffScreen: "子弹离开屏幕",
    BulletHitPlane: "子弹命中飞机",
    PlaneExplosionFinished: "飞机爆炸结束",
    PlusTimeHitPlane: "加时间道具命中飞机",
};

//数学///////////////////////////////////////////////////////////////////
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

//公式来自：https://thecodeway.com/blog/?p=932 感谢作者的推导，基本思路跟直线和圆相交是一样的，只是用u判断交点是否在线段上
//根据摇杆特点简化算法，令P1=P3，此时相交的5种情况只存在2、3两种可能性，优化算法，代码如下：
function clacJokstickPosition(cx: number, cy: number, r: number, touchX: number, touchY: number): cc.Vec2 {
    let distanceX = touchX - cx;
    let distanceY = touchY - cy;

    let A = distanceX * distanceX + distanceY * distanceY;
    //let B = 0;
    let C = - r * r;

    if(A + C <= 0){
        return new cc.Vec2(touchX, touchY);
    }
    else{
        let delta = /*B * B*/ - 4 * A * C;

        let u = (/*-B +*/  Math.sqrt(delta)) / (2 * A);

        return new cc.Vec2(
            cx + u * distanceX,
            cy + u * distanceY);
    }
}

/////////////////////////////////////////////////////////////////////

export default {
    fn: {
        toggleIsPlaySoundEffect: toggleIsPlaySoundEffect,
        getIsPlaySoundEffect: getIsPlaySoundEffect,

        addBulletCount: addBulletCount,
        getBulletCount: getBulletCount,
    },

    data: {
        gameTime: gameTime,
    },

    table: {
        appraise: appraise,
    },

    EventType: EventType,

    math: {
        getRandomInt: getRandomInt,
        getRandomArbitrary: getRandomArbitrary,
        clacJokstickPosition: clacJokstickPosition,
    },
}
