import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyCfgData')
export class EnemyCfgData {
    // 基础属性
    id: number = 0;
    name: string = "";
    type: string = "";
    hp: number = 0;
    attack: number = 0;
    speed: number = 0;
    weight: number = 0;

    // 射击相关属性
    shootDistance: number = 400;      
    shootInterval: number = 2.0;      
    bulletSpeed: number = 500;        
    bulletDamage: number = 1;    
    
    // 冲刺相关属性
    sprintTime: number = 2.5;
    sprintDuration: number = 0.5;
    
    neighborRadius: number = 200;      // 感知邻居的范围
    separationDistance: number = 80;   // 触发分离的最小距离
    separationWeight: number = 1.5;    // 分离力权重
    cohesionWeight: number = 1.0;      // 聚集力权重
    alignmentWeight: number = 0.8;     // 对齐力权重
    flockingWeight: number = 0.3;      // 群体行为整体影响权重

    // 是否只群聚同类型敌人
    sameTypeOnly: boolean = false;
}