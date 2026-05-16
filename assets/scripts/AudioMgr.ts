import { _decorator, AudioClip, AudioSource,resources} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr {
    
    private static _instance: AudioMgr = null;
    private constructor() {
        for (let i = 0; i < 5; i++) {
            this.effectAudioSourcesPool.push(new AudioSource());
        }
    }
    public static get Instance(): AudioMgr {
        if (this._instance == null) {
            AudioMgr._instance = new AudioMgr();
        }
        return AudioMgr._instance;
    }

    effectAudioSourcesPool: AudioSource[] = [];//音效播放器池
    musicVolume: number = 0.5;//背景音乐音量
    effectVolume: number = 1;//音效音量
    clipsBuffer: AudioClip[] = [];//音频片段资源缓存池
    audioSourceBGM: AudioSource = null;//背景音乐播放器

    LoadAudioRes(callback: Function = null) {
        resources.loadDir("AudioClip", AudioClip, (err, clips) => {
            if (err) {
                console.error(err.message);
                return;
            }
            for (let c of clips) {
                this.clipsBuffer[c.name] = c;
            }
            console.log("音频资源加载完成");

            if (callback != null) {
                callback();
            }

        })
    }
    public preloadAudio(name: string, callback: Function = null) {
        if (this.clipsBuffer[name]) {
            callback();
            return;
        }

        resources.load(`AudioClip/${name}`, AudioClip, (err, clip) => {
            if (err) {
                console.error(`预加载音频失败: ${name}`, err.message);
                return;
            }

            this.clipsBuffer[name] = clip;
            callback();
        });
    }

    playBGM(name: string, loop: boolean = true) {
        if (this.audioSourceBGM == null) {
            this.audioSourceBGM = new AudioSource();
        }
        if (this.clipsBuffer[name] == null) {
            console.log("音频片段不存在");
            return;
        }
        this.audioSourceBGM.clip = this.clipsBuffer[name];
        this.audioSourceBGM.loop = loop;
        this.audioSourceBGM.volume = this.musicVolume;
        this.audioSourceBGM.play();

    }

    stopBGM(name: string) {
        if (this.audioSourceBGM == null) {
            return;
        }
        this.audioSourceBGM.stop();
    }

    playEffect(name: string) {
        let audioSourceEffect: AudioSource = null;
        if (this.effectAudioSourcesPool.length > 0) {
            audioSourceEffect = this.effectAudioSourcesPool.shift();
        } else {
            audioSourceEffect = new AudioSource();
        }
        audioSourceEffect.clip = this.clipsBuffer[name];

        audioSourceEffect.loop = false;
        audioSourceEffect.volume = this.effectVolume;
        audioSourceEffect.play();
    }

}



