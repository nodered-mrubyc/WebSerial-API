////////////////////////////
//     web serial api     //
////////////////////////////

let port, obj, reader, file_size, i, j, ch, two = [], file, writer;
let stopFlag = 0 ;
let result = obj || {};
const encoder = new TextEncoder();

// Connectボタン //
// ポートを確認，RBoardからの読み込み
async function onConnectButtonClick() {
    try {
        // stopFlag = 0 
        port = await navigator.serial.requestPort();     // 初めにシリアルにアクセスする際に必要
        await port.open({ 
            baudRate: 19200,        // ボーレートを19200にする（RBoard用）
            dataBits: 8,            // 1文字あたりのデータビット数を8にする
            stopBits: 1,            // ストップビットを1ビットに設定する
            parity: 'none',         // /パリティビットは送信しない設定にする
            flowControl: 'hardware' // ハードウェアフロー制御を行う
        }).catch(err => console.log(err))
        console.log("接続")
        while (port.readable) {
            writer = port.writable.getWriter()
            reader = port.readable.getReader()
            try {
                while (true) {
                    // シリアルポートからデータを受信する
                    const { value, done } = await reader.read()
                    if (done) {
                        addSerial("Canceled\n") 
                        console.log("Canceled") 
                        break 
                    }
                    const inputValue = new TextDecoder().decode(value) 
                    // シリアルポートから受信したデータをテキストエリアに表示する
                    addSerial(inputValue) 
                    // シリアルポートから受信したデータをコンソールに表示する
                    console.log("receive:" + inputValue) 
                }
            } catch (error) {
                addSerial("Error: Read" + error + "\n") 
                console.log(error) 
            } finally {
                reader.releaseLock() 
            }
        }
    } catch (error) {
        addSerial("Error: Open" + error + "\n") 
        console.log("Error") 
        console.log(error) 
    }
}

// ファイルを選択ボタン //
// ファイルのアップロード
const fileInput = document.getElementById("sendInput");
let fileReader = new FileReader();   //FileReaderのインスタンスを作成する
let ary;
if (fileInput) {
    file_size = 0;
    fileInput.addEventListener( 'change', function(e) {
        file = fileInput.files[0];   // 1つ目のファイルを読み込む
        // 読み込み完了時のイベント
        fileReader.onload = async () => {
            console.log(fileReader.result);
            console.log("OK(file) " + file_size);
            console.log("finish upload file");
        }
        fileReader.readAsArrayBuffer( file );   // 読み込みを実行
        file_size = file.size;                  // 読み込んだファイルのサイズを取得する
        console.log("OK(file) " + file_size);
        console.log("finish upload file");
    }, false)
}

// 書き込みボタン //
// async function onCRLFButtonClick() {
//     // シリアルポートに\r\nを送信する
//     await writer.write(encoder.encode("\r\n"))
//     console.log("send:\r\n") 
// }

// Versionボタン //
// async function onVersionButtonClick() {
//     // シリアルポートにVersionを送信する
//     await writer.write(encoder.encode("version\r\n"))
//     console.log("view mruby/c version") 
// }

// Clearボタン //
// async function onClearButtonClick() {
//     await writer.write(encoder.encode("clear\r\n"))
//     console.log("clear byte code") 
// }

// Readyボタン //
// async function onReadyButtonClick() {
//     await writer.write(encoder.encode("write " + file_size + "\r\n"))
//     console.log("write ready " + file_size) 
// }

// Writeボタン //
// async function onWriteButtonClick() {
//     ary = new Uint8Array(fileReader.result);
//     await writer.write(ary);
//     await writer.write(encoder.encode("\r\n"));

//     console.log("finish write");
// }

// Executeボタン //
// async function onExecuteButtonClick() {
//     await writer.write(encoder.encode("execute\r\n"))
//     console.log("execute .mrb file") 
// } 

// Writeボタン //
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );
async function onWriteButtonClick() {
    let ary = new Uint8Array(fileReader.result);    // ArrayBuffer形式で読み込んだファイルをUint8Arrayに変換
    
    Promise.resolve()
        .then(function(){
            return new Promise(function(resolve, reject){

            })
        })

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
    // ary = new Uint8Array(fileReader.result);    // ArrayBuffer形式で読み込んだファイルをUint8Arrayに変換
    await writer.write(ary);                    // RBoardに書き込み
    await writer.write(encoder.encode("\r\n"));
    console.log("finish write");
    await sleep(700);
    // .mrbを実行する
    await writer.write(encoder.encode("execute\r\n"));
    console.log("execute .mrb file");
    await sleep(500);
} 

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