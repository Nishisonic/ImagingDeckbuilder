let itemiconAry = {};

function loadFont(callback){
    //描画を試行する
    //リトライ回数
    let cnt = 0;
    function tryDraw(){
        if(!loaded() && cnt < 30){
            setTimeout(tryDraw, 100);
            cnt++;
        } else {
            callback();
        }
    }
    //webフォントのロード状況を確認する
    let c1 = document.createElement("canvas");
    let c2 = c1.cloneNode(false);
    let ctx1 = c1.getContext("2d");
    let ctx2 = c2.getContext("2d");
    //webフォントと代替フォントとを指定．
    //NOTE:monoscopeだとwebkitでリロード時に失敗する
    ctx1.font = "normal 30px 'ArnoProSemiboldDisplay', serif";
    ctx2.font = "normal 30px serif";
    let text = "0123456789";  
    function loaded(){
        //テキスト幅を比較する
        //webフォントが利用可能となると，フォント幅が一致する．
        let tm1 = ctx1.measureText(text);
        let tm2 = ctx2.measureText(text);
        return tm1.width != tm2.width;
    }
    //処理開始
    tryDraw();
}

// 装備アイコン
function loadItemIcon(callback){
    function getImage(i){
        if(itemiconAry[i] !== undefined){
            callback();
            return;
        }
        let image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = './img/itemicon/' + i + '.png';
        image.addEventListener('load', function(){
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = canvas.height = 30;
            ctx.drawImage(image, -1 * (image.width - 30) / 2, -1 * (image.height - 30) / 2);
            itemiconAry[i] = canvas.toDataURL();
            getImage(i + 1);
        }, false);
        image.addEventListener('error',function(){
            // Http:404
            callback();
        },false);
    }
    getImage(1);
}

// 画像->文字->画像->文字の順で重ねる
function dispOrganizationImage(fleetIdx){
    if(!(fleetIdx in fleet_data)) return;
    let fleet = fleet_data[fleetIdx];
    let fileAry2 = [];
    let keys = Object.keys(fleet);
    let shipIdx = 0;

    function getFileAry(id){
        let fileAry = [];
        fileAry.push({src:'./img/commonAssets[95].png',x:-115,y:-10}); // 背景
        fileAry.push({src:'./img/commonAssets[43].png',x:143,y:9}); // LV
        for(let i = 0;i < 4;i++){
            fileAry.push({src:'./img/commonAssets[99].png',x:20,y:57 + i * 33});
            if(i < Number(fleet[Object.keys(fleet)[shipIdx]].ship.get("slotNum"))){
                fileAry.push({src:'./img/commonAssets[112].png',x:20,y:57 + i * 33});
            }
        }
        if(Object.keys(fleet[Object.keys(fleet)[shipIdx]].ship.get("items")).length > Number(fleet[Object.keys(fleet)[shipIdx]].ship.get("slotNum"))){
            fileAry.push({src:'./img/commonAssets[287].png',x:339,y:323}); // 補強増設說明
            fileAry.push({src:'./img/commonAssets[99].png',x:253,y:331});
            fileAry.push({src:'./img/commonAssets[112].png',x:253,y:331});
        }
        fileAry.push({src:'./img/commonAssets[123].png',x:20,y:224}); // ステータス
        fileAry.push({src:'./img/commonAssets[98].png',x:199,y:3}); // 改修max
        fileAry.push({src:'./img/172.png',x:7,y:39}); // HPバー
        fileAry.push({src:'./img/commonAssets[64].png',x:7,y:39}); // HPバー
        fileAry.push({src:'./img/commonAssets[79].png',x:131,y:38}); // ★
        fileAry.push({src:'./img/commonAssets[79].png',x:143,y:38}); // ★
        fileAry.push({src:'./img/commonAssets[79].png',x:156,y:38}); // ★
        fileAry.push({src:'./img/commonAssets[79].png',x:168,y:38}); // ★
        fileAry.push({src:'./img/commonAssets[79].png',x:181,y:38}); // ★
        fileAry.push({src:'./img/783.png',x:230,y:308}); // 次のレベルまで
        fileAry.push({src:'https://raw.githubusercontent.com/Nishisonic/KancolleArchive/master/Image/Ship/5/' + id + '.png',x:231,y:7});
        return fileAry;
    }

    function drawPhase1(canvas){
        let fileAry = [];
        let strLength = function(str,width){
            let result = str,i = 0;
            while(ctx.measureText(result).width > width){
                result = result.substr(0,result.length - ++i);
            }
            return result.length;
        }
        // 艦名
        let ctx = canvas.getContext('2d');
        let name = fleet[Object.keys(fleet)[shipIdx]].ship.get("name");
        ctx.font="18px 'メイリオ'";
        ctx.fillStyle = "#55493d";
        ctx.fillText(name.substr(0,strLength(name,130)),12,20);
        // HP
        ctx.font="12px 'ArnoProSemiboldDisplay'";
        ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get('taik') + "/" + fleet[Object.keys(fleet)[shipIdx]].ship.get('taik'),78,45);
        // Lv
        ctx.font="23px 'ArnoProSemiboldDisplay'";
        ctx.textAlign = "right";
        ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.lv,197,23,31);
        // ステータス
        ctx.font="18px 'ArnoProSemiboldDisplay'";
        let status = ["taik","houg","souk","raig","kaih","tyku","slot","tais","soku","saku","leng","luck"];
        status.forEach(function(x,i,a){
            switch(x){
                case "taik":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),111,240);
                    break;
                case "souk":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),111,263);
                    break;
                case "kaih":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),111,285);
                    break;
                case "slot":
                    let slot = 0;
                    for(let j = 1;j <= 4;j++){
                        slot += Number(fleet[Object.keys(fleet)[shipIdx]].ship.get("slot"+j));
                    }
                    ctx.fillText(slot,111,309);
                    break;
                case "soku":
                    switch(Number(fleet[Object.keys(fleet)[shipIdx]].ship.get(x))){
                        case 0: // 無
                            fileAry.push({src:'./img/commonAssets[118].png',x:87,y:320});
                            break;
                        case 5: // 低速
                            fileAry.push({src:'./img/commonAssets[114].png',x:82,y:320});
                                break;
                        case 10: // 高速
                            fileAry.push({src:'./img/commonAssets[115].png',x:82,y:320});
                                break;
                        case 15: // 高速+
                            fileAry.push({src:'./img/commonAssets[116].png',x:80.5,y:320});
                                break;
                        case 20: // 最速
                            fileAry.push({src:'./img/commonAssets[117].png',x:82,y:320});
                                break;
                    }
                    break;
                case "leng":
                    switch(Number(fleet[Object.keys(fleet)[shipIdx]].ship.get(x))){
                        case 0: // 無
                            fileAry.push({src:'./img/commonAssets[118].png',x:88,y:342});
                            break;
                        case 1: // 短
                            fileAry.push({src:'./img/commonAssets[119].png',x:88,y:342});
                                break;
                        case 2: // 中
                            fileAry.push({src:'./img/commonAssets[120].png',x:88,y:342});
                                break;
                        case 3: // 長
                            fileAry.push({src:'./img/commonAssets[121].png',x:88,y:342});
                                break;
                        case 4: // 超長
                            fileAry.push({src:'./img/commonAssets[122].png',x:82,y:342});
                                break;
                    }
                    break;
                case "houg":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,240);
                    break;
                case "raig":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,263);
                    break;
                case "tyku":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,285);
                    break;
                case "tais":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,309);
                    break;
                case "saku":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,331);
                    break;
                case "luck":
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),211,354);
                    break;
                default:
                    ctx.fillText(fleet[Object.keys(fleet)[shipIdx]].ship.get(x),111 + i % 2 * 100,239 + Math.floor(i / 2) * 23.5);
                    break;
            }
        });
        let lvImage = function(lv,itemIdx,isSlotEx){
            if(lv > 0){
                if(!isSlotEx){
                    if(lv == 10){
                        fileAry.push({src:'./img/commonAssets[111].png',x:190,y:62+(itemIdx-1)*33}); // ★max
                    } else {
                        fileAry.push({src:'./img/commonAssets[109].png',x:185,y:66+(itemIdx-1)*33}); // ★
                        fileAry.push({src:'./img/commonAssets[110].png',x:196,y:68+(itemIdx-1)*33}); // +
                    }
                } else {
                    if(lv == 10){
                        fileAry.push({src:'./img/commonAssets[111].png',x:423,y:336}); // ★max
                    } else {
                        fileAry.push({src:'./img/commonAssets[109].png',x:418,y:340}); // ★
                        fileAry.push({src:'./img/commonAssets[110].png',x:429,y:342}); // +
                    }
                }
            }
        }
        let alvImage = function(alv,itemIdx,isSlotEx){
            if(isSlotEx){
                switch(alv){
                    case 1:
                        fileAry.push({src:'./img/commonAssets[102].png',x:399,y:333});
                        break;
                    case 2:
                        fileAry.push({src:'./img/commonAssets[103].png',x:399,y:333});
                        break;
                    case 3:
                        fileAry.push({src:'./img/commonAssets[104].png',x:399,y:333});
                        break;
                    case 4:
                        fileAry.push({src:'./img/commonAssets[105].png',x:399,y:333});
                        break;
                    case 5:
                        fileAry.push({src:'./img/commonAssets[106].png',x:399,y:333});
                        break;
                    case 6:
                        fileAry.push({src:'./img/commonAssets[107].png',x:399,y:333});
                        break;
                    case 7:
                        fileAry.push({src:'./img/commonAssets[108].png',x:399,y:333});
                        break;
                }
            } else {
                switch(alv){
                    case 1:
                        fileAry.push({src:'./img/commonAssets[102].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 2:
                        fileAry.push({src:'./img/commonAssets[103].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 3:
                        fileAry.push({src:'./img/commonAssets[104].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 4:
                        fileAry.push({src:'./img/commonAssets[105].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 5:
                        fileAry.push({src:'./img/commonAssets[106].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 6:
                        fileAry.push({src:'./img/commonAssets[107].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                    case 7:
                        fileAry.push({src:'./img/commonAssets[108].png',x:166,y:60+(itemIdx-1)*33});
                        break;
                }
            }
        }
        let layerImage = function(alv,itemIdx,isSlotEx,canUsed){
            if(canUsed){
                if(!isSlotEx){
                    fileAry.push({src:'./img/commonAssets[101].png',x:166,y:63+(itemIdx-1)*33});
                } else {
                    fileAry.push({src:'./img/commonAssets[101].png',x:399,y:336});
                }
                if(alv > 0){
                    if(!isSlotEx){
                        fileAry.push({src:'./img/commonAssets[101].png',x:144,y:63+(itemIdx-1)*33});
                    } else {
                        fileAry.push({src:'./img/commonAssets[101].png',x:373,y:336});
                    }
                }
            }
        }
        // 装備名
        ctx.font="14px 'メイリオ'";
        ctx.textAlign = "left";
        for(let itemIdx in fleet[Object.keys(fleet)[shipIdx]].ship.get("items")){
            let item = fleet[Object.keys(fleet)[shipIdx]].ship.get("items")[itemIdx];
            let length = strLength(item.get("name"),item.alv > 0 ? 140 : 155);
            if(itemIdx <= fleet[Object.keys(fleet)[shipIdx]].ship.get("slotNum")){
                switch(Number(itemIdx)){
                    case 1:
                        fileAry.push({src:itemiconAry[item.get("type3")],x:20,y:57});
                        break;
                    case 2:
                        fileAry.push({src:itemiconAry[item.get("type3")],x:20,y:90});
                        break;
                    case 3:
                        fileAry.push({src:itemiconAry[item.get("type3")],x:20,y:123});
                        break;
                    case 4:
                        fileAry.push({src:itemiconAry[item.get("type3")],x:20,y:156});
                        break;
                }
                ctx.fillText(item.get("name").substr(0,length),54,78+(itemIdx-1)*32.5);
            } else {
                fileAry.push({src:itemiconAry[item.get("type3")],x:253,y:331});
                ctx.fillText(item.get("name").substr(0,length),288,351);
            }
        }
        ctx.font="18px 'ArnoProSemiboldDisplay'";
        ctx.textAlign = "right";
        for(let itemIdx in fleet[Object.keys(fleet)[shipIdx]].ship.get("items")){
            let item = fleet[Object.keys(fleet)[shipIdx]].ship.get("items")[itemIdx];
            if(itemIdx <= fleet[Object.keys(fleet)[shipIdx]].ship.get("slotNum")){
                layerImage(item.alv,itemIdx,false,true);
                alvImage(item.alv,itemIdx,false);
                lvImage(item.lv,itemIdx,false);
                if(item.get("type4") != 0){
                    ctx.fillText(Number(fleet[Object.keys(fleet)[shipIdx]].ship.get("slot"+itemIdx)),18,77+(itemIdx-1)*33);
                }
            } else {
                layerImage(item.alv,itemIdx,true,true);
                alvImage(item.alv,itemIdx,true);
                lvImage(item.lv,itemIdx,true);
            }
        }
        if(Number(fleet[Object.keys(fleet)[shipIdx]].ship.lv) > 99){ // 指輪
            fileAry.push({src:"./img/commonAssets[66].png",x:406,y:261});
        }
        ctx.font="13px 'ArnoProSemiboldDisplay'";
        ctx.fillText(0,287,329);
        fileAry.unshift({src:canvas.toDataURL(),x:0,y:0});

        // 装備
        composite(fileAry,460,365,drawPhase2);
    }

    function drawPhase2(canvas){
        let fileAry = [];
        let ctx = canvas.getContext('2d');
        ctx.font="16px 'ArnoProSemiboldDisplay'";
        ctx.fillStyle = "#45a9a5";

        // 改修値
        for(let itemIdx in fleet[Object.keys(fleet)[shipIdx]].ship.get("items")){
            let item = fleet[Object.keys(fleet)[shipIdx]].ship.get("items")[itemIdx];
            if(item.lv > 9 || item.lv == 0) continue;
            if(itemIdx <= fleet[Object.keys(fleet)[shipIdx]].ship.get("slotNum")){
                ctx.fillText(item.lv,205,77+(itemIdx-1)*33);
            } else {
                ctx.fillText(item.lv,439,351);
            }
        }
        fileAry.push({src:canvas.toDataURL(),x:0,y:0});
        // 装備
        composite(fileAry,460,365,nextImg);
    }

    function nextImg(canvas){
        // 保存
        fileAry2.push({src:canvas.toDataURL(),x:fileAry2.length % 2 * 460,y:Math.floor(fileAry2.length / 2) * 365});
        if(Object.keys(fleet).length > ++shipIdx){
            let fileAry = getFileAry(fleet[Object.keys(fleet)[shipIdx]].ship.id);
            composite(fileAry,460,365,drawPhase1);
        } else {
            composite(fileAry2,shipIdx > 1 ? 920 : 460,Math.ceil(shipIdx / 2) * 365,drawImg);
        }
    }

    function drawImg(canvas){
        $("#loader" + fleetIdx).hide();
        $("#orgImg" + fleetIdx).attr("width",canvas.width == 460 ? "50%" : "100%");
        $("#orgImg" + fleetIdx).attr("src",canvas.toDataURL());
    }

    if(Object.keys(fleet).length > shipIdx){
        let fileAry = getFileAry(fleet[Object.keys(fleet)[shipIdx]].ship.id);
        loadItemIcon(function(){
            loadFont(composite.bind(this,fileAry,460,365,drawPhase1));
        });
    }
}

function composite(fileAry,width,height,callback){
    let numFiles = fileAry.length;
    let loadedCounter = 0;
    let imgAry = [];

    let loadImgs = function(call){
        if(fileAry.length === 0) return;
        let image = new Image();
        image.crossOrigin = 'anonymous';
        let imgData = {img:image,x:0,y:0};

        imgData.img.addEventListener('load', function(){
            loadedCounter++;
            imgAry.push(imgData);
            if(numFiles == loadedCounter){
                display(call); // 画像をすべて読み込んだら描画
            } else {
                loadImgs(call);
            }
        }, false);
        
        imgData.img.src = fileAry[imgAry.length].src;
        imgData.x = fileAry[imgAry.length].x;
        imgData.y = fileAry[imgAry.length].y;
    }

    let display = function(call){
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        for (let i in imgAry){
            let imgSrc = imgAry[i].img.src;
            // canvasの全面に描画
            ctx.drawImage(imgAry[i].img, imgAry[i].x, imgAry[i].y);
            imgAry[i] = null;
        }
        call(canvas);
    }
    loadImgs(callback);
}
