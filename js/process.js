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
    });

    //クリックしたときのファンクションをまとめて指定
    $('.ship_tab li').click(function() {

        //.index()を使いクリックされたタブが何番目かを調べ、
        //indexという変数に代入します。
        var index = $('.ship_tab li').index(this);

        //コンテンツを一度すべて非表示にし、
        $('.ship_content li').css('display','none');

        //クリックされたタブと同じ順番のコンテンツを表示します。
        $('.ship_content li').eq(index).css('display','block');

        //一度タブについているクラスselectを消し、
        $('.ship_tab li').removeClass('select');

        //クリックされたタブのみにクラスselectをつけます。
        $(this).addClass('select');
    });
});

function setPresetDeck(){
    loadPredeck($("#parseDeckFormatLabel").val());
}

function loadPredeck(str){
    let param = arguments.length === 1 ? str : getQueryString() != null ? getQueryString()["predeck"] : "";
    if(param != ""){
        let predeck = parseDeckFormat(param);
        for(let i = 4;i > 0;i--){
            if(predeck[i] !== undefined){
                $("#orgImg" + i).attr("width",32);
                $("#orgImg" + i).attr("src","./img/ajax-loader.gif");
                dispOrganizationImage(i,predeck[i]);
            }else {
                $("#orgImg" + i).attr("src","");
            }
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
    let param = {};
    let json = str.substring(str.indexOf('{'));
    let object = JSON.parse(json);
    if(object['version'] == 4){
        for(let i = 1;i <= 4;i++){
            let fleet = object['f' + i];
            if(fleet === undefined) continue;
            param[i] = {};
            for(let j = 1;j <= 6;j++){
                let ship = fleet['s' + j];
                if(ship === undefined) continue;
                param[i][j] = {};
                let shipid = ship['id'];
                let shiplv = ship['lv'];
                let shipluck = ship['luck'];
                let items = ship['items'];
                let _items = {};
                for(let k = 1;k <= 4;k++){
                    let item = items['i' + k];
                    if(item === undefined) continue;
                    let itemid = item['id'];
                    let lv = item['rf'];
                    let alv = item['mas'];
                    _items[k] = (new ItemDto(itemid,lv,alv));
                }
                let item = items['ix'];
                if(item !== undefined){
                    let itemid = item['id'];
                    let lv = item['rf'];
                    let alv = item['mas'];
                    _items[5] = (new ItemDto(itemid,lv,alv));
                }
                param[i][j].ship = new ShipDto(shipid,shiplv,_items,shipluck);
            }
        }
    }
    return param;
}