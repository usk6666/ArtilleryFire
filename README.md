# Artillery Fire

セキュリティ診断やペネトレーションテストに使われる目的で作成したFirebaseのブラウザクライアントツールです。
作者がReactの学習がてら開発したものなので、綺麗なコードではありませんがご容赦ください。Firebaseの診断はホワイトボックス形式でやることが多いと思いますが、総合的なリスク評価をしようとすると、実際に攻撃のPoCもやる必要性も出てくるので、そういった際に使うといいと思います。

## できること

- Firebase Authenticationでの各種ログイン/アカウント管理
- Cloud Firestoreに対するアクセス
- Cloud Storegeに対するアクセス
- 各アクション履歴の参照

> Cloud Functionsは実質Web APIなので実装しませんでした。BurpSuiteなりPostmanなり使用してください。
> また、同様の理由でAuthentication向けのREST APIへのアクセスも実装していません。（あくまでSDKつかってアクセスした方が早かったり必要性がある場面のために作成されています）

## Installation

```sh
git clone https://github.com/usk6666/ArtilleryFire.git
cd ArtilleryFire
npm install
npm start
```

## Screenshots

![](./screenshots/init.png)
![](./screenshots/auth.png)
![](./screenshots/firestore.png)
![](./screenshots/storage.png)
![](./screenshots/history.png)


## その他

- MITライセンス
- アクション履歴などのデータはlocalStorageに保存しています
- FirestoreではインプットデータでTimestamp型に対応できるように、eval関数で強引に解決できるようにしています。そもそもセキュリティ診断用のクライアントですし、XSSあるから修正しろみたいな指摘は受け付けません。（XSSなどの危険性を把握した上で作っていますし、使ってください。）