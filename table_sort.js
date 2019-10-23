var $$table_sort = (function(){
  var __event = function(target, mode, func , flg){
    flg = (flg) ? flg : false;
		if (target.addEventListener){target.addEventListener(mode, func, flg)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };
  var __currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return __currentScriptTag = scripts[scripts.length-1].src;
  })();
  var __setCss = function(){
    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var current_pathinfo = __urlinfo(__currentScriptTag);
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
  var __upperSelector = function(elm , selectors){
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
	var __urlinfo = function(uri){
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

  var __options = {
    target_selector : ""  // tableタグのselector（複数セット可能）を指定
  };


  var $$ = function(options){

    __setCss();

    if(!options){return;}
    this.options = this.setOptions(options);

    // ページ読み込み後の処理
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : __event(window , "DOMContentLoaded" , (function(e){this.set(e)}).bind(this));break;
      default            : __event(window , "load" , (function(e){this.set(e)}).bind(this));break;
    }
  };


  // optionsセット
  $$.prototype.setOptions = function(options){
    if(!options){return __options}
    var res = {};
    for(var i in __options){
      res[i] = __options[i];
    }
    for(var i in options){
      res[i] = options[i];
    }
    return res;
  };


  // 初期セット
  $$.prototype.set = function(){
    // リストelementの確認
    var targets = document.querySelectorAll(this.options.target_selector);
    if(!targets.length){return}

    // ターゲット別の初期処理を設定
    for(var i=0; i<targets.length; i++){
      // headerにアイコン追加処理
      this.setHeader(targets[i]);
    }
    
    
  }


  // headerにアイコン追加処理
  $$.prototype.setHeader = function(table){
    if(!table){return}
    var header_tr = table.querySelectorAll("tr");
    if(!header_tr.length){return}
    header_tr[0].setAttribute("data-tableSort" , "header");
    var cells = header_tr[0].querySelectorAll(":scope > *");
    var sort_button = "<span class='tableSort-button'><span>";
    for(var i=0; i<cells.length; i++){
      if(cells[i].getAttribute("data-sort") === "none"){continue}
      cells[i].insertAdjacentHTML("beforeend" , sort_button);
      cells[i].setAttribute("data-tableSort","header");
      __event(cells[i] , "click" , (function(e){this.clickHeader(e)}).bind(this));
    }
  };

  // headerの項目をクリックした時のソート処理
  $$.prototype.clickHeader = function(e){
    var cell = e.currentTarget;
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

  $$.prototype.sort = function(cell , mode){
    if(!cell || !mode){return}

    // 兄弟cell一覧の取得
    var cells = cell.parentNode.children;
    cells = [].slice.call(cells); // HTMLCollectionから配列を作成

    // cellの順番を取得
    var num = cells.indexOf(cell);

    // ソートタイプを取得
    var type = cell.getAttribute("data-sort");
    type = (type) ? type : "string";
    
    // 対象項目の値を取得
    var table = __upperSelector(cell , "table");
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
    // var newTbody = document.createElement("tbody");
    // for(var i=0; i<rows.length; i++){
    //   newTbody.appendChild(rows[i]);
    // }
    // table.replaceChild(newTbody , tbody[0]);
  };

  // 昇順
  $$.prototype.sort_proc = function(arr , mode , num , type){
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



  return $$;
})();