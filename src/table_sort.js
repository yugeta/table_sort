var $$table_sort = (function(){


  var __options = {
    // tableタグのselector（複数セット可能）を指定
    target_selector : "",

    // ソート機能の使用フラグ [ true:使用する , false:使用しない ]
    sort : true,
    // 絞り込み機能の使用フラグ [ true:使用する , false:使用しない ]
    refine : true,


    // system利用
    srcDir : null

  };

  // ----------
  // Ajax
  var AJAX = function(options){
    if(!options){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return;}
		// open メソッド;
		var option = this.setOption(options);

		// queryデータ
		var data = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		// 実行
		httpoj.open( option.method , option.url , option.async );
		// type
		if(option.type){
			httpoj.setRequestHeader('Content-Type', option.type);
		}
		
		// onload-check
		httpoj.onreadystatechange = function(){
			//readyState値は4で受信完了;
			if (this.readyState==4 && httpoj.status == 200){
				//コールバック
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			//send メソッド
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
		
  };
	AJAX.prototype.dataOption = {
		url:"",
		query:{},
		querys:[],
		data:{},
		form:{},
		async:"true",
		method:"POST",
		type:"application/x-www-form-urlencoded",
		onSuccess:function(res){},
		onError:function(res){}
	};
	AJAX.prototype.option = {};
	AJAX.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
	};
	AJAX.prototype.setOption = function(options){
		var option = {};
		for(var i in this.dataOption){
			if(typeof options[i] != "undefined"){
				option[i] = options[i];
			}
			else{
				option[i] = this.dataOption[i];
			}
		}
		return option;
	};
	AJAX.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){

			// data = option.data;
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}
		return data;
	};

	AJAX.prototype.loadHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new AJAX({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML = div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	AJAX.prototype.orderScripts = function(scripts , target){
		if(!scripts.childNodes.length){return;}
		
		var trash = document.createElement("div");
		var newScript = document.createElement("script");
		if(scripts.childNodes[0].innerHTML){newScript.innerHTML = scripts.childNodes[0].innerHTML;}

		// Attributes
		var attrs = scripts.childNodes[0].attributes;
		for(var i=0; i<attrs.length; i++){
			newScript.setAttribute(attrs[i].name , attrs[i].value);
		}

		// script実行（読み込み）
		target.appendChild(newScript);
		trash.appendChild(scripts.childNodes[0]);
		this.orderScripts(scripts , target);

	};

	AJAX.prototype.addHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new AJAX({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML += div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	AJAX.prototype.lastModified = function(path , callback){
		if(!path || !callback){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return}

		httpoj.open("get" , path);
		httpoj.onreadystatechange = (function(callback){
			if (httpoj.readyState == 4 && httpoj.status == 200) {
				var date = new Date(httpoj.getResponseHeader("last-modified"));
				var res = {
					date : date,
					y : date.getFullYear(),
					m : date.getMonth() + 1,
					d : date.getDate(),
					h : date.getHours(),
					i : date.getMinutes(),
					s : date.getSeconds()
				};
				callback(res);
			}
		}).bind(this,callback);
		httpoj.send(null);
  };


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

  // セル位置からtableタグの座標を取得(col:横順番 , row:縦順番 , body:["table","thead","tfoot","tbody"])
  // colspan,rowspanは考慮しない。
  LIB.prototype.getTablePosition = function(cell){
    var col  = null,
        row  = null,
        body = null;

    if(cell){
      var tr = cell.parentNode;
      var tds = tr.querySelectorAll(":scope > td,:scope > th");
      for(var i=0; i<tds.length; i++){
        if(tds[i] !== cell){continue;}
        col = i;
        break;
      }

      var tbody = tr.parentNode;
      body = tbody.tagName.toLowerCase();
      var trs = tbody.querySelectorAll(":scope > tr");
      for(var i=0; i<trs.length; i++){
        if(trs[i] !== tr){continue;}
        row = i;
        break;
      }
    };
    
    return  {
      col  : col,
      row  : row,
      body : body
    }
  };


  


  var MAIN = function(options){
    var lib = new LIB();
    var set = new SET();

    lib.setCss();

    if(!options){return;}
    this.options = set.options(options);
    this.options.srcDir = lib.urlinfo(new LIB().currentScriptTag).dir;

    // refineモードの場合テンプレートを読み込む(refine.html)
    // if(typeof this.options.refine !== "undefined"
    // && this.options.refine === true){
      this.loadTemplate();
    // }

    // ページ読み込み後の処理
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , (function(e){this.init(e)}).bind(this));break;
      default            : lib.event(window , "load" , (function(e){this.init(e)}).bind(this));break;
    }

    // window-clickイベント設定（複数セットしないようにフラグセットも同時に行う）
    if(typeof window.tablesort_click_event === "undefined"){
      if(typeof window.ontouchstart === "undefined"){
        lib.event(window , "mousedown" ,  (function(e){this.closeSortDislog_start(e)}).bind(this));
        lib.event(window , "mouseup"   ,  (function(e){this.closeSortDislog_end(e)}).bind(this));
      }
      else{
        lib.event(window , "touchstart" ,  (function(e){this.closeSortDislog_start(e)}).bind(this));
        lib.event(window , "touchend"   ,  (function(e){this.closeSortDislog_end(e)}).bind(this));
      }
      window.tablesort_click_event = 1;
    }
  };


  // optionsセット
  SET.prototype.options = function(options){
    if(!options){return __options}
    var res = JSON.parse(JSON.stringify(__options));
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
    var sort_button = "";
    if(this.options.sort === true){
      sort_button = this.options.template_sort;
    }

    var refine_button = "";
    if(this.options.refine === true){
      // refine_button = "<span class='tableRefine-button'><span>";
      refine_button = this.options.template_refine;
    }
    // var button_className = (typeof this.options.refine !== "undefined" && this.options.refine === true) ? "tableRefine-button" : "tableSort-button" ;
    // var sort_button = "<span class='"+ button_className +"'>"+this.options.template_sort+"<span>";

    for(var i=0; i<cells.length; i++){
      if(cells[i].getAttribute("data-sort") === "none"){continue}
      // sort
      if(sort_button){
        cells[i].insertAdjacentHTML("beforeend" , sort_button);
        var btn = cells[i].querySelector(".tableSort-button");
        if(btn){
          lib.event(btn , "click" , (function(e){
            this.clickHeader_sort(e)
          }).bind(this));
        }
      }
      // refine
      if(refine_button){
        cells[i].insertAdjacentHTML("beforeend" , refine_button);
        var btn = cells[i].querySelector(".tableRefine-button");
        if(btn){
          lib.event(btn , "click" , (function(e){
            this.clickHeader_refine(e)
          }).bind(this));
        }
      }
      cells[i].setAttribute("data-tableSort","header");
      // lib.event(cells[i] , "click" , (function(e){
      //   this.clickHeader(e)
      // }).bind(this));
    }
  };

  MAIN.prototype.loadTemplate = function(){
    if(!this.options.srcDir){return}

    // refine-dialog
    if(this.options.refine === true){
      var path = this.options.srcDir + "refine_dialog.html";
      new AJAX({
        url : path,
        async:false,
        onSuccess : (function(res){
          if(!res){
            console.log("Error : input_cache : not-template-file. ("+ path +")");
            return;
          }
          this.options.template_refine_dialog = res;
        }).bind(this)
      });
    }

    // refine
    if(this.options.refine === true){
      var path = this.options.srcDir + "refine.html";
      new AJAX({
        url : path,
        async:false,
        onSuccess : (function(res){
          if(!res){
            console.log("Error : input_cache : not-template-file. ("+ path +")");
            return;
          }
          this.options.template_refine = res;
        }).bind(this)
      });
    }

    // sort
    if(this.options.sort === true){
      var path = this.options.srcDir + "sort.html";
      new AJAX({
        url : path,
        async:false,
        onSuccess : (function(res){
          if(!res){
            console.log("Error : input_cache : not-template-file. ("+ path +")");
            return;
          }
          this.options.template_sort = res;
        }).bind(this)
      });
    }
  };


  // headerの項目をクリックした時のソート処理
  // MAIN.prototype.clickHeader = function(e){

  //   // 絞り込みモード
  //   if(this.options.refine === true){
  //     var cell_header = new LIB().upperSelector(e.currentTarget , "[data-tablesort='header']");
  //     if(cell_header){
  //       this.refine_view(cell_header);
  //     }
  //   }

  //   // sortモード（デフォルト）
  //   else{
  //     var cell_header = new LIB().upperSelector(e.currentTarget , "[data-tablesort='header']");
  //     if(cell_header){
  //       this.rowSort(cell_header);
  //     }
  //   }
  // };

  // sortボタンをクリック
  MAIN.prototype.clickHeader_sort = function(e){
      var cell_header = new LIB().upperSelector(e.currentTarget , "[data-tablesort='header']");
      if(cell_header){
        this.rowSort(cell_header);
      }
  };
  // 絞り込みボタンをクリック
  MAIN.prototype.clickHeader_refine = function(e){
    var cell_header = new LIB().upperSelector(e.currentTarget , "[data-tablesort='header']");
    if(cell_header){
      this.refine_view(cell_header);
    }
  };

  // 絞り込みウィンドウ表示
  MAIN.prototype.refine_view = function(cell){
    if(!cell){return}
    if(typeof this.options.template_refine_dialog === "undefined" || !this.options.template_refine_dialog){return;}

    if(typeof this.options.flg_click_sortDialog !== "undefined"
    && this.options.flg_click_sortDialog === cell){
      // cell.setAttribute("data-refine" , "0");
      delete this.options.flg_click_sortDialog;
      return;
    }

    var refine_base = document.querySelector(".refine-base");

    var cell_pos = new LIB().pos(cell);
    
    // var refine_form = this.get_refineForm();
    var refine_base = document.createElement("div");
    refine_base.targetCell = cell;
    refine_base.className  = "refine-base";
    refine_base.style.setProperty("top" , (cell_pos.y + cell.offsetHeight) + "px","");
    refine_base.style.setProperty("left", cell_pos.x + "px","");
    refine_base.style.setProperty("min-width", cell.offsetWidth + "px","");
    refine_base.innerHTML = this.options.template_refine_dialog;

    document.body.appendChild(refine_base);

    // Registered text
    var refineInput = refine_base.querySelector("input[type='text']");
    var txt = cell.getAttribute("data-refine-txt");
    if(refineInput && txt){
      refineInput.value = txt;
    }

    // focus
    if(refineInput){
      refineInput.focus();
      new LIB().event(refineInput , "keyup" , (function(e){this.refine_keyDown(e)}).bind(this));
    }

    // button-event
    var refineButton = refine_base.querySelector(".button");
    if(refineButton){
      new LIB().event(refineButton , "click" , (function(cell,e){
        this.refine_clickButton(cell,e);
      }).bind(this,cell));
      if(txt){
        refineButton.setAttribute("data-mode","refine-on");
      }
    }

  };

  // refine実行処理
  MAIN.prototype.refine_clickButton = function(cell){
    if(!cell){return;}
    var refine_base = document.querySelector(".refine-base");
    if(!refine_base){return;}
    var refine_text = refine_base.querySelector("input[type='text']");
    if(!refine_text){return;}
    var txt = refine_text.value;

    if(txt){
      var cells = this.get_cell_rows(cell);
      if(!cells || !cells.length){return}
      // check match
      for(var i=0; i<cells.length; i++){
        var tr = new LIB().upperSelector(cells[i],"tr");
        if(cells[i].textContent.match(txt)){
          if(tr.getAttribute("data-hidden")){
            tr.removeAttribute("data-hidden");
          }
        }
        else{
          tr.setAttribute("data-hidden","1");
        }
      }
      // txt-cache
      cell.setAttribute("data-refine-txt" , txt);

      // close-window
      this.refile_close();

      // refine-icon-on
      cell.setAttribute("data-refine" , "1");
    }
    else{
      // console.log("clear");
      this.refine_clear();

      // close-window
      this.refile_close();

      // refine-icon-off
      cell.setAttribute("data-refine" , "0");

      // txt-cache-remove
      if(cell.getAttribute("data-refine-txt")){
        cell.removeAttribute("data-refine-txt");
      }
    }
  };

  MAIN.prototype.refine_clear = function(){
    var cells = document.querySelectorAll("tr[data-hidden='1']");
    for(var i=0; i<cells.length; i++){
      cells[i].removeAttribute("data-hidden");
    }
  };

  // 縦一列のセルを選択
  MAIN.prototype.get_cell_rows = function(cell_head){
// console.log(cell_head);
    if(!cell_head){return}
    var pos = new LIB().getTablePosition(cell_head);
// console.log(pos);
    // var start_row = (pos.body === "table") ? pos.row+1 : 0;
    var table = new LIB().upperSelector(cell_head,"table");
    var cells = [];
    if(pos.body === "table"){
      var row_start = pos.row+1;
      // var table = cell_head.parentNode.parentNode;
      var trs = table.querySelectorAll(":scope > tr");
      for(var i=0; i<trs.length; i++){
        var tds = trs.querySelectorAll(":scope > *");
        if(typeof tds[pos.col] === "undefined"){continue}
        cells.push(tds[pos.col]);
      }
    }
    else{
      var tbodys = table.querySelectorAll(":scope > tbody");
      for(var i=0; i<tbodys.length; i++){
        var trs = tbodys[i].querySelectorAll(":scope > tr");
        for(var j=0; j<trs.length; j++){
          var tds = trs[j].querySelectorAll(":scope > *");
          if(typeof tds[pos.col] === "undefined"){continue}
          cells.push(tds[pos.col]);
        }
      }
    }
    return cells;
  };

  // enter処理
  MAIN.prototype.refine_keyDown = function(e){
    if(e.keyCode == 13){
      var btn = document.querySelector(".refine-base .button");
      if(btn){
        btn.click();
      }
    }
  };


  // sort-windowのclose処理 ----------
  // sort-windowのタッチstartしたエレメント判定
  MAIN.prototype.closeSortDislog_start = function(e){
    var target = e.target;
    var refine_base = new LIB().upperSelector(target , ".refine-base");

    // 絞り込みモード、sortモードのヘッダ部分をクリックした歳
    if(target && !refine_base){
      this.options.flg_click_sortDialog = true;
    }

    // 絞り込みモード内部を選択した場合
    else{
      this.options.flg_click_sortDialog = (refine_base) ? refine_base.targetCell : false;
      // this.options.flg_click_sortDialog = refine_base.targetCell;
    }
  }

  // sort-windowのタッチendしたエレメント判定
  MAIN.prototype.closeSortDislog_end = function(e){
    var target = e.target;
    if(target
    && !new LIB().upperSelector(target , ".refine-base")
    && this.options.flg_click_sortDialog === true){
      this.refile_close(target);
      delete this.options.flg_click_sortDialog;
    }
    else if(this.options.flg_click_sortDialog === false){
      delete this.options.flg_click_sortDialog;
    }
  }

  // sort-windowが表示されている場合に表示されているダイアログを閉じる
  // return @ [true:削除 , false:何もしない]
  MAIN.prototype.refile_close = function(){
    var target = document.querySelector(".refine-base");

    // // refineダイアログが表示されている同じセルをクリックした時
    // if(target && target.targetCell === cell){console.log("+");
    //   target.parentNode.removeChild(target);
    //   return false;
    // }

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