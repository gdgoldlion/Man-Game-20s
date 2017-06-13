const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad() {
        // init logic
    }

    onNewGameButtonClicked() {
        cc.director.loadScene("GameScene");
    }

    onOptionButtonClicked() {
        cc.director.loadScene("OptionScene");
    }

    onExitButtonClicked() {
        if (cc.sys.platform === cc.sys.DESKTOP_BROWSER) {
            window.opener=null;
            window.open('','_self');
            window.close();
        }
        else{
            cc.director.end();
        }
    }
}
