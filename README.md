# Somnium
背景透過＆フレームレスな簡易ブラウザ  
[![CocoaPods](https://img.shields.io/badge/license-MIT-blue.svg)]
(https://github.com/KaguaKurusu/somnium/blob/master/LICENSE)

## このソフトウェアについて
SomniumはOBS Studioのブラウザソースと同様のことを実現するために[Electron](https://www.electronjs.org/)を用いて作成されたソフトウェアです。  
カスタムCSSのエディタ部分には[Ace](https://ace.c9.io/)を用いています。  
OBS Studioのブラウザソースではログインが必要なページを表示することができませんが、Somuniumを用いればログインが必要なページでも背景透過でOBS Studioに取り込めるようできます。  
主にYouTubeのメンバー限定配信でのチャットをOBS Studioへブラウザソースと同様に取り込めるようにするために作成しております。  
なお、YouTubeのメンバー限定配信をOBS Studioへ取り込みたい場合、[わんコメ](https://onecomme.com)を用いることでも実現できます。  
作者は試せる環境がないためわかりませんが、[Streamlabs](https://streamlabs.com/j)のチャットボックスでもできるかもしれません。  

## 動作環境
Windows 64bit、32bit、ARM 64bit

ただし、下記の環境でのみ動作確認しております。
* Windows 11 Pro 22H2 22623.1413 64bit

ARM 64bit環境は持ち合わせていないため、全く動作確認していないことをご承知ください。

## インストール方法
[releases](https://github.com/KaguaKurusu/somnium/releases)よりSomniumSetup.exeをダウンロードして実行してください。

## アンインストール方法
「プログラムのアンインストールと変更」よりアンインストールを実行してください。  

## 配信URLからチャットURLを取得する機能に関して
下記のいずれかのURLをYouTube配信URLのテキストボックスに入力し、取得ボタンをクリックすると、URLのテキストボックスにライブチャットのURLが自動入力されます。
* 配信視聴ページのURL(https://www.youtube.com/watch?v=XXXX)  
* YouTubeの共有をクリックした際に出る動画リンクのURL(https://www.youtube.com/live/XXXX?feature=share)  
* YouTube Studioのライブ配信管理画面のURL(https://studio.youtube.com/video/XXXX/livestreaming)

## カスタムCSSに関して
カスタムCSSの最初に下記コードを入力しておくとウィンドウの移動、リサイズが簡単になります。
```
body{-webkit-app-region:drag;}
```
ただし、ページの要素にアクセスできなくなります。  
ページ遷移を行いたいなどページの要素にアクセスしたい場合は上記のコードを削除してください。

カスタムCSSの入力部分がアクティブの際には、Ctrl + Fで検索、Ctrl + Hで置き換えが実行可能です。

## その他留意点など
* コンテクストメニュー(右クリック押してポップアップ表示されるメニュー)は現在未実装です。  
コピー、貼り付け、切り取りなどはキーボードショートカットまたはメニューバーの編集の個所を利用してください。

* ブラウザウィンドウを最小化してしまうとブラウザの描画更新が止まってしまいます。  
配信でYouTubeのライブチャットを取り込むのに使用する場合、コメント欄が止まってしまいます。
誤って最小化してしまわないように、オプションから最小化可能にするをNoに設定することをお勧めします。  

* ブラウザウィンドウが他のソフトウェアの背面にすべて隠れてしまうと、ブラウザの描画更新が止まってしまう場合があります。  
作者がテストした限りではありますが、OBS Studioのみが前面にある場合はブラウザの描画更新が止まりませんでした。  
OBS Studioのみ前面に置くなど、ブラウザの描画更新が止まらないか事前に確認してください。  

* すべてのウィンドウを閉じてもソフトウェアは終了しません。  
ソフトウェアを終了したい場合は、設定用のウィンドウのメニューバーからファイル > 終了  
もしくはシステムトレイアイコンを右クリックして表示されるメニューの終了をクリックしてください。  
いずれかのウィンドウがアクティブな状態でAlt + F4でも終了できます。

* YouTubeログインのウィンドウはログイン後、YouTubeのページが表示されたら閉じてください。  
ログインが切れてる場合があるので、配信で使用する前にYouTubeログインのウィンドウを表示して、問題ないか確認してみてください。

* カスタムCSSに`body{-webkit-app-region:drag;}`をいれていない場合、ブラウザウィンドウをアクティブにして、Alt + Space → M → 矢印キーいずれかを一回押したのちにマウスカーソルを動かすとウィンドウが移動できます。  
蛇足ですが、画面外にウィンドウが表示されてしまった場合に移動して画面内に持ってくるのに使えるので覚えておくと便利です。

## ビルド方法
下記手順でbuild\Releaseフォルダ内に生成されます。
```
git clone https://github.com/KaguaKurusu/somnium
cd somnium
npm i
npm run build
npm run release
```

## ライセンス
Somniumは
[MIT](https://github.com/KaguaKurusu/adiutory/blob/master/LICENSE)
ライセンスで配布されています。  