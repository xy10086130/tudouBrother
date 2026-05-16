import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PistolsData')
export class PistolsData {
    id: number = 0;
    name: string = " ";
    type: string = "range";  // 远程类型
    damage: number = 0;
    range: number = 0;
    cooltime: number = 0;
    speed: number = 0;       // 子弹速度
    effect: string = " ";    // 射击音效
    bulletSpeed: number = 800;  // 子弹飞行速度
    bulletLifeTime: number = 2; // 子弹生存时间
    bulletPrefab: string = "";  // 子弹预制体路径
    spread: number = 0;      // 子弹散布角度
    pierce: number = 0;      // 穿透数量
    knockback: number = 0;   // 击退强度
}


