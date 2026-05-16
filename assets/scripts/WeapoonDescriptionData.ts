import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WeapoonDescriptionData')
export class WeapoonDescriptionData {
    id = 5;
    name:string = "双管霰弹枪";
    criticalHit:string = "x2";
    damage:string = "3x4";
    scope:string = "350";
    cooling:string = "1.37";
}


