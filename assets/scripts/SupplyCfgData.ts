import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SupplyCfgData')
export class SupplyCfgData {
    id: number = 0;
    name: string = "";
    gold: number = 0;
    exp: number = 0;
    weight: number = 0;
}


