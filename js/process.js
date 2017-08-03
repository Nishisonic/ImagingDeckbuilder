let nowDragObj;
let fleet_data;
let selectTabIdx = 1;
let isItemDrag = false;
let isDropped = false;

$(function() {
    //クリックしたときのファンクションをまとめて指定
    $('.fleet_tab li').click(function() {

        //.index()を使いクリックされたタブが何番目かを調べ、
        //indexという変数に代入します。
        var index = $('.fleet_tab li').index(this);

        //コンテンツを一度すべて非表示にし、
        $('.fleet_content li').css('display','none');

        //クリックされたタブと同じ順番のコンテンツを表示します。
        $('.fleet_content li').eq(index).css('display','block');

        //一度タブについているクラスselectを消し、
        $('.fleet_tab li').removeClass('select');

        //クリックされたタブのみにクラスselectをつけます。
        $(this).addClass('select');

        selectTabIdx = index + 1;

        // 表示変更
        dispStatus(selectTabIdx);

    });

    $('#presetButton').click(function(){
        setPresetDeck();
    });

    iniStatusOption();
});

function iniStatusOption(){
    $(".ship_option_item_alv").change(function(e){
        switch(Number($(this).val())){
            case 0:
                $(this).css('color','#000000');
                break;
            case 1:
            case 2:
            case 3:
                $(this).css('color','#9AB5D0');
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                $(this).css('color','#D49B0E');
                break;
        }
    });
    //ドラッグオブジェクト設定
    $('.drag_ship').draggable({
        //この下２行の記述で、ドラッグしているものが前面に表示される
        stack:'.drag_ship',
        zIndex:10,
        start:function(){
            //今ドラッグしているオブジェクトを格納しておく
            nowDragObj = $(this);
        },
        stop:function(){
            if(!isDropped){
                removeShip($(this).children()[0].id.slice(-1));
            }
            isDropped = false;
        },
    });

    //ドロップオブジェクト設定
    $('.drop_ship').droppable({
        drop: function( event, ui ) {
            if(!isItemDrag){
                swapShip($(this)[0].id.slice(-1),nowDragObj.children()[0].id.slice(-1));
            }
            isDropped = true;
            isItemDrag = false;
        }
    });

    // ドラッグオブジェクト設定
    $('.drag_item').draggable({
        //この下２行の記述で、ドラッグしているものが前面に表示される
        stack:'.drag_item',
        zIndex:10,
        start:function(){
            //今ドラッグしているオブジェクトを格納しておく
            nowDragObj = $(this);
            $(this).css('border-right-style','solid');
            isItemDrag = true;
        },
        stop:function(){
            $(this).css('border-right-style','hidden');
            if(isItemDrag){
                removeItem($(this)[0].id.substr(-2,1),$(this)[0].id.slice(-1),nowDragObj[0].id.slice(-1));
            }
            nowDragObj.css('top',0);
            nowDragObj.css('left',0);
        },
    });
    
    //ドロップオブジェクト設定
    $('.drop_item').droppable({
        drop: function( event, ui ) {
            if($(this)[0].id.substr(-2,1) === nowDragObj[0].id.substr(-2,1)){
                swapItem($(this)[0].id.substr(-2,1),$(this)[0].id.slice(-1),nowDragObj[0].id.slice(-1));
            }
            isItemDrag = false;
        }
    });

    for(let shipIdx = 1;shipIdx <= 6;shipIdx++){
        $('#ship_option_item_removes' + shipIdx).click(function(){
            let idx = Number($(this)[0].id.slice(-1));
            removeItems(idx);
        });

        $('#ship_option_item_removes' + shipIdx).hover(
            function(){
                    let idx = Number($(this)[0].id.slice(-1));
                    $('#item_size' + idx).css('background','#7FE2DB');
                    $(this).append('<div class="arrow_box">全装備解除</div>')
                    $('.arrow_box').css('top',(parseInt($('.arrow_box').css('top')) - 20) + 'px');
                    $('.arrow_box').css('left',(parseInt($('.arrow_box').css('left')) - 2) + 'px');
            },function(){
                let idx = Number($(this)[0].id.slice(-1));
                $('#item_size' + idx).css('background','#BDACA0');
                $(".arrow_box").remove();
            }
        );
        $('#ship_option_item_removes' + shipIdx).mouseover(function(){
            let idx = Number($(this)[0].id.slice(-1));
        });

        $('#ship_option_item_removes' + shipIdx).mouseout(function(){
            let idx = Number($(this)[0].id.slice(-1));
        });
        
        $('#ship_option_set' + shipIdx).click(function(){
            loadPredeck();
        });

        $('#ship_option_lv' + shipIdx).click(function(){
            let idx = Number($(this)[0].id.slice(-1));
            changeShipLv(idx,$(this).val());
        });

        for(let itemIdx = 1;itemIdx <= 5;itemIdx++){
            $('#ship_option_item_alv' + shipIdx + itemIdx).change(function(){
                let idx = Number($(this)[0].id.slice(-2));
                changeItemAlv(Math.floor(idx / 10),idx % 10,$(this).val());
            });
            $('#ship_option_item_lv' + shipIdx + itemIdx).change(function(){
                let idx = Number($(this)[0].id.slice(-2));
                changeItemLv(Math.floor(idx / 10),idx % 10,$(this).val());
            });
            $('#ship_option_item_remove' + shipIdx + itemIdx).click(function(){
                let idx = Number($(this)[0].id.slice(-2));
                removeItem(Math.floor(idx / 10),idx % 10);
            });
        }
    }
}

function setPresetDeck(str){
    let param = arguments.length === 1 ? str : $("#parseDeckFormatLabel").val();
    if(param != ""){
        parseDeckFormat(param);
        loadPredeck(true);
    }
}

function loadPredeck(deckBuilderMode){
    for(let i = 1;i <= 4;i++){
        if(fleet_data[i] != null && Object.keys(fleet_data[i]).length > 0){
            $("#orgImg" + i).attr("src","");
            $("#loader" + i).show();
            formatFleetData(i,deckBuilderMode);
            dispOrganizationImage(i);
            if($('#fleetTab' + i).hasClass('select')){
                dispStatus(i);
            }
        }else {
            $("#orgImg" + i).attr("src","");
        }
    }
}

function getQueryString() {
    if (1 < document.location.search.length) {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        let query = document.location.search.substring(1);

        // クエリの区切り記号 (&) で文字列を配列に分割する
        let parameters = query.split('&');

        let result = new Object();
        for (let i = 0; i < parameters.length; i++) {
            // パラメータ名とパラメータ値に分割する
            let element = parameters[i].split('=');

            let paramName = decodeURIComponent(element[0]);
            let paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加する
            result[paramName] = decodeURIComponent(paramValue);
        }
        return result;
    }
    return null;
}

function parseDeckFormat(str){
    fleet_data = {};
    let json = str.substring(str.indexOf('{'));
    let object = JSON.parse(json);
    if(object['version'] == 4){
        for(let i = 1;i <= 4;i++){
            let fleet = object['f' + i];
            if(fleet == null) continue;
            fleet_data[i] = {};
            for(let j = 1;j <= 6;j++){
                let ship = fleet['s' + j];
                if(ship == null) continue;
                fleet_data[i][j] = {};
                let shipid = parseInt(ship['id']);
                let shiplv = parseInt(ship['lv']);
                let shipluck = parseInt(ship['luck']);
                // 初期運が-1の設定がなされている場合があるため
                shipluck = shipluck === -1 ? getShipParam(shipid).luck : shipluck;
                let items = ship['items'];
                let _items = {};
                for(let k = 1;k <= 4;k++){
                    let item = items['i' + k];
                    if(item == null) continue;
                    let itemid = parseInt(item['id']);
                    if(Number.isNaN(itemid)) continue;
                    let lv = parseInt(item['rf']);
                    lv = Number.isNaN(lv) ? 0 : lv;
                    let alv = parseInt(item['mas']);
                    alv = Number.isNaN(alv) ? 0 : alv;
                    _items[k] = (new ItemDto(itemid,lv,alv));
                }
                let item = items['ix'];
                if(item != null){
                    let itemid = parseInt(item['id']);
                    if(Number.isNaN(itemid)) continue;
                    let lv = parseInt(item['rf']);
                    lv = Number.isNaN(lv) ? 0 : lv;
                    let alv = parseInt(item['mas']);
                    alv = Number.isNaN(alv) ? 0 : alv;
                    _items[5] = (new ItemDto(itemid,lv,alv));
                }
                fleet_data[i][j].ship = new ShipDto(shipid,shiplv,_items,shipluck);
            }
        }
    }
}

function setShipOption(no){
    $('#drag_ship'+ no).append(''+
        '<table border="1" cellspacing="0" style="width:330px;">' +
            '<tr>' +
                '<td id="ship_option_name' + no + '" class="ship_name"></td>' +
                '<td class="drag_ship"><img id="ship_banner_img' + no + '" style="display: block; border-bottom-style:none; width:160px; height:40px;"></img></td>' +
            '</tr>'+
        '</table>' +
        '<table border="1" cellspacing="0" style="width:330px;">' +
            '<tr>' +
                '<td id="ship_option_type' + no + '" class="ship_option_type"></td>' +
                '<td class="ship_option_param">Lv <input id="ship_option_lv' + no + '" type="number" min="1" max="165" value="" style="width:40px;"><input id="ship_option_param_set" type="submit" value="パ" style="height:23px; margin-left:5px;"></td>' +
                '<td class="ship_option_button"><input id="ship_option_set' + no + '" type="submit" value="画像反映" style="height:23px;"></td>' +
            '</tr>'+
        '</table>' +
        getItemListSource(no)
    );

    function getItemListSource(no){
        let result = '<table border="1" cellspacing="0" style="width:330px;">';
        for(let i = 1;i <= 5;i++){
            result += '<tr>';
            if(i == 1) result += '<td rowspan="5" style="width:23px;"><div id="item_size' + no + '" class="item_size"></div><div id="ship_option_item_removes' + no + '" class="reset_item">x</div></td>';
            result += '<td id="ship_option_eq' + no + i + '" style="width:20px; text-align:center;">' + (i == 5 ? '補' : '') + '</td>';
            if(i in fleet_data[selectTabIdx][no].ship.get("items")){
                result += '<td id="ship_option_item' + no + i +'" class="drag_item drop_item"><div id="ship_option_item_name' + no + i + '" class="item_name"></div></td>'+
                        '<td style="padding-left:3px; border-left-style:none;">'+
                            getSelectAlvBoxSource('ship_option_item_alv' + no + i) +
                            getSelectLvBoxSource('ship_option_item_lv' + no + i) +
                            '<span id="ship_option_item_remove' + no + i + '" class="reset_item" style="padding-left:6px; padding-right:4px;">x</span>' +
                        '</td>';
            } else {
                result += '<td id="ship_option_item' + no + i +'" class="drop_item"></td><td style="border-left-style: hidden;"></td>';
            }
            result += '</tr>';
        }
        result += '</table>';
        return result;
    }

    function getSelectAlvBoxSource(id){
        return '<select id="' + id + '" class="ship_option_item_alv">' +
            '<option value="0" style="color:#000000;">-</option>'+
            '<option value="1" style="color:#9AB5D0;">|</option>'+
            '<option value="2" style="color:#9AB5D0;">||</option>'+
            '<option value="3" style="color:#9AB5D0;">|||</option>'+
            '<option value="4" style="color:#D49B0E;">\\</option>' +
            '<option value="5" style="color:#D49B0E;">\\\\</option>' +
            '<option value="6" style="color:#D49B0E;">\\\\\\</option>' +
            '<option value="7" style="color:#D49B0E;">>></option>' +
        '</select>';
    }

    function getSelectLvBoxSource(id){
        return '<select id="' + id + '"  style="margin-left:6px; color:#45A9A5;">' +
            '<option value="0">-</option>' +
            '<option value="1">★+1</option>' +
            '<option value="2">★+2</option>' +
            '<option value="3">★+3</option>' + 
            '<option value="4">★+4</option>' +
            '<option value="5">★+5</option>' +
            '<option value="6">★+6</option>' +
            '<option value="7">★+7</option>' +
            '<option value="8">★+8</option>' +
            '<option value="9">★+9</option>' +
            '<option value="10">★max</option>' +
        '</select>';
    }
}

function resetShipOption(){
    for(let i = 1;i <= 6;i++){
        $('#drag_ship'+ i).empty();
    }
}

function dispStatus(idx){
    if(!(idx in fleet_data)){
        resetShipOption();
        return;
    } 
    let fleet = fleet_data[idx];
    resetShipOption();
    formatFleetData();
    for(let shipIdx in fleet){
        if(fleet[shipIdx] === undefined) continue;
        setShipOption(shipIdx);
        $("#ship_option_name" + shipIdx).text(fleet[shipIdx].ship.get("name"));
        $("#ship_option_type" + shipIdx).text(SHIP_TYPE_DATA[fleet[shipIdx].ship.get("stype")]);
        $("#ship_option_lv" + shipIdx).val(fleet[shipIdx].ship.lv);
        $("#ship_banner_img" + shipIdx).attr("src","https://raw.githubusercontent.com/Nishisonic/KancolleArchive/master/Image/Ship/1/" +fleet[shipIdx].ship.id + ".png");
        let allEq = function(){
            let sum = 0;
            for(let i = 1;i <= 4;i++){
                sum += Number(fleet[shipIdx].ship.get('slot' + i));
            }
            return sum;
        }();
        let items = fleet[shipIdx].ship.get("items");
        // 搭載機数セット
        for(let itemIdx = 1;itemIdx <= fleet[shipIdx].ship.get("slotNum") && allEq > 0;itemIdx++){
            $("#ship_option_eq" + shipIdx + itemIdx).text(fleet[shipIdx].ship.get("slot"+itemIdx));
            if(itemIdx in items && items[itemIdx].get("type4") != 0){
                $("#ship_option_eq" + shipIdx + itemIdx).css('color','#000000');
            } else {
                $("#ship_option_eq" + shipIdx + itemIdx).css('color','#969696');
            }
        }
        // 装備設定
        for(let itemIdx in items){
            let item = items[itemIdx];
            if(item === undefined) continue;
            if(itemIdx <= fleet[shipIdx].ship.get("slotNum")){
                $("#ship_option_item_name" + shipIdx + itemIdx).text(item.get("name"));
                $("#ship_option_item_lv" + shipIdx + itemIdx).val(item.lv);
                $("#ship_option_item_alv" + shipIdx + itemIdx).val(item.alv);
            } else {
                $("#ship_option_item_name" + shipIdx + 5).text(item.get("name"));
                $("#ship_option_item_lv" + shipIdx + 5).val(item.lv);
                $("#ship_option_item_alv" + shipIdx + 5).val(item.alv);
            }
            switch(Number(item.alv)){
                case 0:
                    $("#ship_option_item_alv" + shipIdx + itemIdx).css('color','#000000');
                    break;
                case 1:
                case 2:
                case 3:
                    $("#ship_option_item_alv" + shipIdx + itemIdx).css('color','#9AB5D0');
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                    $("#ship_option_item_alv" + shipIdx + itemIdx).css('color','#D49B0E');
                    break;
            }
        }
    }
    iniStatusOption();
}

function changeShipLv(shipIdx,val){
    fleet_data[selectTabIdx][shipIdx].ship.lv = val;
}

function changeItemAlv(shipIdx,itemIdx,val){
    fleet_data[selectTabIdx][shipIdx].ship.get("items")[itemIdx].alv = Number(val);
}

function changeItemLv(shipIdx,itemIdx,val){
    fleet_data[selectTabIdx][shipIdx].ship.get("items")[itemIdx].lv = Number(val);
}

// 変更必要なし
function removeShip(shipIdx){
    let fleet = fleet_data[selectTabIdx];
    if(!(shipIdx in fleet)) return;
    delete fleet[shipIdx];
    formatFleetData(selectTabIdx);
    dispStatus(selectTabIdx);
}

// 変更必要なし
function removeItems(shipIdx){
    let fleet = fleet_data[selectTabIdx];
    if(!(shipIdx in fleet && itemIdx in fleet[shipIdx].ship.get("items"))) return;
    for(let itemIdx = 1;itemIdx <= 5;itemIdx++){
        delete fleet[shipIdx].ship.get("items")[itemIdx];
    }
    formatFleetData(selectTabIdx);
    dispStatus(selectTabIdx);
}

function removeItem(shipIdx,itemIdx){
    let fleet = fleet_data[selectTabIdx];
    if(!(shipIdx in fleet && itemIdx in fleet[shipIdx].ship.get("items"))) return;
    delete fleet[shipIdx].ship.get("items")[itemIdx];
    formatFleetData(selectTabIdx);
    dispStatus(selectTabIdx);
}

// 変更必要なし
function swapShip(a,b){
    if(!(selectTabIdx in fleet_data)) return;
    let fleet = fleet_data[selectTabIdx];
    fleet[b] = [fleet[a],fleet[a] = fleet[b]][0];
    formatFleetData(selectTabIdx);
    dispStatus(selectTabIdx);
}

function swapItem(shipIdx,a,b){
    if(!(selectTabIdx in fleet_data && shipIdx in fleet_data[selectTabIdx])) return;
    let items = fleet_data[selectTabIdx][shipIdx].ship.get("items");
    items[b] = [items[a],items[a] = items[b]][0];
    formatFleetData(selectTabIdx);
    dispStatus(selectTabIdx);
}

// 艦これ本家の方にデータを整形し直す
function formatFleetData(idx,_deckBuilderMode){
    let deckBuilderMode = _deckBuilderMode === undefined ? false : _deckBuilderMode;
    let fleet = fleet_data[idx];
    if(fleet === undefined) return;
    // 艦順番整形
    // 変更必要なし
    let s = 1,c = 1;
    while(s <= Object.keys(fleet).length && c <= 5){
        if(fleet[s] == undefined){
            fleet[s] = fleet[s + c];
            delete fleet[s + c++];
        } else {
            s++;
            c = 1;
        }
    }
    s = 6;
    while(s > 0 && fleet[s] == undefined){
        delete fleet[s--];
    }
    
    // 装備順番整形改
    for(let j in fleet){
        let items = fleet[j].ship.get("items");
        let slotNum = fleet[j].ship.get("slotNum");
        // undefined排除
        for(let k in items){
            if(items[k] == undefined){
                delete items[k];
            }
        }
        let tmpItems = {};
        let no = 1;
        // でっきみるだー形式
        if(!deckBuilderMode){
            let change = false;
            // ※1
            // もし、5スロ目に装備が入っている場合、
            // 5スロ目のものを補強増設[5]に移す
            if(5 in items){
                tmpItems[5] = items[5];
                change = true;
            }
            // シフトして、順番通りに並べ替える(補強増設を除く)
            for(let k = 1;k < 5;k++){
                if(k in items){
                    tmpItems[no++] = items[k];
                }
            }
            // ※1が実行されなかった場合かつ、
            // 装備数の合計がスロット数を上回った場合
            if(!change && no > slotNum + 1){
                tmpItems[5] = tmpItems[slotNum + 1];
                delete tmpItems[slotNum + 1];
            }
        }
        // デッキビルダー形式
        else {
            // もし、スロット数+1に装備が入っている場合、
            // スロット数+1のものを補強増設[5]に移す
            if((slotNum + 1) in items){
                tmpItems[5] = items[slotNum + 1];
            }
            // シフトして、順番通りに並べ替える(補強増設を除く)
            for(let k = 1;k < slotNum + 1;k++){
                if(k in items){
                    tmpItems[no++] = items[k];
                }
            }
        }
        if(idx == 1) console.log(deckBuilderMode,tmpItems)
        // 書き換え
        fleet[j].ship.set("items",tmpItems);
    }
}