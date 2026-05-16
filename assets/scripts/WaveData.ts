import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WaveData')
export class WaveData {
    waveNumber: number = 0;
    name: string = "";
    duration: number = 0;
    enemyCount: number = 0;
    spawnInterval: number = 1;
    enemyTypes: string[] = [];
    bossWave: boolean = false;
    infiniteMode: boolean = false;
}


