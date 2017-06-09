const { ccclass, property } = cc._decorator;
import Global from "./Global"

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    timeLabel: cc.Label;

    @property(cc.Label)
    appraiseLabel: cc.Label;

    onLoad() {
        // init logic
        this.timeLabel.string = "你坚持了" + Math.floor(Global.data.gameTime) + "秒";
        this.appraiseLabel.string = "你获得的评价是：\n" + this.convertAppraise(Global.data.gameTime);
    }

    convertAppraise(gameTime: number): string {
        let appraise: string;

        let appraiseTable = Global.table.appraise;

        for(var appraiseGameTime in appraiseTable){
            if(gameTime >= parseInt(appraiseGameTime)){
                appraise = appraiseTable[appraiseGameTime];
            }
            else if (gameTime < parseInt(appraiseGameTime)){
                break;
            }
        }

        return appraise;
    }

    onBackButtonClicked() {
        cc.director.loadScene("TitleScene");
    }
}
