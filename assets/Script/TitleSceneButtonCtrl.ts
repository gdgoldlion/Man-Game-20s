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
        cc.director.end();
    }
}
