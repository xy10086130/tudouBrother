import { _decorator, Button, Component, director, Label, Node, NodeEventType, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { PlayerData } from './PlayerData';
import { WaveMgr } from './WaveMgr';
import { AudioMgr } from './AudioMgr';
import { WaveState } from './WaveState';
import { Config } from './Config';
const { ccclass, property } = _decorator;

@ccclass('EndSceneMgr')
export class EndSceneMgr extends Component {
    @property(Label)
    waveNumLabel: Label = null;

    @property(Node)
    weaponlist: Node = null;

    @property(Sprite)
    playerSprite: Sprite = null;

    @property(Prefab)
    attributeList: Prefab = null;

    @property(Node)
    restartBtn: Node = null;

    @property(Node)
    startNewBtn: Node = null;

    @property(Node)
    backBtn: Node = null;

    BGM: string = "gameSceneBGM03";

    hoverEffectName: string = "button_focus";
    clickDownEffectName: string = "button_press";

    start() {
        AudioMgr.Instance.playBGM(this.BGM);
        this.updateUI();
        this.reset();

        this.restartBtn.on(NodeEventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect(this.hoverEffectName)
        });


        this.startNewBtn.on(NodeEventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect(this.hoverEffectName)
        });

        this.backBtn.on(NodeEventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect(this.hoverEffectName)
        });


        this.restartBtn.on("click", this.onRestartClick, this);
        this.startNewBtn.on("click", this.onStartNewClick, this);
        this.backBtn.on("click", this.onBackClick, this);
    }

    updateUI() {
        this.waveNumLabel.string = `第${WaveMgr.Instance.currentWave}波`
        let weapons = this.weaponlist.children;
        //weaponUI
        // if (PlayerData.Instance.isFist) {

        //     weapons[0].active = true;
        // }
        // else {
        //     weapons[0].active = false;
        // }

        if (PlayerData.Instance.isPistol) {
            weapons[1].active = true;
        }
        else {
            weapons[1].active = false;
        }



        resources.load(`player/player${PlayerData.Instance.playerSpriteFrameIndex}/spriteFrame`, SpriteFrame, (err, SpriteFrame) => {
            if (err) {
                console.log(err.message);
                return;
            }
            this.playerSprite.spriteFrame = SpriteFrame;
        })

        //weapon TODO
    }

    onRestartClick() {
        AudioMgr.Instance.playEffect(this.clickDownEffectName);
        director.loadScene("gameScene");
        AudioMgr.Instance.stopBGM(this.BGM);
        Config.Instance.changeWaveState(WaveState.Wait);
    }

    onStartNewClick() {
        AudioMgr.Instance.playEffect(this.clickDownEffectName);
        director.loadScene("chooseScene");
        PlayerData.Instance.isPistol = false;
        AudioMgr.Instance.stopBGM(this.BGM);
        Config.Instance.changeWaveState(WaveState.Wait);
    }

    onBackClick() {
        AudioMgr.Instance.playEffect(this.clickDownEffectName);
        director.loadScene("loadingScene");
        //临时
        PlayerData.Instance.isPistol = false;
        AudioMgr.Instance.stopBGM(this.BGM);
        Config.Instance.changeWaveState(WaveState.Wait);
    }

    reset() {
        PlayerData.Instance.reset();
        WaveMgr.Instance.reset();
    }


    update(deltaTime: number) {

    }
}


