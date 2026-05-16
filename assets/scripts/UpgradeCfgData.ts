import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpgradeCfgData')
export class UpgradeCfgData {
    id: number = 13;
    type: string = "dodge";
    iconSprite: string = "Dodge_Upgrade";
    name: string = "闪避";
    desc: string = "+3闪避";
    effect: number = 3;
}


