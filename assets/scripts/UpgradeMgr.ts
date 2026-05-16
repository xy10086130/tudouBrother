import { _decorator, Button, Component, find, Node, Prefab } from 'cc';
import { Config } from './Config';
import { UpgradeCfgData } from './UpgradeCfgData';
import { UpgradeOption } from './UpgradeOption';
import { AudioMgr } from './AudioMgr';
import { PlayerData } from './PlayerData';
import { EventMgr } from './EventMgr';
const { ccclass, property } = _decorator;

@ccclass('UpgradeMgr')
export class UpgradeMgr extends Component {
    //升级选项的父节点
    @property(Node)
    upgradeContent: Node = null;

    @property(Button)
    refresh: Button = null;

    options: UpgradeCfgData[] = [];

    // 记录当前升级次数
    private remainingUpgradeTimes: number = 0;

    start() {
        // 获取当前的升级图标数量
        const upgradeIcons = find("Canvas/ui/upgradeIcons");
        this.remainingUpgradeTimes = upgradeIcons ? upgradeIcons.children.length : 0;

        this.randomUpgradeOption();

        this.refresh.node.on("click", this.refreshUpgradeOption, this);
        this.refresh.node.on(Node.EventType.MOUSE_ENTER, () => {
            AudioMgr.Instance.playEffect("button_focus");
        }, this);

         // 监听升级事件
        EventMgr.Instance.on(Config.UPGRADE_APPLIED, this.onUpgradeApplied, this);

    }

    //随机生成升级选项
    randomUpgradeOption() {
        const upgradeData: UpgradeCfgData[] = Config.Instance.upgradeCfgData;
        const upgradeOptions: Node[] = this.upgradeContent.children;

        this.options = [];

        for (let i = 0; i < upgradeOptions.length; i++) {
            let index = Math.floor(Math.random() * upgradeData.length);
            let upgradeOption = upgradeOptions[i];
            while (this.options.indexOf(upgradeData[index]) != -1) {
                index = Math.floor(Math.random() * upgradeData.length);
            }
            this.options.push(upgradeData[index]);
            upgradeOption.getComponent(UpgradeOption).initData(upgradeData[index]);
        }
    }

    //刷新升级选项
    refreshUpgradeOption() {
        if (PlayerData.Instance.gold < 1) {
            return;
        }
        this.randomUpgradeOption();
        PlayerData.Instance.changeGold(-1);
    }


    // 当升级被应用时的处理
    onUpgradeApplied() {
        this.remainingUpgradeTimes--;
        if (this.remainingUpgradeTimes <= 0) {
            EventMgr.Instance.emit(Config.UPGRADE_UI_CLOSE);
        } else {
            this.randomUpgradeOption();
        }
    }

    update(deltaTime: number) {

    }
}


