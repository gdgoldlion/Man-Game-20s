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
//海伦公式
function heronsformula(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    let a = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    let b = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
    let c = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));
    let s = (a + b + c) / 2;

    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

function triangleContainPoint(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, px: number, py: number): boolean {
    let s1 = heronsformula(x1, y1, x2, y2, px, py);
    let s2 = heronsformula(x2, y2, x3, y3, px, py);
    let s3 = heronsformula(x3, y3, x1, y1, px, py);
    let s = heronsformula(x1, y1, x2, y2, x3, y3);

    return Math.abs(s - (s1 + s2 + s3)) < 0.001;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

//公式来自：https://thecodeway.com/blog/?p=932 感谢作者的推导，基本思路跟直线和圆相交是一样的，只是用u判断交点是否在线段上
function circleIntersectsLineSegment(cx: number, cy: number, r: number, x1: number, y1: number, x2: number, y2: number): any {
    let A = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    let B = 2 * ((x2 - x1) * (x1 - cx) + (y2 - y1) * (y1 - cy));
    let C = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;

    let delta = B * B - 4 * A * C;
    let retVal: any = {};

    if (delta < 0.00001){ //delta === 0
        retVal.result = "一个交点，相切";
        let u = -B / (2 * A);

        retVal.x = x1 + u * (x2 - x1);
        retVal.y = y1 + u * (y2 - y1);
    }
    else if(delta < 0) {
        retVal.result = "没有交点";
    }
    else{ //delta > 0
        let u1 = (-B + Math.sqrt(delta)) / (2 * A);
        let u2 = (-B - Math.sqrt(delta)) / (2 * A);

       if ((0 <= u1 && u1 <= 1) && (0 <= u2 && u2 <= 1)) {
            retVal.result = "两个交点";

            retVal.x1 = x1 + u1 * (x2 - x1);
            retVal.y1 = y1 + u1 * (y2 - y1);

            retVal.x2 = x1 + u2 * (x2 - x1);
            retVal.y2 = y1 + u2 * (y2 - y1);

        } else if ((u2 < 0 || 1 < u2) && (0 <= u1 && u1 <= 1)) {
            retVal.result = "一个交点";
            let u = u1;

            retVal.x = x1 + u * (x2 - x1);
            retVal.y = y1 + u * (y2 - y1);

        } else if ((u1 < 0 || 1 < u1) && (0 <= u2 && u2 <= 1)) {
            retVal.result = "一个交点";
            let u = u2;

            retVal.x = x1 + u * (x2 - x1);
            retVal.y = y1 + u * (y2 - y1);
        } else {
            retVal.result = "没有交点";
            //两种情况：
            //1.如果线段和圆没有交点，而且都在圆的外面的话，则u的两个解都是小于0或者大于1的
            //2.如果线段和圆没有交点，而且都在圆的里面的话，u的两个解符号相反，一个小于0，一个大于1
        }
    }

    return retVal;
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
        triangleContainPoint: triangleContainPoint,
        circleIntersectsLineSegment: circleIntersectsLineSegment,
        getRandomArbitrary: getRandomArbitrary,
    },
}
