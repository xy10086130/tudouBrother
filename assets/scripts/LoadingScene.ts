import { _decorator, Button, Component, director, Node } from 'cc';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('LoadingScene')
export class LoadingScene extends Component {
    @property(Button)
    startBtn: Button = null;

    @property(Button)
    exitBtn: Button = null;

    hoverEffectName: string = "button_focus";

    clickDownEffectName: string = "button_press";
    start() {
        //先加载loadingSceneBGM
        AudioMgr.Instance.preloadAudio("loadingSceneBGM", () => {
            AudioMgr.Instance.playBGM("loadingSceneBGM");
        });

        AudioMgr.Instance.LoadAudioRes(() => {
            this.startBtn.node.on(Node.EventType.MOUSE_ENTER, () => {
                AudioMgr.Instance.playEffect(this.hoverEffectName);
            }, this);

            this.exitBtn.node.on(Node.EventType.MOUSE_ENTER, () => {
                AudioMgr.Instance.playEffect(this.hoverEffectName);
            }, this);
        });
        this.startBtn.node.on("click", this.onClickStartBtn, this);
        this.exitBtn.node.on("click", this.onClickExitBtn, this);
    }


    onClickStartBtn() {
        AudioMgr.Instance.playEffect(this.clickDownEffectName);
        director.loadScene("chooseScene");
        AudioMgr.Instance.stopBGM("loadingSceneBGM");
    }
    onClickExitBtn() {
        AudioMgr.Instance.playEffect(this.clickDownEffectName);
        director.end();
    }



    update(deltaTime: number) {

    }

}


