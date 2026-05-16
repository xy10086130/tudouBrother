import { _decorator, Camera, Color, Component, find, instantiate, Label, Node, Prefab, Sprite, tween, Animation, director } from 'cc';
import { PlayerData } from './PlayerData';
import { Config } from './Config';
import { Player } from './Player';
import { EventMgr } from './EventMgr';
import { ResMgr } from './ResMgr';
import { FistMgr } from './weapon/FistMgr';
import { WaveMgr } from './WaveMgr';
import { WaveState } from './WaveState';
import { AudioMgr } from './AudioMgr';
import { PistolsMgr } from './weapon/PistolsMgr';
const { ccclass, property } = _decorator;

@ccclass('GameSceneMgr')
export class GameSceneMgr extends Component {
    public static Instance: GameSceneMgr = null;
    onLoad() {
        GameSceneMgr.Instance = this;
    }

    @property(Node)
    fistNode: Node = null;

    @property(Node)
    pistolNode: Node = null;

    @property(Sprite)
    hpProgress: Sprite = null;

    @property(Camera)
    camer: Camera = null;

    @property(Prefab)
    upgradeUIPrefab: Prefab = null;

    @property(Prefab)
    upLevelIconPrefab: Prefab = null;

    @property(Label)
    hpLabel: Label = null;

    @property(Sprite)
    expProgress: Sprite = null;
    @property(Label)
    expLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    @property(Label)
    waveNumLabel: Label = null;

    @property(Label)
    countDownLabel: Label = null;

    @property(Node)
    maskNode: Node = null;

    @property(Node)
    endLabel: Node = null;

    upgradeUI: Node = null;

    countDown: number = 20;
    timer: number = 0;
    isGameStarted: boolean = false;
    lastLv: number = 1;
    start() {
        this.initData();
        this.gameStart();
        this.registerEvents();
        this.initUI();

    }

    registerEvents() {
        EventMgr.Instance.on(Config.PLAYER_HP_CHANGE, this.onPlayerHpUIChange, this);
        EventMgr.Instance.on(Config.EXP_INCREASE, this.onExpUIChange, this);
        EventMgr.Instance.on(Config.LEVEL_UP, this.onLevelUp, this);
        EventMgr.Instance.on(Config.GOLD_INCREASE, this.onGoldChange, this);
        EventMgr.Instance.on(Config.WAVE_CHANGE_UI, this.waveChangeUI, this);
        EventMgr.Instance.on(Config.WAVE_END, this.waveEnd, this);//波次结束
        EventMgr.Instance.on(Config.WAVE_TIME_COUNT, this.waveTimeCount, this);//波次倒计时
        EventMgr.Instance.on(Config.UPGRADE_UI_CLOSE, this.upgradeUIClose, this);//升级界面关闭
        EventMgr.Instance.on(Config.PLAYER_DEATH, this.onPlayerDeath, this);//玩家死亡
    }


    gameStart() {
        AudioMgr.Instance.playBGM("gameSceneBGM01");

        let countNode = this.node.getChildByName("countLabel");
        if (!countNode) {
            console.log("找不到countNode");
            return;
        }
        countNode.getComponent(Animation).play()
        this.scheduleOnce(() => {
            ;
            countNode.active = false;
            EventMgr.Instance.emit(Config.WAVE_CHANGE);
        }, 5);
    }


    //err:加载预制体资源比json资源慢，需要等待预制体加载完成后，再加载波次配置
    initData() {
        Config.Instance.loadEnemyConfig(() => {
            EventMgr.Instance.emit(Config.ENEMY_CONFIG_LOADED);
            ResMgr.Instance.loadEnemyPrefabs(() => {
                EventMgr.Instance.emit(Config.ENEMY_PREFAB_LOADED);
                Config.Instance.loadWaveConfig(() => {
                    Config.Instance.changeWaveState(WaveState.Wait);
                });
            });
        });

        Config.Instance.loadSupplyConfig(() => {
            EventMgr.Instance.emit(Config.SUPPLY_CONFIG_LOADED);
            ResMgr.Instance.loadSupplyPrefabs(() => {
                EventMgr.Instance.emit(Config.SUPPLY_PREFAB_LOADED);
            });
        });

        // 5. 加载升级经验配置
        Config.Instance.loadExpConfig();

        // 6. 加载升级图标和配置
        ResMgr.Instance.loadUpgradeIcons(() => {
            Config.Instance.loadUpgradeConfig();
        });

        // 7. 加载武器配置
        Config.Instance.loadWeaponConfig(() => {

            const weaponData1 = Config.Instance.getWeaponData("fist");
            const weaponData2 = Config.Instance.getWeaponData("pistol");

                this.fistNode.active = true;
                this.fistNode.getComponent(FistMgr).init(weaponData1);

            if (PlayerData.Instance.isPistol) {
                this.pistolNode.active = true;
                this.pistolNode.getComponent(PistolsMgr).init(weaponData2);
            }
        });
    }

    initUI() {
        // 初始化血量显示
        this.hpProgress.fillRange = Player.instance.currentHp / PlayerData.Instance.maxHp;
        this.hpLabel.string = `${Player.instance.currentHp}/${PlayerData.Instance.maxHp}`;

        // 初始化经验显示
        this.expProgress.fillRange = 0;
        this.expLabel.string = `Lv.${PlayerData.Instance.Lv}`;

        //初始化金币显示
        this.goldLabel.string = `${PlayerData.Instance.gold}`;

        //初始化波次显示
        this.waveNumLabel.string = `第1波`;
        this.countDownLabel.string = `20`;
    }


    //玩家死亡
    onPlayerDeath() {
        AudioMgr.Instance.stopBGM("gameSceneBGM01");
        Config.Instance.changeWaveState(WaveState.End);
        this.maskNode.active = true;
        this.endLabel.active = true;

        tween(this)
            .delay(2)
            .call(() => {
                director.loadScene("endScene");
            })
            .start();
    }


    onPlayerHpUIChange(hp: number) {
        tween(this.hpProgress)
            .to(0.2, { fillRange: hp / PlayerData.Instance.maxHp }, {
                easing: 'quadOut'
            })
            .start();

        // 立即更新血量标签
        this.hpLabel.string = `${hp}/${PlayerData.Instance.maxHp}`;
    }

    //需要考虑升级后，经验条会重置的动画
    onExpUIChange(exp: any) {
        if (exp.level > this.lastLv) {
            this.expProgress.fillRange = 0;
            this.lastLv = exp.level;
            this.expLabel.string = `Lv.${exp.level}`;
            tween(this.expProgress)
                .to(0.2, { fillRange: exp.currentExp / exp.expToNextLv }, {
                    easing: 'quadOut'
                })
                .start();
        } else {
            tween(this.expProgress)
                .to(0.2, { fillRange: exp.currentExp / exp.expToNextLv }, {
                    easing: 'quadOut'
                })
                .start();
            this.expLabel.string = `Lv.${exp.level}`;
        }
    }

    onGoldChange(gold: number) {
        this.goldLabel.string = `${gold}`;
    }

    onLevelUp(level: number) {
        AudioMgr.Instance.playEffect("level_up");
        let uplevelIcon = instantiate(this.upLevelIconPrefab);
        uplevelIcon.setParent(find("Canvas/ui/upgradeIcons"));
    }

    upgradeUIClose() {
        Config.Instance.changeWaveState(WaveState.Wait);
        this.upgradeUI.destroy();
        Player.instance.changeHp(PlayerData.Instance.maxHp);
        WaveMgr.Instance.waveNext();
    }

    waveChangeUI(waveNum: number) {
        this.waveNumLabel.string = `第${waveNum}波`;
    }

    waveEnd() {
        Config.Instance.changeWaveState(WaveState.Upgrating);
        this.upgradeUI = instantiate(this.upgradeUIPrefab);
        this.upgradeUI.setParent(find("Canvas/ui"));
        this.upgradeUI.setPosition(0, 0);
    }

    waveTimeCount(time: number) {
        this.countDownLabel.string = `${time}`;
        if (time <= 5) {
            this.countDownLabel.color = new Color(255, 50, 50);
            if (time <= 0) {
                this.countDownLabel.string = '';
            }
        } else {
            this.countDownLabel.color = new Color(255, 255, 255);
        }
    }

    update(deltaTime: number) {

    }
}


