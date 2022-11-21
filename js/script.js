////////////////////////////
//     web serial api     //
////////////////////////////

let port, obj, alert, reader, file_size, i, j, ch, two = [], file, writer;
// const reader = 0 ;
let stopFlag = 0 ;
let result = obj || {};

// タイムアウト
var alertmsg = function(){
    reader.cancel();
}

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
                    // alert = setTimeout(alertmsg, 20);
                    const { value, done } = await reader.read()
                    if (done) {
                        addSerial("Canceled\n") 
                        console.log("Canceled") 
                        break 
                    }
                    //const encoder = new TextEncoder()
                    //const writer = port.writableStream.getWriter()
                    ////シリアルポートに\r\nを送信する
                    //await writer.write(encoder.encode("\r\n"))
                    //writer.abort()

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

// 書き込みボタン //
const button01 = document.getElementById("write01");
//書き込みボタンがクリックされたらserial_port_write()を実行する
if(button01) {
    button01.addEventListener("click", function () { serial_port_write()}, false);
    //シリアルポートに書き込む
    async function serial_port_write() {
        const encoder = new TextEncoder();
        //シリアルポートに\r\nを送信する
        await writer.write(encoder.encode("\r\n"));
        console.log("send:\r\n");

        }
}

    

//const encoder = new TextEncoder() 
//const writer = port.writableStream.getWriter()

// Versionボタン //
async function onVersionButtonClick() {
    // var text = reader.result 
    // fileReader.result = "" 
    const encoder = new TextEncoder() 
    // シリアルポートにVersionを送信する
    // await writer.write(encoder.encode("version\r\n"))
    let array2 = [118, 101, 114, 115, 105, 111, 110, 13, 10]
    // let array2 = [0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x0d, 0x0a]
    let array = new Uint8Array(array2)
    // await writer.write(encoder.encode(array))
    await writer.write(array)
    // for(let i = 0; i < array.length; i++) {
    //     await writer.write(array[i])
    //     console.log(i + "：" + array[i] + "  " + encoder.encode(array[i]))
    // }
    // await writer.write(118)
    // await writer.write(101)
    // await writer.write(114)
    // await writer.write(115)
    // await writer.write(105)
    // await writer.write(111)
    // await writer.write(13)
    // await writer.write(10)
    console.log(encoder.encode("version\r\n"))
    console.log("view mruby/c version") 
}

// Clearボタン //
async function onClearButtonClick() {
    // var text = reader.result 
    // fileReader.result = "" 
    const encoder = new TextEncoder() 
    await writer.write(encoder.encode("clear\r\n"))
    console.log("clear byte code") 
}

// ファイルを選択ボタン //
// ファイルのアップロード
const fileInput = document.getElementById("sendInput")
let fileReader = new FileReader()   //FileReaderのインスタンスを作成する
let ary
if (fileInput) {
    console.log("OK1!")
    file_size = 0
    // fileInput.addEventListener("input", function () { mrbfile_open(); }, false)
    fileInput.addEventListener( 'change', function(e) {
        // file = e.target.files   // 選択ファイルを配列形式で取得
        // console.log(result + "okok")

        file = fileInput.files[0]   // 1つ目のファイルを読み込む
        // 読み込み完了時のイベント
        fileReader.onload = async () => {
            console.log(fileReader.result)
            // ary = new Uint8Array(fileReader.result)
            console.log("OK(file) " + file_size) 
            console.log("finish upload file")
            // await writer.write(ary)
        }
     
        // 読み込みを実行
        //fileReader.readAsBinaryString( file ) 
        fileReader.readAsArrayBuffer( file )
        // console.log(fileReader.result)

        //読み込んだファイルのサイズを取得する
        // file_size = 170
        file_size = file.size

        console.log("OK(file) " + file_size) 

        console.log("finish upload file")
        // mrbfile_open()
    }, false)
}
// async function mrbfile_open() {
//     // fileReader.result = ""
//     console.log("OK2!")
//     // ファイルがアップロードされたら
//     fileInput.onchange = () => {
//         // アップロードされたファイルをArrayBuffer形式で読み込む
//         // fileReader.readAsArrayBuffer(fileReader.result)
//         // let fileResult = fileReader.readAsArrayBuffer(fileInput.files[0])
//     };
//     // file_size = fileReader.result[0].size
//     // console.log("OK(file) " + file_size) 
//     // ファイルが読み込まれたら、コンソールにファイルを読み込んだ結果を表示する
//     console.log("c")
//     fileReader.onload = () => console.log(fileReader.result)
//     console.log("d")
    
//     console.log("finish upload file")
// }

// Readyボタン //
async function onReadyButtonClick() {
    // var text = reader.result 
    // fileReader.result = "" 
    const encoder = new TextEncoder() 
    await writer.write(encoder.encode("write " + file_size + "\r\n"))
    console.log("write ready " + file_size) 
}

// Writeボタン //
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) )
let bytes = [];
        
async function onWriteButtonClick() {
    const encoder = new TextEncoder();
    // 1
    // await writer.write(encoder.encode(fileReader.result));

    // 2
    // const arrayFile = fileReader.result.split('');
    // for(i = 0; i < file_size ; i++) {
    //     console.log(i + "：" + arrayFile[i] + "  " + encoder.encode(arrayFile[i]));
    //     await writer.write(arrayFile[i]);
    //     await sleep( 100 );
    // }

    // 3
    // const arrayFile = fileReader.result.split('');
    // for(i = 0; i < file_size ; i++) {
    //     console.log(i + "：" + arrayFile[i] + "  " + encoder.encode(arrayFile[i]));
    //     await writer.write(encoder.encode(arrayFile[i]));
    //     await sleep( 100 );
    // }

    // 4
    // const arrayFile = fileReader.result.split('');
    // for(i = 0; i < file_size ; i++) {
    //     two.push = encoder.encode(arrayFile[i]).toString(2); //10進数を2進数にする
    //     for(j = 0; j < two.length; j++){
    //         await writer.write(two[j]); //2進数を送る
    //     }
    //     two = [];
    //     await sleep( 100 );
    // }

    // 5
    // const arrayFile = fileReader.result.split('');
    // for(i = 0; i < file_size ; i++) {
    //     two.push = encoder.encode(arrayFile[i]).toString(2); //10進数を2進数にする
    //     for(j = 0; j < two.length; j++){
    //         await writer.write(encoder.encode(two[j])); //2進数を送る
    //     }
    //     two = [];
    //     await sleep( 100 );
    // }

    // 6
    // await writer.write(encoder.encode(fileReader.result));
    // await writer.write(encoder.encode("\r\n"));

    // 7
    // for(i = 0; i < file_size ; i++) {
    //     console.log(i + "：" + fileReader.result.charAt(i) + "  " + encoder.encode(fileReader.result.charAt(i)));
    //     await writer.write(encoder.encode(fileReader.result.charAt(i)));
    //     await sleep( 100 );
    // }
    // await writer.write(encoder.encode("\r\n"));
    
    // 8
    // str = fileReader.result
    // function unpack(str) {
    //     for(var i = 0; i < str.length; i++) {
    //         var char = str.charCodeAt(i);
    //         bytes.push(char >>> 8);
    //         bytes.push(char & 0xFF);
    //     }
    //     return bytes;
    // }

    ary = new Uint8Array(fileReader.result);
    await writer.write(ary);
    await writer.write(encoder.encode("\r\n"));

    console.log("finish write");
}

// Executeボタン //
async function onExecuteButtonClick() {
    // var text = reader.result 
    // fileReader.result = "" 
    const encoder = new TextEncoder()
    await writer.write(encoder.encode("execute\r\n"))

    //const encoder = new TextEncoder();
    // const encoded = encoder.encode("execute", { stream: true });
    // encoded.forEach((chunk) => {
    //     writer.ready
    //     .then(() => {
    //         return writer.write(chunk);
    //     })
    //     .then(() => {
    //         console.log("Chunk written to sink.");
    //     })
    //     .catch((err) => {
    //         console.log("Chunk error:", err);
    //     });
    // });
    // // Call ready again to ensure that all chunks are written
    // //   before closing the writer.
    // writer.ready
    //     .then(() => {
    //     writer.close();
    //     })
    //     .then(() => {
    //     console.log("All chunks written");
    //     })
    //     .catch((err) => {
    //     console.log("Stream error:", err);
    //     });

    console.log("execute .mrb file") 
} 

// RBoardからのレスポンス
function addSerial(msg) {
    var textarea = document.getElementById('outputArea') 
    textarea.value += msg 
    textarea.scrollTop = textarea.scrollHeight 
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