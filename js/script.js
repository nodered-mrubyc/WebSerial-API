////////////////////////////
//     web serial api     //
////////////////////////////

const encoder = new TextEncoder();
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );
const disConnect = document.getElementById('disConnectButton');

// onConect-関数化- //
$(function(){
    // 添付ファイルチェンジイベント
    $('.fileinput').on('change', function(){
      let file = $(this).prop('files')[0];
      $('.filelabel').text(file.name);
    });
  });
let reader, port, checkStr = "", str = "";
async function onConnectButtonClick() {
    // シリアルポートへ接続
    try {
        port = await navigator.serial.requestPort();
        await port.open({
            baudRate: 19200,        // ボーレートを19200にする（RBoard用）
            dataBits: 8,            // 1文字あたりのデータビット数を8にする
            stopBits: 1,            // ストップビットを1ビットに設定する
            parity: 'none',         // /パリティビットは送信しない設定にする
            flowControl: 'hardware' // ハードウェアフロー制御を行う
        }).catch(err => console.log(err));
        console.log("Connected serial port.");
        while (port.readable) {
            reader = port.readable.getReader();
            await serialPortReceive();    // シリアルポートからの返答を受け取る
        }
    } catch (error) {
        addSerial("Error: Open" + error + "\n");
        console.log("Serial port open error.");
        console.log(error);
    }
}
// シリアルポートからの返答を受け取る
async function serialPortReceive() {
    try {
        let isWHile = true;
        while (isWHile) {
            const { value, done } = await reader.read();    // シリアルポートからデータを受信する
            if (done) {
                addSerial("Canceled\n");
                console.log("Canceled");
                isWHile = !isWHile;
            }
            // strとcheckStrが一致していれば、whileを抜ける
            // if(str != "" && str.includes(checkStr)) {
            //     isWHile = !isWHile;
            // }
            const inputValue = new TextDecoder().decode(value);
            addSerial(inputValue);                  // シリアルポートから受信したデータをテキストエリアに表示する
            console.log("receive:" + inputValue);   // シリアルポートから受信したデータをコンソールに表示する
            // str += inputValue;
            // console.log(checkStr);
            // console.log(str);
        }
    } catch (error) {
        addSerial("Error: Read" + error + "\n");
        console.log("Serial port read error.");
        console.log(error);
    } finally {
        reader.releaseLock();
        await port.close();
        reader = null;
    }
    return {
        str,
    };
}


// disConnectボタン //
async function disConnectButtonClick() {
    try {
        if (port.readable) {
            await reader.cancel();
            reader = null;
            return;
        } else {
            return;
        }
    } catch (error) {
        addSerial("Error: Close" + error + "\n");
        console.log("Error");
        console.log(error);
    }
}

// ファイルを選択ボタン //
// ファイルのアップロード
// const fileInput = document.getElementById("sendInput");
const fileInput = document.getElementById("file");
let fileReader = new FileReader();   //FileReaderのインスタンスを作成する
let ary, file, file_size = 0;
if (fileInput) {
    fileInput.addEventListener( 'change', function(e) {
        file = fileInput.files[0];   // 1つ目のファイルを読み込む
        // 読み込み完了時のイベント
        fileReader.onload = async () => {
            console.log("OK(file) " + file_size);
            console.log("finish upload file");
        }
        fileReader.readAsArrayBuffer( file );   // 読み込みを実行
        file_size = file.size;                  // 読み込んだファイルのサイズを取得する
        console.log("OK(file) " + file_size);
        console.log("finish upload file");
    }, false)
}

// writeボタン //
let writer;
async function writeButtonClick() {
    writer = port.writable.getWriter();
    let obj, result = obj || {};
    let ary = new Uint8Array(fileReader.result);    // ArrayBuffer形式で読み込んだファイルをUint8Arrayに変換

    // シリアルポートに\r\nを送信する
    await writer.write(encoder.encode("\r\n"));
    console.log("send:\r\n");
    await sleep(700);
    // シリアルポートにversionを送信する
    await writer.write(encoder.encode("version\r\n"));
    console.log("view mruby/c version");
    await sleep(700);
    // シリアルポートにファイルを書き込む準備
    await writer.write(encoder.encode("write " + file_size + "\r\n"));
    console.log("write ready " + file_size);
    await sleep(700);
    // RBoardに.mrbファイルを転送
    await writer.write(ary);                    // RBoardに書き込み
    await writer.write(encoder.encode("\r\n"));
    console.log("finish write");
    await sleep(700);
    // .mrbを実行する
    await writer.write(encoder.encode("execute\r\n"));
    console.log("execute .mrb file");
    await sleep(500);
    
    // serialPortWriter関数を利用
    // await serialPortWriter("\r\n", "mruby/c");
    // console.log("send:\r\n");
    // await serialPortWriter("version\r\n", "/04)");
    // console.log("view mruby/c version");
    // await serialPortWriter("write " + file_size + "\r\n", "bytecode");
    // console.log("write ready " + file_size);
    // await writer.write(ary);
    // await serialPortWriter("\r\n", "+DONE");
    // console.log("finish write");
    // await serialPortWriter("execute\r\n", "mruby/c");
    // console.log("execute .mrb file");

    writer.releaseLock();
}

// シリアルポートへの書き込みを行う関数
// function serialPortWriter (command, check) {
//     return new Promise (async (resolve, reject) => {
//         await writer.write(encoder.encode(command));
//         checkStr = check;
//         console.log(checkStr);
//         while (!str.includes(checkStr)) {
//             console.log(str);
//         }
//         checkStr = "";
//         resolve();
//     })
// }

// RBoardからのレスポンス
function addSerial(msg) {
    var textarea = document.getElementById('outputArea');
    textarea.value += msg;
    textarea.scrollTop = textarea.scrollHeight;
}

//////////////////////////////
//     ruby code editor     //
//////////////////////////////

function save() {
    // テキストエリア内の文字列を取得する
    const code = document.getElementById("input_code").value 

    // 文字列をblob化
    let blob = new Blob([code], { type: "text/plain" }) 

    // BlobをURLに変換
    let url = URL.createObjectURL(blob) 

    // ダウンロード用のaタグ生成
    const link = document.createElement("a") 
    link.href = url 
    link.download = "main.rb" 
    // 要素の追加
    document.body.appendChild(link) 
    // linkをclickすることでダウンロードが完了
    link.click() 

    // 「link」は不要な要素になるので、link要素を削除
    link.parentNode.removeChild(link)
} 