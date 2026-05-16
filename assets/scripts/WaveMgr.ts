import { _decorator, Component, Label, Node, tween } from 'cc';
import { WaveData } from './WaveData';
import { EventMgr } from './EventMgr';
import { Config } from './Config';
import { EnemyFactory } from './EnemyFactory';
import { WaveState } from './WaveState';
const { ccclass, property } = _decorator;

@ccclass('WaveMgr')
export class WaveMgr extends Component {
    public static Instance: WaveMgr = null;
    onLoad() {
        WaveMgr.Instance = this;
    }

    currentWave: number = 0;
    //波次时间
    waveTimer: number = 0;
    //生成敌人间隔
    spawnInterval: number = 0;
    //已生成敌人数量
    enemyCount: number = 0;
    //当前波次数据
    currentWaveData: WaveData = null;

    //TODO
    waveProgress: number = 0;
    start() {
        EventMgr.Instance.on(Config.WAVE_CHANGE, this.waveNext, this);
    }

    waveNext() {
        if (Config.waveState != WaveState.Wait) return;
        Config.Instance.changeWaveState(WaveState.Ongoing);
        this.currentWave++;
        EventMgr.Instance.emit(Config.WAVE_CHANGE_UI, this.currentWave);
        const Wavedata = Config.Instance.getWaveData(this.currentWave);
        this.currentWaveData = Wavedata;
        this.waveTimer = Wavedata.duration;
        this.enemyCount = 0;
        this.spawnInterval = Wavedata.spawnInterval;
        if (Wavedata.infiniteMode) {
            //开始无尽模式
        }
    }

    createEnemy() {
        if (Config.waveState != WaveState.Ongoing) return;

        const enemyTypes = this.currentWaveData.enemyTypes;
        const randomType: string = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyData = Config.Instance.getEnemyData(randomType);
        EnemyFactory.Instance.createEnemy(enemyData);
    }

    endCurrentWave() {
        if (Config.waveState != WaveState.Ongoing) return;
        this.currentWaveData = null;
        EventMgr.Instance.emit(Config.WAVE_END, this.currentWave);

    }

    reset() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.spawnInterval = 0;
        this.enemyCount = 0;
        this.currentWaveData = null;
    }

    update(deltaTime: number) {
        if (Config.waveState != WaveState.Ongoing || !this.currentWaveData) return;
        this.waveTimer -= deltaTime;
        this.spawnInterval += deltaTime;
        EventMgr.Instance.emit(Config.WAVE_TIME_COUNT, Math.ceil(this.waveTimer));//Math.ceil 向上取整


        if (this.spawnInterval >= this.currentWaveData.spawnInterval && this.enemyCount < this.currentWaveData.enemyCount) {

            this.createEnemy();
            this.spawnInterval = 0;
        }
        if (this.waveTimer < 0) {
            this.endCurrentWave();
        }
    }
}


