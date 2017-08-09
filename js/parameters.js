const SHIP_DATA = {};
const ITEM_DATA = {};
const SHIP_TYPE_DATA = {};
const ITEM_TYPE2_DATA = {};

/**
 * SHIP_DATA、ITEM_DATAの読み込み
 * 七四式のShipParameterRecord.csv及び航海日誌拡張版のSTART2.jsonを用いる。
 */
$(function () {
    const START2_PATH = "param/START2.json";
    const CSV_PATH = "param/ShipParameterRecord.csv";
    let httpObj = new XMLHttpRequest();
    httpObj.open("get", START2_PATH, true);
    httpObj.onload = function () {
        let master = JSON.parse(this.responseText).api_data;
        master.api_mst_stype.forEach(data => {
            SHIP_TYPE_DATA[data.api_id] = data.api_name;
        });
        master.api_mst_slotitem.forEach(data => {
            ITEM_DATA[data.api_id] = new ItemParameters(data);
        });
        master.api_mst_slotitem_equiptype.forEach(data => {
            ITEM_TYPE2_DATA[data.api_id] = data.api_name;
        });
        let mst_ship = master.api_mst_ship;
        d3.csv(CSV_PATH)
            .mimeType("text/plain; charset=shift_jis")
            .on('load', data => {
                mst_ship.filter(ship => ship.api_id <= 1500).forEach(ship => {
                    let csv_data = data.find(csvArray => ship.api_id == csvArray["艦船ID"]);
                    SHIP_DATA[ship.api_id] = new ShipParameters(csv_data, ship);
                });
                setPresetDeck((getQueryString() != null && "predeck" in getQueryString()) ? getQueryString()["predeck"] : "");
            }).get();
    }
    httpObj.send(null);
});

function getShipParam(id) {
    return SHIP_DATA[id];
}

function getItemParam(id) {
    return ITEM_DATA[id];
}

class ShipDto {
    constructor(id, lv, items, luck) {
        this.id = id;
        this.lv = lv;
        this.items = items;
        this._luck = luck;
        // 艦娘素ステータス
        this.param = getShipParam(id);
        // アイテムステータス合計[雑]
        this.itemParam = (() => {
            let val = ItemParameters.EMPTY;
            return val;
        })();
    }
    get name() { return this._name !== undefined ? this._name : this.param.name; }
    get stype() { return this._stype !== undefined ? this._stype : this.param.stype; }
    get taik() { return (this._taik !== undefined ? this._taik : this.param.taik) + weddingTaikBonus(this.id, this.lv) + this.itemParam.taik; }
    get houg() { return (this._houg !== undefined ? this._houg : this.param.houg) + this.itemParam.houg; }
    get souk() { return (this._souk !== undefined ? this._souk : this.param.souk) + this.itemParam.souk; }
    get raig() { return (this._raig !== undefined ? this._raig : this.param.raig) + this.itemParam.raig; }
    get kaih() { return (this._kaih !== undefined ? this._kaih : (this.param.kaihMin + Math.floor((this.param.kaih - this.param.kaihMin) * this.lv / 99))) + this.itemParam.houk; }
    get tyku() { return (this._tyku !== undefined ? this._tyku : this.param.tyku) + this.itemParam.tyku; }
    get tais() { return (this._tais !== undefined ? this._tais : (this.param.taisMin + Math.floor((this.param.tais - this.param.taisMin) * this.lv / 99))) + this.itemParam.tais; }
    get soku() { return (this._soku !== undefined ? this._soku : this.param.soku); }
    get saku() { return (this._saku !== undefined ? this._saku : (this.param.sakuMin + Math.floor((this.param.saku - this.param.sakuMin) * this.lv / 99))) + this.itemParam.saku; }
    get leng() { return Math.max((this._leng !== undefined ? this._leng : this.param.leng), this.itemParam.leng); }
    get luck() { return (this._luck !== undefined ? this._luck : this.param.luck) + this.itemParam.luck; }
    get slot1() { return this._slot1 !== undefined ? this._slot1 : this.param.slot1; }
    get slot2() { return this._slot2 !== undefined ? this._slot2 : this.param.slot2; }
    get slot3() { return this._slot3 !== undefined ? this._slot3 : this.param.slot3; }
    get slot4() { return this._slot4 !== undefined ? this._slot4 : this.param.slot4; }
    get maxEq() { return this.slot1 + this.slot2 + this.slot3 + this.slot4; }
    get slotNum() { return this._slotNum !== undefined ? this._slotNum : this.param.slotNum; }
    set name(value) { this._name = value; }
    set stype(value) { this._stype = value; }
    set taik(value) { this._taik = value; }
    set houg(value) { this._houg = value; }
    set souk(value) { this._souk = value; }
    set raig(value) { this._raig = value; }
    set kaih(value) { this._kaih = value; }
    set tyku(value) { this._tyku = value; }
    set tais(value) { this._tais = value; }
    set soku(value) { this._soku = value; }
    set saku(value) { this._saku = value; }
    set leng(value) { this._leng = value; }
    set luck(value) { this._luck = value; }
    set slot1(value) { this._slot1 = value; }
    set slot2(value) { this._slot2 = value; }
    set slot3(value) { this._slot3 = value; }
    set slot4(value) { this._slot4 = value; }
    set slotNum(value) { this._slotNum = value; }
}

// maxなどの値はここ
class ShipParameters {
    // 手抜き
    constructor(csv, start2) {
        if (csv === undefined || start2 === undefined) {
            this.id = 0;
            this.name = "";
            this.stype = 0;
            this.taik = 0;
            this.taikMax = 0;
            this.houg = 0;
            this.souk = 0;
            this.raig = 0;
            this.kaihMin = 0;
            this.kaih = 0;
            this.tyku = 0;
            this.taisMin = 0;
            this.tais = 0;
            this.soku = 0;
            this.sakuMin = 0;
            this.saku = 0;
            this.leng = 0;
            this.luck = 0;
            this.luckMax = 0;
            this.slot1 = 0;
            this.slot2 = 0;
            this.slot3 = 0;
            this.slot4 = 0;
            this.slotNum = 0;
        } else {
            this.id = Number(csv["艦船ID"]);
            this.name = csv["艦船名"];
            this.stype = Number(start2.api_stype); // ShipParameterRecordには存在しないので、api_start2から取得
            this.taik = Number(csv["耐久初期"]);
            this.taikMax = Number(csv["耐久最大"]);
            this.houg = Number(csv["火力最大"]);
            this.souk = Number(csv["装甲最大"]);
            this.raig = Number(csv["雷装最大"]);
            this.kaihMin = Number(csv["回避初期下限"]); // ケッコンカッコカリ用
            this.kaih = Number(csv["回避最大"]);
            this.tyku = Number(csv["対空最大"]);
            this.taisMin = Number(csv["対潜初期下限"]); // ケッコンカッコカリ用
            this.tais = Number(csv["対潜最大"]);
            this.soku = Number(start2.api_soku); // ShipParameterRecordには存在しないので、api_start2から取得
            this.sakuMin = Number(csv["索敵初期下限"]); // ケッコンカッコカリ用
            this.saku = Number(csv["索敵最大"]);
            this.leng = Number(csv["射程"]);
            this.luck = Number(csv["運初期"]);
            this.luckMax = Number(csv["運最大"]);
            this.slot1 = Number(csv["機数1"]);
            this.slot2 = Number(csv["機数2"]);
            this.slot3 = Number(csv["機数3"]);
            this.slot4 = Number(csv["機数4"]);
            this.slotNum = Number(start2.api_slot_num); // ShipParameterRecordには存在しないので、api_start2から取得
        }
    }
    static get EMPTY() {
        return new ShipParameters();
    }
}

class ItemParameters {
    constructor(start2) {
        if (start2 === undefined) {
            this.id = 0;
            this.sortno = 0;
            this.name = "";
            this.type0 = 0;
            this.type1 = 0;
            this.type2 = 0;
            this.type3 = 0;
            this.type4 = 0;
            this.taik = 0;
            this.souk = 0;
            this.houg = 0;
            this.raig = 0;
            this.soku = 0;
            this.baku = 0;
            this.tyku = 0;
            this.tais = 0;
            this.atap = 0;
            this.houm = 0;
            this.raim = 0;
            this.houk = 0;
            this.raik = 0;
            this.bakk = 0;
            this.saku = 0;
            this.sakb = 0;
            this.luck = 0;
            this.leng = 0;
            this.rare = 0;
            this.broken0 = 0;
            this.broken1 = 0;
            this.broken2 = 0;
            this.broken3 = 0;
            this.info = "";
            this.usebull = 0;
            this.cost = 0;
            this.distance = 0;
        } else {
            this.id = Number(start2.api_id);
            this.sortno = Number(start2.api_sortno);
            this.name = start2.api_name;
            this.type0 = Number(start2.api_type[0]);
            this.type1 = Number(start2.api_type[1]);
            this.type2 = Number(start2.api_type[2]);
            this.type3 = Number(start2.api_type[3]);
            this.type4 = Number(start2.api_type[4]);
            this.taik = Number(start2.api_taik);
            this.souk = Number(start2.api_souk);
            this.houg = Number(start2.api_houg);
            this.raig = Number(start2.api_raig);
            this.soku = Number(start2.api_soku);
            this.baku = Number(start2.api_baku);
            this.tyku = Number(start2.api_tyku);
            this.tais = Number(start2.api_tais);
            this.atap = Number(start2.api_atap);
            this.houm = Number(start2.api_houm);
            this.raim = Number(start2.api_raim);
            this.houk = Number(start2.api_houk);
            this.raik = Number(start2.api_raik);
            this.bakk = Number(start2.api_bakk);
            this.saku = Number(start2.api_saku);
            this.sakb = Number(start2.api_sakb);
            this.luck = Number(start2.api_luck);
            this.leng = Number(start2.api_leng);
            this.rare = Number(start2.api_rare);
            this.broken0 = Number(start2.api_broken[0]);
            this.broken1 = Number(start2.api_broken[1]);
            this.broken2 = Number(start2.api_broken[2]);
            this.broken3 = Number(start2.api_broken[3]);
            this.info = start2.api_info;
            this.usebull = Number(start2.api_usebull);
            this.cost = Number(start2.api_cost);
            this.distance = Number(start2.api_distance);
        }
    }
    static get EMPTY() {
        return new ItemParameters();
    }
}

class ItemDto {
    constructor(id, lv, alv) {
        this.param = getItemParam(id);
        this._lv = lv;
        this._alv = alv;
    }
    get lv() { return this._lv !== undefined ? this._lv : 0; }
    get alv() { return this._alv !== undefined ? this._alv : 0; }
    set lv(value) { this._lv = value; }
    set alv(value) { this._alv = value; }
    get id() { return this.param.id; }
    get sortno() { return this.param.sortno; }
    get name() { return this.param.name; }
    get type0() { return this.param.type0; }
    get type1() { return this.param.type1; }
    get type2() { return this.param.type2; }
    get type3() { return this.param.type3; }
    get type4() { return this.param.type4; }
    get taik() { return this.param.taik; }
    get souk() { return this.param.souk; }
    get houg() { return this.param.houg; }
    get raig() { return this.param.raig; }
    get soku() { return this.param.soku; }
    get baku() { return this.param.baku; }
    get tyku() { return this.param.tyku; }
    get tais() { return this.param.tais; }
    get atap() { return this.param.atap; }
    get houm() { return this.param.houm; }
    get raim() { return this.param.raim; }
    get houk() { return this.param.houk; }
    get raik() { return this.param.raik; }
    get bakk() { return this.param.bakk; }
    get saku() { return this.param.saku; }
    get sakb() { return this.param.sakb; }
    get luck() { return this.param.luck; }
    get leng() { return this.param.leng; }
    get rare() { return this.param.rare; }
    get broken0() { return this.param.broken0; }
    get broken1() { return this.param.broken1; }
    get broken2() { return this.param.broken2; }
    get broken3() { return this.param.broken3; }
    get info() { return this.param.info; }
    get usebull() { return this.param.usebull; }
    get cost() { return this.param.cost; }
    get distance() { return this.param.distance; }
}

function weddingTaikBonus(id, lv) {
    let taikBonus = taik => {
        if (taik < 30) {
            return 4;
        }
        else if (taik < 40) {
            return 5;
        }
        else if (taik < 50) {
            return 6;
        }
        else if (taik < 70) {
            return 7;
        }
        else if (taik < 90) {
            return 8;
        }
        else {
            return 9;
        }
    }
    if (lv > 99) {
        let shipTaik = getShipParam(id).taik;
        let shipTaikMax = getShipParam(id).taikMax;
        if (shipTaik + taikBonus(shipTaik) <= shipTaikMax) {
            return taikBonus(shipTaik);
        } else {
            return shipTaikMax - shipTaik;
        }
    }
    return 0;
}
