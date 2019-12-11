var $$table_sort = (function(){
  var LIB = function(){};
  var SET = function(){};

  LIB.prototype.event = function(target, mode, func , flg){
    flg = (flg) ? flg : false;
		if (target.addEventListener){target.addEventListener(mode, func, flg)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };
  LIB.prototype.currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return this.currentScriptTag = scripts[scripts.length-1].src;
  })();
  LIB.prototype.setCss = function(){
    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var current_pathinfo = this.urlinfo(this.currentScriptTag);
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    var target_css = current_pathinfo.dir + current_pathinfo.file.replace(".js",".css");
    var query = [];
    for(var i in current_pathinfo.query){
      query.push(i);
    }
    css.href = target_css +"?"+ query.join("");
    base.appendChild(css);
  };
  LIB.prototype.upperSelector = function(elm , selectors){
    selectors = (typeof selectors === "object" && selectors.length) ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement){
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }
	LIB.prototype.urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };

  LIB.prototype.pos = function(e , t){

    //エレメント確認処理
    if(!e){return null;}
  
    //途中指定のエレメントチェック（指定がない場合はbody）
    if(typeof(t)=='undefined' || t==null){
      t = document.body;
    }
  
    //デフォルト座標
    var pos={x:0,y:0};
    do{
      //指定エレメントでストップする。
      if(e == t){break}
  
      //対象エレメントが存在しない場合はその辞典で終了
      if(typeof(e)=='undefined' || e==null){return pos;}
  
      //座標を足し込む
      pos.x += e.offsetLeft;
      pos.y += e.offsetTop;
    }
  
    //上位エレメントを参照する
    while(e = e.offsetParent);
  
    //最終座標を返す
    return pos;
  };


  LIB.prototype.options = {
    // tableタグのselector（複数セット可能）を指定
    target_selector : "",

    // 絞り込み機能の使用フラグ [ true:使用する , false:使用しない ]
    refine : true

  };


  var MAIN = function(options){
    var lib = new LIB();
    var set = new SET();

    lib.setCss();

    if(!options){return;}
    this.options = set.options(options);

    // ページ読み込み後の処理
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , (function(e){this.init(e)}).bind(this));break;
      default            : lib.event(window , "load" , (function(e){this.init(e)}).bind(this));break;
    }

    // window-clickイベント設定
    if(typeof window.ontouchstart === "undefined"){
      lib.event(window , "mousedown" ,  (function(e){this.closeSortDislog_start(e)}).bind(this));
      lib.event(window , "mouseup"   ,  (function(e){this.closeSortDislog_end(e)}).bind(this));
    }
    else{
      lib.event(window , "touchstart" ,  (function(e){this.closeSortDislog_start(e)}).bind(this));
      lib.event(window , "touchend"   ,  (function(e){this.closeSortDislog_end(e)}).bind(this));
    }
    

  };


  // optionsセット
  SET.prototype.options = function(options){
    var lib = new LIB();

    if(!options){return lib.options}
    var res = JSON.parse(JSON.stringify(lib.options));
    for(var i in options){
      res[i] = options[i];
    }
    return res;
  };


  // 初期セット
  MAIN.prototype.init = function(){
    // リストelementの確認
    var targets = document.querySelectorAll(this.options.target_selector);
    if(!targets.length){return}

    // ターゲット別の初期処理を設定
    for(var i=0; i<targets.length; i++){
      // headerにアイコン追加処理
      this.header(targets[i]);
    }
  }


  // headerにアイコン追加処理
  MAIN.prototype.header = function(table){
    var lib = new LIB();

    if(!table){return}
    var header_tr = table.querySelectorAll("tr");
    if(!header_tr.length){return}
    header_tr[0].setAttribute("data-tableSort" , "header");
    var cells = header_tr[0].querySelectorAll(":scope > *");
    var button_className = (typeof this.options.refine !== "undefined" && this.options.refine === true) ? "tableRefine-button" : "tableSort-button" ;
    var sort_button = "<span class='"+ button_className +"'><span>";
    for(var i=0; i<cells.length; i++){
      if(cells[i].getAttribute("data-sort") === "none"){continue}
      cells[i].insertAdjacentHTML("beforeend" , sort_button);
      cells[i].setAttribute("data-tableSort","header");
      lib.event(cells[i] , "click" , (function(e){
        this.clickHeader(e)
      }).bind(this));
    }
  };

  // headerの項目をクリックした時のソート処理
  MAIN.prototype.clickHeader = function(e){

    // 絞り込みモード
    if(this.options.refine === true){
      this.viewRefine(e.currentTarget);
    }
    // ソートモード（デフォルト）
    else{
      this.rowSort(e.currentTarget);
    }
  };

  // 絞り込みウィンドウ表示
  MAIN.prototype.viewRefine = function(cell){
    if(!cell){return}

    cell.setAttribute("data-refine" , "1");

    var refine_base = document.querySelector(".refine-base");
    if(refine_base){
      refine_base.parentNode.removeChild(refine_base);
    }

    var cell_pos = new LIB().pos(cell);
    var refine_form = this.get_refineForm();

    var refine_base = document.createElement("div");
    refine_base.className = "refine-base";
    refine_base.style.setProperty("top" , (cell_pos.y + cell.offsetHeight) + "px","");
    refine_base.style.setProperty("left", cell_pos.x + "px","");
    refine_base.style.setProperty("min-width", cell.offsetWidth + "px","");
    refine_base.innerHTML = refine_form;

    // var refine_area = document.createElement("div");
    // refine_area.className = "refine-area";
    // new LIB().event(refine_area , "click" , function(e){
    //   var target = e.target;
    //   if(!target || target.className !== "refine-area"){return}
    //   if(target != e.srcElement){return}
    //   target.parentNode.removeChild(target);
    // });

    document.body.appendChild(refine_base);
    // refine_area.appendChild(refine_base);


  };
  MAIN.prototype.get_refineForm = function(){
    var urlinfo = new LIB().urlinfo(this.currentScriptTag);
    return ""+
    "<input type='text' value=''>"+
    // "<img class='del' src='"+urlinfo.dir +"del.svg'>"+
    "<img class='search' src='"+urlinfo.dir +"search.svg'>"+
    // "<img class='down' src='"+urlinfo.dir +"triangle-down.svg'>"+
    // "<img class='up' src='"+urlinfo.dir +"triangle-up.svg'>"+
    "";
  };


  // sort-windowのclose処理 ----------
  // sort-windowのタッチstartしたエレメント判定
  MAIN.prototype.closeSortDislog_start = function(e){
    var target = e.target;
    if(target
    && !new LIB().upperSelector(target , ".refine-base")){
      this.options.flg_click_sortDialog = true;
    }
    else{
      this.options.flg_click_sortDialog = false;
    }
  }
  // sort-windowのタッチendしたエレメント判定
  MAIN.prototype.closeSortDislog_end = function(e){
    var target = e.target;
    if(target
    && !new LIB().upperSelector(target , ".refine-base")
    && this.options.flg_click_sortDialog === true){
      this.closeSortDislog();
    }
    delete this.options.flg_click_sortDialog;
  }
  // sort-windowが表示されている場合に表示されているダイアログを閉じる
  // return @ [true:削除 , false:何もしない]
  MAIN.prototype.closeSortDislog = function(){
    var target = document.querySelector(".refine-base");
    if(target){
      target.parentNode.removeChild(target);
      return true;
    }
    else{
      return false;
    }
  };
  // ----------

  // headerの項目をクリックした時のソート処理
  MAIN.prototype.rowSort = function(cell){
    if(!cell){return}

    // 昇順(asc)・降順判定(desc)（現在「昇順」の場合に「降順」にセットする）
    var mode = (cell.getAttribute("data-sort-type") !== "asc") ? "asc" : "desc";
    cell.setAttribute("data-sort-type" , mode);

    // 他のheaderセルの情報をクリアする
    var cells = cell.parentNode.children;
    for(var i=0; i<cells.length; i++){
      if(cells[i] === cell){continue}
      if(!cells[i].getAttribute("data-sort-type")){continue}
      cells[i].removeAttribute("data-sort-type");
    }

    // ソート処理
    this.sort(cell , mode);
  };



  MAIN.prototype.sort = function(cell , mode){
    if(!cell || !mode){return}
    var lib = new LIB();

    // 兄弟cell一覧の取得
    var cells = cell.parentNode.children;
    cells = [].slice.call(cells); // HTMLCollectionから配列を作成

    // cellの順番を取得
    var num = cells.indexOf(cell);

    // ソートタイプを取得
    var type = cell.getAttribute("data-sort");
    type = (type) ? type : "string";
    
    // 対象項目の値を取得
    var table = lib.upperSelector(cell , "table");
    if(!table){return}
    var tbody = table.getElementsByTagName("tbody");
    if(!tbody.length){return}
    var rows = tbody[0].querySelectorAll(":scope > tr");
    rows = [].slice.call(rows);

    // ソート実行
    rows = this.sort_proc(rows , mode , num , type);

    // ソート結果を反映
    tbody[0].innerHTML = "";
    for(var i=0; i<rows.length; i++){
      tbody[0].appendChild(rows[i]);
    }
  };

  // 昇順
  MAIN.prototype.sort_proc = function(arr , mode , num , type){
    arr.sort(function(next , crnt){
      if(crnt.getAttribute("data-tableSort") === "header"){return 0}
      var crnt_cell = crnt.children[num];
      var next_cell = next.children[num];
      var crnt_str  = crnt_cell.textContent;
      var next_str  = next_cell.textContent;

      // type別処理
      switch(type){
        case "number":
          crnt_str = Number(crnt_str.replace(/[^0-9\.\-]/g, ''));
          next_str = Number(next_str.replace(/[^0-9\.\-]/g, ''));
          break;

        case "date":
          crnt_str = (function(sp){
            for(var i=0; i<sp.length; i++){
              sp[i] = ("0000" + sp[i].toString()) . slice(-4);
            }
            return sp.join("/");
          })(crnt_str.split("/"));
          next_str = (function(sp){
            for(var i=0; i<sp.length; i++){
              sp[i] = ("0000" + sp[i].toString()) . slice(-4);
            }
            return sp.join("/");
          })(next_str.split("/"));
          break;
          
        case "time":
          crnt_str = (function(sp){
            for(var i=0; i<sp.length; i++){
              sp[i] = ("00" + sp[i].toString()) . slice(-2);
            }
            return sp.join(":");
          })(crnt_str.split(":"));
          next_str = (function(sp){
            for(var i=0; i<sp.length; i++){
              sp[i] = ("00" + sp[i].toString()) . slice(-2);
            }
            return sp.join(":");
          })(next_str.split(":"));
          break;

        case "string":
        default:
          break;
      }

      // mode別処理
      var res = 0;
      switch(mode){
        case "asc":
          if(crnt_str < next_str){res = 1}
          if(crnt_str > next_str){res = -1}
          break;
        case "desc":
          if(crnt_str < next_str){res = -1}
          if(crnt_str > next_str){res = 1}
          break;
      }
      return res;
    });
    return arr;
  };



  return MAIN;
})();