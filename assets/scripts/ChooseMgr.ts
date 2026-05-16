import { _decorator, Component, Contact2DType, director, find, Label, Node, NodeEventType, Sprite, v3 } from 'cc';
import { Config } from './Config';
import { WeapoonDescriptionData } from './WeapoonDescriptionData';
import { PlayerData } from './PlayerData';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('ChooseMgr')
export class ChooseMgr extends Component {

    @property(Node)
    backBtn: Node = null;

    @property(Node)
    startBtn: Node = null;

    @property(Sprite)
    playerUINode: Sprite = null;

    @property(Sprite)
    weaponUINode: Sprite = null;

    @property(Label)
    weaponNameLabel: Label = null;

    @property(Label)
    damageLabel: Label = null;

    @property(Label)
    scopeLabel: Label = null;

    @property(Label)
    coolingLabel: Label = null;

    @property(Label)
    criticalHitLabel: Label = null;


    playerList: Node[] = null;
    weaponList: Node[] = null;

    playerIndex: number = 0;
    weaponIndex: number = 0;

    protected onLoad(): void {

    }

    start() {
        AudioMgr.Instance.playBGM("BGM01");
        Config.Instance.loadWeaponDescConfig();
        this.playerList = find("Canvas/playerList/view/content").children;
        this.weaponList = find("Canvas/weaponList/view/content").children;
        this.registerEvent();
    }

    registerEvent() {
        for (let i = 0; i < this.playerList.length; i++) {
            const playerNode = this.playerList[i];
            playerNode.on(NodeEventType.TOUCH_START, () => {
                this.selectPlayer(i)
            })
        }

        for (let i = 0; i < this.weaponList.length; i++) {
            const weaponNode = this.weaponList[i];
            weaponNode.on(NodeEventType.TOUCH_START, () => {
                this.selectweapon(i)
            })
        }

        this.backBtn.on(NodeEventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect("button_focus");
        })
        this.backBtn.on(NodeEventType.TOUCH_START, () => {
            AudioMgr.Instance.playEffect("button_press");
            director.loadScene("loadingScene");
            AudioMgr.Instance.stopBGM("BGM01");
        })

        this.startBtn.on(NodeEventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect("button_focus");
        })

        this.startBtn.on(NodeEventType.TOUCH_START, () => {
            if (this.weaponIndex == 7) {
                PlayerData.Instance.isPistol = true;
            }
            director.loadScene("gameScene");
            AudioMgr.Instance.stopBGM("BGM01");
        })
    }
    changeWeaponLabel(index: number) {
        let data = Config.Instance.weaponDescNameList.get(index);
        if (data) {
            this.weaponNameLabel.string = data.name;
            this.damageLabel.string = data.damage;
            this.scopeLabel.string = data.scope;
            this.coolingLabel.string = data.cooling;
            this.criticalHitLabel.string = data.criticalHit;
        }
    }


    selectPlayer(index: number) {
        this.playerIndex = index;
        PlayerData.Instance.playerSpriteFrameIndex = index;

        for (let i = 0; i < this.playerList.length; i++) {
            if (i == index) {
                this.playerList[i].scale = v3(1.5, 1.5, 1);
                continue;
            }
            this.playerList[i].scale = v3(1, 1, 1);
        }
        this.changePlayerUI(this.playerIndex);
    }

    changePlayerUI(index: number) {
        this.playerUINode.spriteFrame = this.playerList[index].getComponent(Sprite).spriteFrame;
    }

    selectweapon(index: number) {
        this.weaponIndex = index;

        for (let i = 0; i < this.weaponList.length; i++) {
            if (i == index) {
                this.weaponList[i].scale = v3(1.5, 1.5, 1);
                continue;
            }
            this.weaponList[i].scale = v3(1, 1, 1);
        }

        this.changeWeaponUI(this.weaponIndex);
        this.changeWeaponLabel(this.weaponIndex);
    }

    changeWeaponUI(index: number) {
        this.weaponUINode.spriteFrame = this.weaponList[index].getComponent(Sprite).spriteFrame;
    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {

    }
}


