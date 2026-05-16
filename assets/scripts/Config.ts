import { JsonAsset, resources } from "cc";
import { EnemyCfgData } from "./EnemyCfgData";
import { SupplyCfgData } from "./SupplyCfgData";
import { FistData } from "./weapon/FistData";
import { WaveData } from "./WaveData";
import { UpgradeCfgData } from "./UpgradeCfgData";
import { WaveState } from "./WaveState";
import { ExpCfgData } from "./ExpCfgData";
import { WeapoonDescriptionData } from "./WeapoonDescriptionData";

export enum ColliderGroup {
    Player = 1,
    Enemy,
    Supply,
    Close,
    Range,
    Enemy_Range,
    Enemy_Bullet,
    Player_Bullet,
    Weapon,
    Supply_Range
}

export class Config {
    private static instance = new Config();
    private constructor() { }
    public static get Instance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    //当前波次状态
    public static waveState: WaveState = WaveState.Wait;

    public changeWaveState(state: WaveState) {
        Config.waveState = state;
    }


    //boss解锁条件----需要击杀20个敌人
    static BOSS_CREATE_THRESHOLD = 20;

    //地图宽度的一半
    static map_WIDTH: number = 3419 / 2;
    //地图高度的一半
    static map_HEIGHT: number = 2339 / 2;
    //标准速度
    static cfg_Speed: number = 600;
    //主角受伤音效
    static SOUND_HIT = "bullet_impact_body_flesh_05";




    // 群聚生成配置
    static GROUP_SPAWN_PROBABILITY: number = 0.3;
    static MIN_GROUP_DISTANCE: number = 100;
    static MAX_GROUP_DISTANCE: number = 250;


    /**
     * 信息配置
     */

    //玩家血量变化
    static PLAYER_HP_CHANGE = "PlayerHpChange";
    //玩家死亡
    static PLAYER_DEATH = "PlayerDeath";
    //敌人被击中
    static ENEMY_HIT = "EnemyHit";
    //敌人死亡
    static ENEMY_DEATH = "EnemyDeath";
    //经验增加
    static EXP_INCREASE = "ExpIncrease";
    //金币增加
    static GOLD_INCREASE = "GoldIncrease";
    //补给被拾取
    static SUPPLY_PICKUP = "SupplyPickup";
    //升级事件
    static LEVEL_UP = "LevelUp";
    //波次UI改变
    static WAVE_CHANGE_UI = "WaveChangeUI";
    //波次改变
    static WAVE_CHANGE = "WaveChange";
    //波次结束
    static WAVE_END = "WaveEnd";
    //升级界面关闭
    static UPGRADE_UI_CLOSE = "UpgradeUIClose";
    //波次倒计时
    static WAVE_TIME_COUNT = "WaveTimeCount";
    //生命恢复
    static HP_REGENERATION = "HpRegeneration";
    // 添加升级应用事件
    static UPGRADE_APPLIED = "UpgradeApplied";
    //武器射程改变
    static WEAPON_RANGE_CHANGE = "WeaponRangeChange";
    //supply配置数据加载完成
    static SUPPLY_CONFIG_LOADED = "SupplyConfigLoaded";
    //敌人配置数据加载完成
    static ENEMY_CONFIG_LOADED = "EnemyConfigLoaded";
    //supplyPrefab加载完成
    static SUPPLY_PREFAB_LOADED = "SupplyPrefabLoaded";
    //enemyPrefab加载完成
    static ENEMY_PREFAB_LOADED = "EnemyPrefabLoaded";
    //游戏开始
    static GAME_START = "GameStart";
    //选择武器
    static WEAPON_CHOOSE = "WeaponChoose";


    //敌人配置数据
    enemyCfgData: EnemyCfgData[] = [];
    //敌人名称列表
    enemyNameList: Map<string, EnemyCfgData> = new Map();

    //supply配置数据
    supplyCfgData: SupplyCfgData[] = [];
    //supply名称列表
    supplyNameList: Map<string, SupplyCfgData> = new Map();

    //武器配置数据
    weaponCfgData: FistData[] = [];
    //武器名称列表
    weaponNameList: Map<string, FistData> = new Map();
    //升级选项配置数据
    upgradeCfgData: UpgradeCfgData[] = [];
    upgradeNameList: Map<string, UpgradeCfgData> = new Map();

    //升级经验配置数据
    upgradeExpCfgData: ExpCfgData[] = [];
    upgradeExpNameList: Map<number, ExpCfgData> = new Map();

    //波次配置数据
    waveCfgData: WaveData[] = [];
    waveNameList: Map<number, WaveData> = new Map();

    //武器描述数据
    weaponDescData: WeapoonDescriptionData[] = [];
    //武器描述名称列表
    weaponDescNameList: Map<number, WeapoonDescriptionData> = new Map();

    public getEnemyData(name: string): EnemyCfgData {
        return this.enemyNameList.get(name);
    }

    public getExpData(level: number): ExpCfgData {
        return this.upgradeExpNameList.get(level);
    }

    public getSupplyData(name: string): SupplyCfgData {
        return this.supplyNameList.get(name);
    }

    //获取武器数据
    public getWeaponData(name: string): FistData {
        return this.weaponNameList.get(name);
    }

    //获取波次数据
    public getWaveData(waveNumber: number): WaveData {
        return this.waveNameList.get(waveNumber);
    }

    //获取武器描述数据
    public getWeaponDescData(id: number): WeapoonDescriptionData {
        return this.weaponDescNameList.get(id);
    }

    //加载敌人配置文件(json)
    public loadEnemyConfig(callback = null) {
        resources.load("config/enemy", JsonAsset, (err, asset) => {
            if (err) {
                console.log(err.message);
                return;
            }
            this.enemyNameList.clear();
            const enemyDataList = asset.json.enemies;

            enemyDataList.forEach((data: any) => {
                let cfg = new EnemyCfgData();

                // javascript 内置函数 复制data 到 cfg
                Object.assign(cfg, data);
                this.enemyCfgData.push(cfg);
                this.enemyNameList.set(cfg.name, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

    public loadExpConfig(callback = null) {
        resources.load("config/expList", JsonAsset, (err, asset) => {
            if (err) {
                console.log(err.message);
                return;
            }
            this.upgradeExpNameList.clear();
            const expDataList = asset.json.expList;

            expDataList.forEach((data: any) => {
                let cfg = new ExpCfgData();

                // javascript 内置函数 复制data 到 cfg
                Object.assign(cfg, data);
                this.upgradeExpCfgData.push(cfg);
                this.upgradeExpNameList.set(cfg.level, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

    public loadSupplyConfig(callback = null) {
        resources.load("config/supply", JsonAsset, (err, asset) => {
            if (err) {
                console.log(err.message);
                return;
            }
            this.supplyNameList.clear();
            let supplyDataList = asset.json.supplies;

            supplyDataList.forEach((data: any) => {
                let cfg = new SupplyCfgData();

                Object.assign(cfg, data);
                this.supplyCfgData.push(cfg);
                this.supplyNameList.set(cfg.name, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

    public loadWeaponConfig(callback = null) {
        resources.load("config/weapon", JsonAsset, (err, asset) => {
            if (err) {
                console.log("weaponData 加载失败", err.message);
                return;
            }
            this.weaponNameList.clear();
            let weaponDataList = asset.json.weapons;

            weaponDataList.forEach((data: any) => {
                let cfg = new FistData();

                Object.assign(cfg, data);
                this.weaponCfgData.push(cfg);
                this.weaponNameList.set(cfg.name, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

    public loadWaveConfig(callback = null) {
        resources.load("config/wave", JsonAsset, (err, asset) => {
            if (err) {
                console.log("waveData 加载失败", err.message);
                if (callback) {
                    callback();
                }
                return;
            }
            this.waveNameList.clear();

            let waveDataList = asset.json.waves;

            waveDataList.forEach((data: any) => {
                let cfg = new WaveData();
                Object.assign(cfg, data);
                this.waveCfgData.push(cfg);
                this.waveNameList.set(cfg.waveNumber, cfg);

            });
            //不能写到外面，因为是resource异步加载，需要在加载完成后调用
            if (callback) {
                callback();
            }
        })

    }
    //加载升级配置文件
    public loadUpgradeConfig(callback = null) {
        resources.load("config/upgradeData", JsonAsset, (err, asset) => {
            if (err) {
                console.log("upgradeData 加载失败", err.message);
                return;
            }
            this.upgradeNameList.clear();
            let upgradeDataList = asset.json.upgrades;

            upgradeDataList.forEach((data: any) => {
                let cfg = new UpgradeCfgData();
                Object.assign(cfg, data);
                this.upgradeCfgData.push(cfg);
                this.upgradeNameList.set(cfg.name, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

     //加载升级配置文件
    public loadWeaponDescConfig(callback = null) {
        resources.load("config/weaponDesc", JsonAsset, (err, asset) => {
            if (err) {
                console.log("weaponDescData 加载失败", err.message);
                return;
            }
            this.weaponDescNameList.clear();
            let weaponDescDataList = asset.json.weaponDesc;

            weaponDescDataList.forEach((data: any) => {
                let cfg = new WeapoonDescriptionData();
                Object.assign(cfg, data);
                this.weaponDescData.push(cfg);
                this.weaponDescNameList.set(cfg.id, cfg);
            });
            if (callback) {
                callback();
            }
        });
    }

    
}



