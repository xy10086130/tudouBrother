import { _decorator, Component, find, Label, log, Node, Sprite, SpriteFrame } from 'cc';
import { UpgradeCfgData } from './UpgradeCfgData';
import { ResMgr } from './ResMgr';
import { EventMgr } from './EventMgr';
import { Config } from './Config';
import { AudioMgr } from './AudioMgr';
import { PlayerData } from './PlayerData';
import { GameSceneMgr } from './GameSceneMgr';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('UpgradeOption')
export class UpgradeOption extends Component {
    @property(Sprite)
    iconSprite: Sprite = null;

    @property(Label)
    nameLabel: Label = null;

    @property(Label)
    descLabel: Label = null;

    spFrame: SpriteFrame = null;
    nameStr: string = "";
    descStr: string = "";

    btnNode: Node = null;

    // 存储升级数据
    private upgradeData: UpgradeCfgData = null;

    hoverEffectName: string = "button_focus";
    clickDownEffectName: string = "button_press";

    start() {
        this.btnNode = this.node.getChildByName("Button");
        this.btnNode.on("click", this.onClickUpgrade, this);

        this.btnNode.on(Node.EventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect(this.hoverEffectName);
        }, this);
        this.btnNode.on(Node.EventType.MOUSE_DOWN, () => {
            AudioMgr.Instance.playEffect(this.clickDownEffectName);
        }, this);
    }

    initData(cfg_data: UpgradeCfgData) {
        this.upgradeData = cfg_data;
        this.spFrame = ResMgr.Instance.upgradeIconBuffer.get(cfg_data.iconSprite);
        this.nameStr = cfg_data.name;
        this.descStr = cfg_data.desc;

        this.initUI();
    }

    initUI() {
        this.iconSprite.spriteFrame = this.spFrame;
        this.nameLabel.string = this.nameStr;
        this.descLabel.string = this.descStr;
    }

    onClickUpgrade() {
        //主角的相应属性应该被升级
        PlayerData.Instance.addAttribute(this.upgradeData);
        // 应用升级后的属性增益
        Player.instance.attributeApply(this.upgradeData);

        // 删除一个升级图标
        let upgradeIcons = find("Canvas/ui/upgradeIcons").children;
        if (upgradeIcons.length > 0) {
            upgradeIcons[0].destroy();
        }

        EventMgr.Instance.emit(Config.UPGRADE_APPLIED);

    }

    update(deltaTime: number) {

    }
}


