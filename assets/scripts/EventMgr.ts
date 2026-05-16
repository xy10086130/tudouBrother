import { _decorator, Component, Node, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventMgr')
export class EventMgr extends EventTarget {
    private static _instance: EventMgr = null;

    private constructor() {
        super();
    }

    public static get Instance(): EventMgr {
        if (EventMgr._instance == null) {
            EventMgr._instance = new EventMgr();
        }
        return EventMgr._instance;
    }
}


