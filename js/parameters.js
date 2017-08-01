let SHIP_DATA = {};
let ITEM_DATA = {};
let SHIP_TYPE_DATA = {};

/**
 * 艦船
 * 
 * @param {*} csv 七四式のShipParameterRecord
 * @param {*} start2 api_start2
 */
function ShipParameters(csv,start2){
    this.name = csv["艦船名"];
    this.stype = start2.api_stype; // ShipParameterRecordには存在しないので、api_start2から取得
    this.taik = csv["耐久初期"];
    this.taikMax = csv["耐久最大"];
    this.houg = csv["火力最大"];
    this.souk = csv["装甲最大"];
    this.raig = csv["雷装最大"];
    this.kaihMin = csv["回避初期下限"]; // ケッコンカッコカリ用
    this.kaih = csv["回避最大"];
    this.tyku = csv["対空最大"];
    this.taisMin = csv["対潜初期下限"]; // ケッコンカッコカリ用
    this.tais = csv["対潜最大"];
    this.soku = start2.api_soku; // ShipParameterRecordには存在しないので、api_start2から取得
    this.sakuMin = csv["索敵初期下限"]; // ケッコンカッコカリ用
    this.saku = csv["索敵最大"];
    this.leng = csv["射程"];
    this.luck = csv["運初期"];
    // this.luckMax = csv["運最大"];
    this.slot1 = csv["機数1"];
    this.slot2 = csv["機数2"];
    this.slot3 = csv["機数3"];
    this.slot4 = csv["機数4"];
    this.slotNum = start2.api_slot_num; // ShipParameterRecordには存在しないので、api_start2から取得
}

/**
 * 装備
 * 
 * @param {*} start2 api_start2
 */
function ItemParameters(start2){
    //this.id = start2.api_id;
    // this.sortno = start2.api_sortno;
    this.name = start2.api_name;
    this.type0 = start2.api_type[0];
    this.type1 = start2.api_type[1];
    this.type2 = start2.api_type[2];
    this.type3 = start2.api_type[3];
    this.type4 = start2.api_type[4];
    this.taik = start2.api_taik;
    this.souk = start2.api_souk;
    this.houg = start2.api_houg;
    this.raig = start2.api_raig;
    this.soku = start2.api_soku;
    this.baku = start2.api_baku;
    this.tyku = start2.api_tyku;
    this.tais = start2.api_tais;
    this.atap = start2.api_atap;
    this.houm = start2.api_houm;
    this.raim = start2.api_raim;
    this.houk = start2.api_houk;
    this.raik = start2.api_raik;
    this.bakk = start2.api_bakk;
    this.saku = start2.api_saku;
    this.sakb = start2.api_sakb;
    this.luck = start2.api_luck;
    this.leng = start2.api_leng;
    this.rare = start2.api_rare;
    // this.broken0 = start2.api_broken[0];
    // this.broken1 = start2.api_broken[1];
    // this.broken2 = start2.api_broken[2];
    // this.broken3 = start2.api_broken[3];
    // this.info = start2.api_info;
    // this.usebull = start2.api_usebull;
    // this.cost = start2.api_cost;
    // this.distance = start2.api_distance;
}

/**
 * SHIP_DATA、ITEM_DATAの読み込み
 * 七四式のShipParameterRecord.csv及び航海日誌拡張版のSTART2.jsonを用いる。
 */
$(function(){
    const START2_PATH = "param/START2.json";
    const CSV_PATH = "param/ShipParameterRecord.csv";
    let httpObj = new XMLHttpRequest();
    httpObj.open("get", START2_PATH, true);
    httpObj.onload = function(){
        let master = JSON.parse(this.responseText).api_data;
        let mst_stype = master.api_mst_stype;
        for(let i in mst_stype){
            SHIP_TYPE_DATA[mst_stype[i].api_id] = mst_stype[i].api_name;
        }
        let mst_item = master.api_mst_slotitem;
        for(let i in mst_item){
            ITEM_DATA[mst_item[i].api_id] = new ItemParameters(mst_item[i]);
        }
        let mst_ship = master.api_mst_ship;
        d3.csv(CSV_PATH)
          .mimeType("text/plain; charset=shift_jis")
          .on('load', function (data) {
            for(let i in mst_ship){
                if(mst_ship[i].api_id > 1500) break; // 敵艦除外
                let csv_data = null;
                for(let j in data){
                    if(mst_ship[i].api_id == data[j]["艦船ID"]){
                        csv_data = data[j];
                        break;
                    }
                }
                SHIP_DATA[mst_ship[i].api_id] = new ShipParameters(csv_data,mst_ship[i]);
            }
            // loadPredeck();
            setPresetDeck((getQueryString() != null && "predeck" in getQueryString()) ? getQueryString()["predeck"] : "");
          }).get();
    }
    httpObj.send(null);
});

function getShipParam(id){
    return SHIP_DATA[id];
}

function getItemParam(id){
    return ITEM_DATA[id];
}

function ShipDto(id,lv,items,luck){
    var a = {
        id:id,
        lv:lv,
        origStatus:{},
        get:function(kind){
            if(kind in this.origStatus){
                return this.origStatus[kind];
            }
            return getShipParam(this.id)[kind];
        },
        set:function(kind,param){
            this.origStatus[kind] = param;
        },
    };
    switch(arguments.length){
        case 4:
            a.set("luck",luck);
        case 3:
            a.set("items",items);
            let params = ["taik","houg","souk","raig","kaih","tyku","tais","soku","saku","leng","luck","slot1","slot2","slot3","slot4","slotNum"];
            // マスターデータ
            for(let paramIdx in params){
                let param = params[paramIdx];
                a.set("m_" + param,getShipParam(id)[param]);
            }
            // 装備/ケッコンカッコカリ込
            let params2 = ["taik","souk","houg","raig","soku","baku","tyku","tais","atap","houm","raim","houk","raik","bakk","saku","sakb","luck","leng"];
            for(let paramIdx in params2){
                let param = params2[paramIdx];
                let sum = 0;
                let max = 0;
                for(itemIdx in items){
                    let item = items[itemIdx];
                    sum += item.get(param);
                    if(max < item.get(param)){
                        max = item.get(param);
                    }
                }
                switch(param){
                    case "taik": // 耐久
                        a.set("taik",Number(getShipParam(id)["taik"]) + weddingTaikBonus(id,lv) + sum);
                        break;
                    case "houk": // 回避
                        a.set("kaih",getNowLvStatus(id,lv,"kaih") + sum);
                    case "baku": // 爆装
                    case "atap": // (0)
                    case "houm": // 命中
                    case "raim": // 雷撃命中(0)
                    case "raik": // 雷撃回避(0)
                    case "bakk": // 爆撃回避(0)
                    case "sakb": // 索敵妨害(0)
                        a.set(param, sum);
                        break;
                    case "souk": // 装甲
                    case "houg": // 火力
                    case "raig": // 雷装
                    case "tyku": // 対空
                        a.set(param,Number(getShipParam(id)[param]) + sum);
                        break;
                    case "tais": // 対潜
                    case "saku": // 索敵
                        a.set(param,getNowLvStatus(id,lv,param) + sum);
                        break;
                    case "luck": // 運
                        a.set(param,a.get(param));
                        break;
                    case "soku": // 速力
                    case "leng": // 射程
                        a.set(param,Math.max(Number(getShipParam(id)[param]),max));
                        break;
                }
            }
        default:
            break;
    }
    return a;
}

function getNowLvStatus(id,lv,param){
    return Number(getShipParam(id)[(param+"Min")]) + Math.floor((Number(getShipParam(id)[(param)]) - Number(getShipParam(id)[(param+"Min")])) * lv / 99);
}

function weddingTaikBonus(id,lv){
    let taikBonus = function(taik){
        if(taik < 30){
            return 4;
        }
        else if(taik < 40){
            return 5;
        }
        else if(taik < 50){
            return 6;
        }
        else if(taik < 70){
            return 7;
        }
        else if(taik < 90){
            return 8;
        }
        else {
            return 9;
        }
    }
    let shipTaik = Number(getShipParam(id)["taik"]);
    if(lv > 99){
        let shipTaikMax = Number(getShipParam(id)["taikMax"]);
        if(shipTaik + taikBonus(shipTaik) <= shipTaikMax){
            return taikBonus(shipTaik);
        } else {
            return shipTaikMax - shipTaik;
        }
    }
    return 0;
}

function ItemDto(id,lv,alv){
    return {
        id:id,
        lv:lv,
        alv:alv,
        get:function(kind){
            if(kind == lv || kind == alv){
                return this[kind];
            }
            return getItemParam(this.id)[kind];
        },
        // 改修度、熟練度のみ設定可能
        set:function(kind,param){
            if(kind == lv || kind == alv){
                this[kind] = param;
            }
        }
    };
}