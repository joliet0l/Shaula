// ==UserScript==
// @name     textor
// @namespace
// @version    0.0.1
// @description  save text on some web
// @author     Joliet
// @noframes
// @match    *://www.sexinsex.net/*
// @match    *://www.s-dragon.org/*
// @match    *://www.lungtan.org/*
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM_getValue
// @grant    GM_setValue
// @grant    unsafeWindow
// @grant    GM_xmlhttpRequest
// @grant    GM.xmlHttpRequest
// @grant    GM_openInTab
// @grant    GM.openInTab
// @grant    GM_setClipboard
// @grant    GM.setClipboard
// ==/UserScript==

(() => {
  'use strict';
  var tMscript = document.createElement('script');
  tMscript.innerText = `q = function(cssSelector){return document.querySelector(cssSelector);};qa = function(cssSelector){return document.querySelectorAll(cssSelector);};`;
  document.head.appendChild(tMscript);
  window.q = function(cssSelector) {return document.querySelector(cssSelector);};
  window.qa = function(cssSelector) {return document.querySelectorAll(cssSelector);};
  window.makeEl = function(tag){return document.createElement(tag);};
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+ */
  function GMaddStyle(cssText){
    let a = document.createElement('style');
    a.textContent = cssText;
    let doc = document.head || document.documentElement;
    doc.appendChild(a);
  }
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 获取结构化数据,比如 json Array 等,
   * 应当先将字符串还原为对象,再执行后续操作
   * GMgetValue(name,defaultValue).then((result)=>{
   *   let result = JSON.parse(result);
   *   // other code...
   * };
   */
  function GMgetValue(name, defaultValue) {
    if (typeof GM_getValue === 'function') {
      return new Promise((resolve, reject) => {
      resolve(GM_getValue(name, defaultValue));
      // reject();
      });
    } else {
      return GM.getValue(name, defaultValue);
    }
  }
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 储存结构化数据,比如 json Array 等,
   * 应当先将对象字符串化,
   * GMsetValue(name, JSON.stringify(defaultValue))
   */
  function GMsetValue(name, defaultValue) {
    if (typeof GM_setValue === 'function') {
      GM_setValue(name, defaultValue);
    } else {
      GM.setValue(name, defaultValue);
    }
  }
  function GMxmlhttpRequest(obj){
    if (GM_xmlhttpRequest === "function") {
      GM_xmlhttpRequest(obj);
    } else{
      GM.xmlhttpRequest(obj);
    }
  }
  var replaceRaw,  /*是否嵌入当前页面*/
  episodes,        /*是否启用爱奇艺正确选集*/
  userApisOn;      /*是否加载自定义解析接口*/
  GMaddStyle(`
    /*TMHY:TamperMonkeyHuanYan*/
    #TMHYvideoContainer{z-index:999998;background:rgba(0,0,0,.7);position:fixed;top:7em;left:5em;height:65%;width:65%;resize:both;overflow:auto;box-shadow:2px 2px 5px 5px rgba(255,255,0,.8);}
    /*TMHYVideoContainer*/
    #TMHYvideoContainer button{top:.1em;cursor:pointer;visibility:hidden;font-size:3em;color:#fff;background:transparent;border:0;}
    #TMHYvideoContainer:hover button{visibility:visible;}
    #TMHYvideoContainer:hover button:hover{color:#ff0;}
    #TMHYiframe{height:100%;width:100%;overflow:auto;position:absolute;top:0;left:0;margin:auto;border:0;box-shadow:0 0 3em rgba(0,0,0,.4);z-index:-1;}
    /*TMHYIframe*/
    #TMHYul{position:fixed;top:5em;left:0;padding:0;z-index:999999;}
    #TMHYul li{list-style:none;}
    #TMHYul svg{float:right;}
    .TM1{opacity:0.3;position:relative;padding-right:.5em;width:1.5em;cursor:pointer;}
    .TM1:hover{opacity:1;}
    .TM1 span{display:block;border-radius:0 .3em .3em 0;background-color:#ffff00;border:0;font:bold 1em "微软雅黑"!important;color:#ff0000;margin:0;padding:1em .3em;}
    .TM3{position:absolute;top:0;left:1.5em;display:none;border-radius:.3em;margin:0;padding:0;}
    .TM3 li{float:none;width:6em;margin:0;font-size:1em;padding:.15em 1em;cursor:pointer;color:#3a3a3a!important;background:rgba(255,255,0,0.8);}
    .TM3 li:hover{color:white!important;background:rgba(0,0,0,.8);}
    .TM3 li:last-child{border-radius:0 0 .35em .35em;}
    .TM3 li:first-child{border-radius:.35em .35em 0 0;}
    .TM1:hover .TM3{display:block;}
    /*自定义解析接口,本页播放窗口设置*/
    .TMHYp {position:fixed;top:20%;left:20%;z-index:999999;background:yellow;padding:30px 20px 10px 20px;border-radius:10px;text-align:center;}/*TMHYpanel*/
    .TMHYp * {font-size:16px;background:rgba(255,255,0,1);font-family:'微软雅黑';color:#3a3a3a;border-radius:10px;}
    #tMuserDefine li {margin:5px;width:100%;list-style-type:none;}
    .TMHYp input[type=text] {border-radius:5px !important;border:1px solid #3a3a3a;margin:2px 10px 2px 5px;padding:2px 5px;}
    .TMHYlti {width:350px;}/*TMHYlongTextInput*/
    .TMHYmti {width:160px;}/*TMHYmti*/
    .idelete {float: left;  display: inline-block; color: red; padding: 0 20px !important; cursor: pointer;}
    .iname {padding-right:10px;}
    li:hover .idelete,li:hover .ilink,li:hover .iname {background:rgba(224,175,17,0.62);}
    .TMHYp button {border:1px solid #3a3a3a;border-radius:5px;cursor:pointer;padding: 2px 10px;margin:10px 20px 0 20px;}
    .TMHYp button:hover {background:#3a3a3a;color:yellow;}
    .TMHYClose {position:absolute;top:0;left:0;margin:0!important;}
    .TMHYp fieldset {margin:0;padding:10px;}
    .TMHYp legend {padding:0 10px;}
    .TMHYp label {display:inline-block;}
    .TMHYspan80 {display:inline-block;text-align:right;width:80px;}
    .TMHYspan120 {display:inline-block;text-align:right;width:120px;}
    #inTabSettingSave {position:relative;margin-top:10px;padding:3px 20px;}
  `);

  function copyToClip(data) {
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(data, "text");
    } else {
        GM.setClipboard(data);
    }
  }

  function page_sis() {
    //<div id="postmessage_103705646" class="t_msgfont">
    //   <div style="font-size:14pt" id="postmessage_103705646" class="t_msgfont">
    var stxt = "";
    var tfs = document.getElementsByClassName('t_msgfont');
    if(tfs.length > 0) {
        var cnt = tfs.length;

        for(var i = 0; i < cnt; i++) {
            var elem = tfs.item(i)
            var childNode = elem.firstChild;
            if(childNode != null) {
                if(childNode.nodeName.toLowerCase() == "div")
                    continue;
            }

            var ss = elem.innerText;
            if(ss.length > 200)  {
                stxt = stxt + ss;
            }
        }
    }
    return stxt;
  }
  //for www.s-dragon.com/http://www.lungtan.org
  function page_s_dragon() {
    //all the text content is in <td class="t_f" id="postmessage_74814">
    var stxt = "";
    var tfs = document.getElementsByClassName('t_f');
    if(tfs.length > 0) {
        var cnt = tfs.length;

        for(var i = 0; i < cnt; i++) {
            var ss = tfs.item(i).innerText;
            if(ss.length > 200)  {
                stxt = stxt + ss;
            }
        }
    }
    return stxt;
  }

  function onSaveText() {

    var hname = window.location.host;

    var txt = "";
    if (hname.includes("sis")) {
         txt = page_sis();
    } else if((hname.includes("s-dragon")) || (hname.includes("lungtan"))) {
      txt = page_s_dragon();
    }

    copyToClip(txt);
    alert("复制成功!");

  }

  /*  执行  */
  var div = makeEl("div");
  div.id = "TMHYd";
  var txt = '', i = 0;
  /*提供的接口列表*/
  div.innerHTML = `
    <ul id="TMHYul">
      <li class="TM1"><span id="TMList"">▶</span><ul class="TM3 TM4">
        <li><label id="saveBtn">保存</label></li>
        <li><label id="otherBtn">其他</label></li>
      </ul></li>
      <li class="TM1"><span id="TMSet">▣</span><ul class="TM3">
        <li><label><input type="checkbox" id="intabChekbx">选项1</label></li>
        <li><label><input type="checkbox" id="realLinkChekbx">选项2</label></li>
        <li><input type="checkbox" id="addApiChekBx"><label id="addApiBtn">选项3</label></li>
      </ul></li>
    </ul>
  `;
  document.body.appendChild(div);
  q("#saveBtn").addEventListener('click', onSaveText, false);


})();