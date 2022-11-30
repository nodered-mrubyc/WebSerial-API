////////////////////////////
//     web serial api     //
////////////////////////////

const encoder = new TextEncoder();
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );
const disConnect = document.getElementById('disConnectButton');

// onConect-関数化- //
let reader, writer, port;
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
            writer = port.writable.getWriter();
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
    let str = "", flag = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();    // シリアルポートからデータを受信する
            if (done) {
                addSerial("Canceled\n");
                console.log("Canceled");
                break;
            }
            const inputValue = new TextDecoder().decode(value);
            addSerial(inputValue);                  // シリアルポートから受信したデータをテキストエリアに表示する
            console.log("receive:" + inputValue);   // シリアルポートから受信したデータをコンソールに表示する
            str += inputValue;

            // シリアルポートからの返答に対応したフラグを立てる
            // console.log(flag);
            // if(String(str).includes("mruby/c")) {
            //     flag = 1;
            // } else if (String(str).includes("/04)")) {
            //     flag = 2;
            // } else if (String(str).includes("bytecode")) {
            //     flag = 3;
            // } else if (String(str).includes("+DONE")) {
            //     flag = 4;
            // } else if (String(str).includes("mruby/c")) {
            //     flag = 5;
            // }
        }
    } catch (error) {
        addSerial("Error: Read" + error + "\n");
        console.log("Serial port read error.");
        console.log(error);
    } finally {
        reader.releaseLock();
        return {
            str,
            flag,
        };
    }
}


// disConnectボタン //
async function disConnectButtonClick() {
    try {
        if (port.readable) {
            await reader.cancel();
            await reader.releaseLock();
            console.log("2");
            // await writer.releaseLock();
            await port.close();
            console.log("3");
            port = null;
            reader = null;
            writer = null;
            console.log("4");
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
const fileInput = document.getElementById("sendInput");
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
async function writeButtonClick() {
    let obj, result = obj || {};
    let ary = new Uint8Array(fileReader.result);    // ArrayBuffer形式で読み込んだファイルをUint8Arrayに変換
    
    // await serialPortWriter("\r\n", "mruby/c", 1);
    // console.log("send:\r\n");
    // await serialPortWriter("version\r\n", "/04)", 2);
    // console.log("view mruby/c version");
    // await serialPortWriter("write " + file_size + "\r\n", "bytecode", 3);
    // console.log("write ready " + file_size);
    // await writer.write(ary);
    // await serialPortWriter("\r\n", "+DONE", 4);
    // console.log("finish write");
    // await serialPortWriter("execute\r\n", "mruby/c", 5);
    // console.log("execute .mrb file");

    // フラグによって送るコマンドを指定する
    // try {
    //     while (true) {
    //         console.log((await serialPortReceive()).flag);
    
    //         switch ((await serialPortReceive()).flag) {
    //             case 0:
    //                 await writer.write(encoder.encode("\r\n"));
    //                 console.log("send:\r\n");
    //                 flag++;
    //                 break;
    //             case 1:
    //                 await writer.write(encoder.encode("version\r\n"));
    //                 console.log("view mruby/c version");
    //                 flag++;
    //                 break;
    //             case 2:
    //                 await writer.write(encoder.encode("write " + file_size + "\r\n"));
    //                 console.log("write ready " + file_size);
    //                 flag++;
    //                 break;
    //             case 3:
    //                 await writer.write(ary); // RBoardに書き込み
    //                 await writer.write(encoder.encode("\r\n"));
    //                 console.log("finish write");
    //                 flag++;
    //                 break;
    //             case 4:
    //                 await writer.write(encoder.encode("execute\r\n"));
    //                 console.log("execute .mrb file");
    //                 flag++;
    //                 break;
    //             case 5:
    //                 flag = 0
    //                 break;
    //         }
    //     }
    // } catch (error) {
    //     console.log("Writer error.");
    //     console.log(error);
    // }
    // console.log((await serialPortReceive()).flag);

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
}

// シリアルポートへの書き込みを行う関数
// function serialPortWriter (command, checkStr) {
//     return new Promise (async (resolve, reject) => {
//         await writer.write(encoder.encode(command));
//         while (!String(serialPortReceive().str).includes(checkStr)) {
//             console.log(serialPortReceive().str);
//             // resolve();
//         }
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