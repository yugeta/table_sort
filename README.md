Table Sort
==

```
Author  : Yugeta.Koji
Date    : 2019.10.23
History : 
- ver 0.1 : first-commit
- ver 0.2 : refine（絞り込み）機能の追加
- ver 0.3 : refactering
```


# Summary（概要）
- Tableタグのリスト表示のレコード順番のソートを行う。
- ソート前のデフォルト順番をキープしておく場合は、もともとのリスト順番番号を記述したセルを用意する。



# Condition（条件）
- Tableタグの上部に見出し行があり、見出しセルをクリックすることでソート処理を行う。

- mode : ソートの種類は下記の２つ。
  1. asc  : 昇順
  2. desc : 降順

- type : ソートの種別は以下のパターンでセル属性により区別する。
  1. string : 文字列の先頭文字ソート (default)
  2. number : 数値ソート
  3. date   : 日付ソート("/"区切りの数値判別)
  4. time   : 時間ソート(":"区切りの数値判別)

- table/trタグの動的追加・削除が行われる場合、tr追加、削除イベントを取得して、自動ソートを行う。

- ヘッダcellでsort対象にしない場合は data-sort="none" という属性を事前に追加しておくことで、対象外になる。

- cell内にセットされている個別のイベントなどは問題なく自動的に継承されます。



# Caution（注意）
- ＊注意 : tableタグ内のtrタグ順番を変更するため、tr順番を条件キープしなければいけないシステムでは利用できない。
- ソート対象セルで、"rowspan"が使われているtableソートは正確には行なえません。
- table内にtbodyタグが複数存在する場合は先頭のtbody毎にソート処理が行われます。



# UI（デザイン）
- ソートできるヘッダメニューに、▼マークを追加する。



# Installation（設置方法）
- ページ読み込み後にインスタンスをオプションを付けて実行するだけ。


# Request
- 絞り込み機能（複数条件対応）
- 複数ソート機能
- 機能が増えるとアイコンが増えるのでコントロールアイコン機能を付けるか、効率のいいUIの対応
- ソートを戻すモードの追加

# Issue
- 複数絞り込みを行った時の結果反映がされない事象


# 今後の要望機能一覧
- 任意文字列での絞り込み処理
- 縦列の内容を一括リスト表示して選択表示：非表示切り替え機能

