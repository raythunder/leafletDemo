/*** 一些公共的方法和变量
 */
var commonMethod = (function() {
  var $body = $("body"),
    pageUrl = location.href;
  /**
   * 消息提示公共方法
   * @param {string} title 提示的内容
   * @param {number} time  提示框消失时间，缺省则为默认3000ms
   */
  var MsgTimeAuto,
    DomMessage = $body.find(".message");
  var setMessage = function(title, time, highly) {
    var outTime = time ? time : 3000;
    clearTimeout(MsgTimeAuto);
    MsgTimeAuto = null;
    DomMessage.text(title);
    $body.addClass("show-message");
    highly && $body.addClass("highly");
    MsgTimeAuto = setTimeout(function() {
      $body.removeClass("show-message highly");
    }, outTime);
  };

  //滚动条调用公共方法
  function scroll(elmentId, customArg) {
    var defaultArg = {
      scrollbars: true,
      mouseWheel: true,
      interactiveScrollbars: true,
      shrinkScrollbars: "scale",
      click: true,
      tap: true,
      fadeScrollbars: true,
      listenX: false
    };
    customArg && (defaultArg = $.extend(defaultArg, customArg));
    return new IScroll(elmentId, defaultArg);
  }

  /**
   * 获取cookie值
   * @param  {string} c_name cookie名称
   * @return {string}        存在返回cookies值，否则返回空。
   */
  function getCookie(c_name) {
    if (localStorage) {
      //如果支持localstorage,则使用localstorage获取数据
      if (!localStorage[c_name]) {
        return "";
      } else {
        var c_name = JSON.parse(localStorage[c_name]);
        if (new Date(c_name.date) > new Date()) {
          return c_name.val;
        } else {
          return "";
        }
      }
    } else {
      //否则使用cookies获取数据
      if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
          c_start = c_start + c_name.length + 1;
          c_end = document.cookie.indexOf(";", c_start);
          if (c_end == -1) c_end = document.cookie.length;
          return unescape(document.cookie.substring(c_start, c_end));
        }
      }
      return "";
    }
  }

  /**
   * 保存cookies
   * @param {string} c_name       cookie的名称
   * @param {string} value        cookie值
   * @param {numbers} expiredays  cookie有效时间
   */
  function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + (expiredays ? expiredays : 100000));
    if (localStorage) {
      //如果支持localstorage,则使用localstorage保存数据
      localStorage[c_name] = JSON.stringify({ val: value, date: exdate });
    } else {
      //否则使用cookies保存数据
      document.cookie =
        c_name +
        "=" +
        escape(value) +
        (expiredays == null ? "" : ";expires=" + exdate.toGMTString());
    }
  }

  /**
   * 对ajax的简单封装，统一错误提示
   */
  function ajax(arg) {
    var defaultArg = {
      type: "GET",
      dataType: "json",
      error: function(data) {
        alert("发生错误，请稍后重试");
        console.log(data);
      }
    };
    $.extend(defaultArg, arg);
    $.ajax(defaultArg);
  }

  //显示弹窗
  function showModal($this) {
    $body.addClass("show-modal");
    $this.addClass("show").removeClass("hide");
    if ($this.hasClass("tool-nav")) {
      $("#scenicTool").addClass("active");
    } else {
      $("#scenicTool").removeClass("active");
    }
  }
  //隐藏弹窗
  function hideModal(This, onlyHideModal) {
    var $modal = $(This.target)
      .parents(".modal")
      .eq(0);
    $modal.hasClass("only-hide-modal") ||
      onlyHideModal ||
      $body.removeClass("show-modal");
    //$body.removeClass("show-modal");
    $modal.removeClass("show").addClass("hide");
    if (!($modal.hasClass("only-hide-modal") || onlyHideModal)) {
      $modal
        .siblings(".show")
        .removeClass("show")
        .addClass("hide");
    }
  }

  //添加属性
  function active($, className) {
    var className = className || "active";
    $.siblings("." + className).removeClass(className);
    $.addClass(className);
  }

  //跳转高德去这儿
  function goToHere(toLon, toLat, viweName) {
    //返回一个函数，在获取到当前位置后调用
    return function(currentLon, currentLat) {
      var url =
        "http://uri.amap.com/navigation?from=" +
        currentLon +
        "," +
        currentLat +
        ",当前位置&to=" +
        toLon +
        "," +
        toLat +
        "," +
        viweName +
        "+&mode=walk&policy=0&src='" +
        location.href +
        "'&coordinate=gaode&callnative=1";

      if (confirm("路线已规划完成，是否跳转到高德地图导航?")) {
        window.location.href = url;
      }
    };
  }

  //返回音频链接
  function getAudioUrl(audioUrlObj) {
    if (audioUrlObj["audioId" + this.audioType]) {
      //存在当前选中的类型音频直接返回
      return audioUrlObj["audioId" + this.audioType];
    }

    if (audioUrlObj["audioId" + this.audioDefaultType]) {
      //存在默认类型音频则返回默认类型
      this.message("当前景点没有您选中的语音类型,已切换为默认类型语音！");
      return audioUrlObj["audioId" + this.audioDefaultType];
    }

    for (var audioId in audioUrlObj) {
      //返回第一个
      this.message("当前景点没有您选中的语音类型,已切换为其它类型语音！");
      return audioUrlObj[audioId];
    }
  }
  var audio = new Audio(),
    $audio = $(audio);

  //L.DomEvent.on(audio,"play", audioPlay);//播放时间变化时更改播放按钮显示状态
  $audio.bind("timeupdate", audioPlaying); //播放时间变化时更改播放按钮显示状态
  $audio.bind("waiting", audioPlayWaiting); //监控缓冲时更改播放按钮显示状态
  $audio.bind("pause", audioPlayPause); //音频结束时更改播放按钮显示状态
  $audio.bind("ended", audioPlayEnd); //音频结束时更改播放按钮显示状态
  $audio.bind("error", audioPlayError); //音频结束时更改播放按钮显示状态

  //音频播放中
  function audioPlaying() {
    commonMethod.$controlBtn &&
      !commonMethod.$controlBtn.hasClass("playing") &&
      commonMethod.$controlBtn.attr("class", "control-play playing");

    if ($audio.data("status") != "playing") {
      $audio.data("status", "playing");
      audio.src &&
        $audio.data("guidePlaying") != "true" &&
        commonMethod.imgAnimateBegin();
    }
  }
  //音频加载中
  function audioPlayWaiting() {
    commonMethod.$controlBtn &&
      !commonMethod.$controlBtn.hasClass("Loading") &&
      commonMethod.$controlBtn.attr("class", "control-play Loading");

    if ($audio.data("status") != "waiting") {
      $audio.data("status", "waiting");
      audio.src &&
        $audio.data("guidePlaying") != "true" &&
        commonMethod.imgAnimateBegin();
    }
  }
  //音频播放暂停
  function audioPlayPause() {
    if ($audio.data("status") != "paused") {
      if ($audio.data("status") == "waiting") {
        commonMethod.$controlBtn &&
          commonMethod.$controlBtn.attr("class", "control-play");
        !commonMethod.firstPlay &&
          (setMessage("音频播放出错。。。"), (commonMethod.firstPlay = false));
      } else {
        commonMethod.$controlBtn &&
          !commonMethod.$controlBtn.hasClass("playPause") &&
          commonMethod.$controlBtn.attr("class", "control-play playPause");
        $audio.data("status", "paused");
      }
      commonMethod.markerImgAnimateEnd();
    }
    //commonMethod.changeCurrentPlaying(null);
  }
  //音频播放结束
  function audioPlayEnd() {
    commonMethod.$controlBtn &&
      commonMethod.$controlBtn.attr("class", "control-play");
    if ($audio.data("status") != "playend") {
      $audio.data("status", "playend");
      $audio.data("guidePlaying") == "true" &&
        $audio.data({ guidePlaying: "false", guidePlayed: "true" });
      commonMethod.markerImgAnimateEnd();
    }
    commonMethod.currentPlaying && commonMethod.currentPlaying.closePopup();
    //commonMethod.changeCurrentPlaying(null)
  }
  //音频播放出错
  function audioPlayError() {
    commonMethod.$controlBtn &&
      !commonMethod.$controlBtn.hasClass("playError") &&
      commonMethod.$controlBtn.attr("class", "control-play playError");
    $audio.data("status") != "error" && $audio.data("status", "error");
    //commonMethod.changeCurrentPlaying(null);
    $audio.data("play", false);
    commonMethod.markerImgAnimateEnd();
    !commonMethod.firstPlay &&
      (setMessage("音频播放出错。。。"), (commonMethod.firstPlay = false));
  }

  //改变当前播放值音频
  function changeCurrentPlaying(marker) {
    this.currentPlaying && this.currentPlaying.off("add"); //取消之前marker的事件绑定
    if (marker) {
      //开始播放
      this.currentPlaying = marker;
      marker.on("add", function() {
        //添加add事件，当marker重新加载到地图上时继续闪烁动画
        commonMethod.animateMarker = $(this._icon);
      });
    } else {
      //暂停、结束、出错
      this.currentPlaying && this.currentPlaying.off("add");
      this.currentPlaying = null;
    }
  }

  //marker闪烁动画开始
  function imgAnimateBegin() {
    if (!this.currentPlaying) return false;
    var This = this;
    this.markerImgAnimateEnd();
    this.animateMarker = $(this.currentPlaying._icon); //找到当前播放音频对应的marker的icon,并保存起来
    this.animateMarker.addClass("dim");
    // console.log(this.animateMarker);
    this.markerInterval = setInterval(function() {
      This.animateMarker.toggleClass("dim"); //通过添加类名实现闪烁
      //console.log(This.animateMarker);
    }, 300);
  }
  //marker闪烁动画开始
  function markerImgAnimateEnd() {
    clearTimeout(this.markerInterval);
    this.animateMarker && this.animateMarker.removeClass("dim");
  }

  //创建Popup
  function createPopup(marker) {
    var popup = L.popup({
      keepInView: false,
      maxWidth: "auto"
    }).setContent(getPopupDom(marker.data));
    marker.bindPopup(popup);
  }

  //组装popup内容框
  function getPopupDom(markerData) {
    var btns = "";
    if (markerData.audioUrl) {
      btns +=
        '<div class="control-play"><span></span></div><div class="show-details"></div>';
    } else {
      btns += '<div class="show-details"></div>';
    }
    var html =
      "<div>" +
      '<h3 class="view-name">' +
      markerData.viweName +
      "</h3>" +
      '<img class="viwe-photo" src="' +
      (markerData.viweImgUrl
        ? markerData.viweImgUrl
        : "images/viwephoto_null.jpg") +
      '" >' +
      '<p class="introduction">' +
      markerData.introduction +
      "</p>" +
      btns +
      "</div>";

    return html;
  }

  //打开popup
  function openPopup(marker) {
    if (marker && marker.__parent) {
      //如果在一个聚会组中，先放大将marker显示出来现打开popup
      marker.__parent._group.zoomToShowLayer(marker, function() {
        marker._map.panTo(marker._latlng);
        doOpenPopup(marker);
      });
    } else {
      //否则直接打开popup
      marker._map.panTo(marker._latlng);
      doOpenPopup(marker);
    }
  }

  //做打开的操作
  function doOpenPopup(marker) {
    if (!marker.getPopup()) {
      //如果marker未创建绑定popup,先创建绑定
      createPopup(marker);
      marker.openPopup();
    } else {
      //已创建直接打开
      marker.openPopup();
    }
  }

  //判断是否自动播放
  function whetherAutoPlay(marker) {
    if (
      !this.manualPlay &&
      !(this.$audio.data("guidePlaying") == "true") &&
      this.$audio.data("markerId") != marker._leaflet_id
    ) {
      //当前不是手动播放状态且开启了自动播放
      if (!(this.currentPlaying === marker)) {
        //如果是进入一个新的自动播放区域,直接开始自动播放
        this.audio.src = this.getAudioUrl(marker.data.audioUrl);
        this.changeCurrentPlaying((this.auotPlayMarker = marker));
        this.audio.play();
        this.$audio.data("markerId", marker._leaflet_id);
        openPopup(marker);
      } else {
        //否则进一步判断
        if (
          this.$audio.data("status") != "playing" &&
          this.$audio.data("status") != "playend"
        ) {
          this.audio.play();
          this.changeCurrentPlaying(this.auotPlayMarker);
          openPopup(this.currentPlaying);
          this.$audio.data("markerId", marker._leaflet_id);
        }
      }
      this.$controlBtn = $(".control-play");
    }
  }

  function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    if (window.screen.width >= 768) {
      flag = true;
    }
    return flag;
  }

  //将Url的参数转换为一个对象
  function getUrlParam() {
    var argObj = {},
      argArr,
      arg,
      argStr = pageUrl.match(/\?/)
        ? decodeURI(pageUrl.slice(pageUrl.match(/\?/).index + 1))
        : null;
    if (!argStr) return undefined;
    argArr = argStr.split("&");
    for (var i = 0, len = argArr.length; i < len; i++) {
      arg = argArr[i].match(/\=/);
      if (arg) {
        argObj[argArr[i].slice(0, arg.index)] = argArr[i].slice(arg.index + 1);
      } else {
        argArr[i] && (argObj[argArr[i]] = null);
      }
    }
    return argObj;
  }

  /***********************************获得地图导航方向 开始*******************************************/
  function orientationHandler(event) {
    //陀螺仪
    // console.log(event)
    $(commonMethod.locationMark._icon)
      .find("#orientation")
      .css("transform", "rotateZ(" + commonMethod.orientation + "deg)");
    commonMethod.orientation = -Math.ceil(event.alpha * 100) / 100 - 45;
  }

  function getOrientation() {
    if (window.DeviceOrientationEvent) {
      //陀螺仪
      window.addEventListener("deviceorientation", orientationHandler, false);
    } else {
      console.log("此手机不支持陀螺仪");
      this.orientation = false;
    }
  }
  /***********************************获得地图导航方向 结束*******************************************/
  //浏览器是否已经自动校正地理位置
  //浏览器是否已经自动校正地理位置
  var isUC = !!navigator.userAgent.match(/ucbrowser/i),
    isHuawei = !!navigator.userAgent.match(/huawei/i),
    isOppo = !!navigator.userAgent.match(/oppo/i),
    isQuark = !!navigator.userAgent.match(/quark/i),
    isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    isWeixin = navigator.userAgent.indexOf("micromessenger") != -1,
    isQQ = !!navigator.userAgent.match(/qqbrowser/i);
  function isAutoRectify() {
    return isQuark || (isUC && !isiOS);
  }
  console.error(parseInt(document.getElementsByTagName('html')[0].style.fontSize))
  console.error(parseInt($("html").css("font-size")))
  //返回新对象保存状态
  return {
    scroll: scroll,
    message: setMessage,
    getCookie: getCookie,
    setCookie: setCookie,
    ajax: ajax,
    showModal: showModal,
    hideModal: hideModal,
    active: active,
    goToHere: goToHere,
    whetherAutoPlay: whetherAutoPlay,
    getAudioUrl: getAudioUrl,
    imgAnimateBegin: imgAnimateBegin,
    markerImgAnimateEnd: markerImgAnimateEnd,
    changeCurrentPlaying: changeCurrentPlaying,
    createPopup: createPopup,
    openPopup: openPopup,
    getOrientation: getOrientation,

    token: getCookie("token"),
    userId: getCookie("userId"),
    userName: getCookie("nickname"),
    orientation: 0,
    locationMark: "",
    pageUrl: pageUrl,
    urlArg: getUrlParam(),
    audio: audio,
    $audio: $audio,
    isPC: isPC(),
    isUC: isUC,
    isHuawei: isHuawei,
    isOppo: isOppo,
    isWeixin: isWeixin,
    isQQ: isQQ,
    clickEvent: isPC() ? "click" : "tap",
    guideAuido: "images/test/autoguide.mp3",
    fontsize: parseInt($("html").css("font-size")),
    fontsizePer: parseInt($("html").css("font-size")) / 100,

    isiOS: isiOS,
    isAutoRectify: isAutoRectify(),
    isAndroid:
      navigator.userAgent.indexOf("Android") > -1 ||
      navigator.userAgent.indexOf("Adr") > -1, //android终端
    activated: false, //保存当前是否激活
    needVerify: true,
    isAuthUrl: "",
    scenicId: 1,
    goToHereFun: null,
    autoPlay: false, //保存是否打开自动播放功能
    manualPlay: true //保存是否为手动播放，手动优先
  };
})();

//地图相关的公用方法
var mapCommonMethod = (function() {
  //定位相关参数
  var locateArg = {
      showPopup: false,
      drawCircle: false,
      drawMarker: false,
      setView: false,
      onLocationError: function() {
        console.log("error");
      },
      onLocationOutsideMapBounds: function() {
        console.log("OutsideMapBounds");
      },
      locateOptions: {
        watch: true,
        setView: false,
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 3 * 1000
      }
    },
    c = commonMethod;

  //路线线条相关参数
  var polylineStyele = {
    color: "#ff664f",
    weight: 10,
    opacity: 1
  };

  /**
   * //gps转换相关的方法。。。
   * @type {Object}
   */
  var PointTransformation = {
    PI: 3.14159265358979324,
    x_pi: 3.14159265358979324 * 3000.0 / 180.0,
    delta: function(lat, lon) {
      var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
      var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
      var dLat = this.transformLat(lon - 105.0, lat - 35.0);
      var dLon = this.transformLon(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * this.PI;
      var magic = Math.sin(radLat),
        magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic),
        dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * this.PI),
        dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * this.PI);
      var pt = {
        lat: dLat,
        lon: dLon
      };
      return pt;
    },

    //WGS-84 to GCJ-02
    gcj_encrypt: function(wgsLat, wgsLon) {
      if (this.outOfChina(wgsLat, wgsLon))
        return {
          lat: wgsLat,
          lng: wgsLon
        };

      var d = this.delta(wgsLat, wgsLon);
      var pt = {
        lat: wgsLat + d.lat,
        lng: wgsLon + d.lon
      };
      return pt;
    },
    outOfChina: function(lat, lon) {
      if (lon < 72.004 || lon > 137.8347) return true;
      if (lat < 0.8293 || lat > 55.8271) return true;
      return false;
    },
    transformLat: function(x, y) {
      var ret =
        -100.0 +
        2.0 * x +
        3.0 * y +
        0.2 * y * y +
        0.1 * x * y +
        0.2 * Math.sqrt(Math.abs(x));
      ret +=
        (20.0 * Math.sin(6.0 * x * this.PI) +
          20.0 * Math.sin(2.0 * x * this.PI)) *
        2.0 /
        3.0;
      ret +=
        (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) *
        2.0 /
        3.0;
      ret +=
        (160.0 * Math.sin(y / 12.0 * this.PI) +
          320 * Math.sin(y * this.PI / 30.0)) *
        2.0 /
        3.0;
      return ret;
    },
    transformLon: function(x, y) {
      var ret =
        300.0 +
        x +
        2.0 * y +
        0.1 * x * x +
        0.1 * x * y +
        0.1 * Math.sqrt(Math.abs(x));
      ret +=
        (20.0 * Math.sin(6.0 * x * this.PI) +
          20.0 * Math.sin(2.0 * x * this.PI)) *
        2.0 /
        3.0;
      ret +=
        (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) *
        2.0 /
        3.0;
      ret +=
        (150.0 * Math.sin(x / 12.0 * this.PI) +
          300.0 * Math.sin(x / 30.0 * this.PI)) *
        2.0 /
        3.0;
      return ret;
    }
  };

  //判断某个点是否在polygon里面
  //piont=[latitude,longitude];
  //APoints=[piont,piont,piont,piont.....]
  function IsPtInPoly(point, APoints) {
    var iSum = 0,
      iCount,
      ALat = point[0],
      ALon = point[1];

    var dLon1, dLon2, dLat1, dLat2, dLon;
    if (APoints.length < 3) return false;
    iCount = APoints.length;
    for (var i = 0; i < iCount; i++) {
      if (i == iCount - 1) {
        dLon1 = APoints[i][1];
        dLat1 = APoints[i][0];
        dLon2 = APoints[0][1];
        dLat2 = APoints[0][0];
      } else {
        dLon1 = APoints[i][1];
        dLat1 = APoints[i][0];
        dLon2 = APoints[i + 1][1];
        dLat2 = APoints[i + 1][0];
      }
      //以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上
      if ((ALat >= dLat1 && ALat < dLat2) || (ALat >= dLat2 && ALat < dLat1)) {
        if (Math.abs(dLat1 - dLat2) > 0) {
          //得到 A点向左射线与边的交点的x坐标：
          dLon = dLon1 - (dLon1 - dLon2) * (dLat1 - ALat) / (dLat1 - dLat2);
          if (dLon < ALon) iSum++;
        }
      }
    }
    if (iSum % 2 != 0) return true;
    return false;
  }

  //公用创建marker的方法
  function createLineMarker(data) {
    return L.marker(data.lnglats, {
      icon: L.divIcon({
        className: "",
        html: '<span  class="icon-track" >' + data.index + "</span>"
      })
    });
  }

  //公用创建icon的方法
  function newIcon(data) {
    var iconUrl = data.nonAudio ? " nonAudio " : "";
    var html =
      "<p><span>" + data.viweName + '</span></p><div class="marker"></div>';
    data.nearService &&
      (html =
        "<p><span>" +
        data.viweName +
        '</span></p><div class="marker nearService" style="background-image:url(' +
        data.nearService +
        ');" ></div>');
    console.log(parseInt($("html").css("font-size")))    
    return L.divIcon({
      className: data.className ? data.className : "my-div-icon" + iconUrl,
      html: data.html ? data.html : html,
      iconSize: [62 * c.fontsizePer, 62 * c.fontsizePer],
      iconAnchor: [30 * c.fontsizePer, 48 * c.fontsizePer],
      popupAnchor: [-8 * c.fontsizePer, -60 * c.fontsizePer]
    });
  }

  //返回一个新对象
  return {
    locateArg: locateArg,
    PointTransformation: PointTransformation,
    IsPtInPoly: IsPtInPoly,
    polylineStyele: polylineStyele,
    createLineMarker: createLineMarker,
    newIcon: newIcon
  };
})();

/**
 *
 * 地图封装,返回一个map对象
 */
function LaeflatMapModule(arg) {
  if (!(this instanceof LaeflatMapModule)) {
    return new LaeflatMapModule(arg);
  }

  var c = commonMethod,
    mc = mapCommonMethod,
    mapData = c.mapData,
    mThis = this;

  this.subImgLayer = []; //保存子图层数据
  this.markerList = []; //保存marker对象
  this.serviceMarkerList = []; //保存服务marker对象
  this.markerGroup = ""; //将marker数据创建一个LayerGroup对象保存
  this.serviceMarkerGroup = ""; //将serviceMarkerGroup数据创建一个LayerGroup对象保存
  this.lineLayerGroup = []; //将路线数据创建一个LayerGroup对象保存

  /**
   * 初始化地图
   * @param {object} MapArguments 初始化地图参数
   * @return {object} 高德地图对象
   */
  this.initialize = function(mapArg) {
    this.map = L.map(mapArg.container, mapArg);
    this.map.maxBounds = L.latLngBounds(mapArg.maxBounds);
    return this;
  };

  /**
   * 添加自定义图层
   * @param {object} LayerArguments 图层参数
   * @param {object} mapObj         高德地图对象
   */
  this.addImageLayer = function(LayerArguments, isSubScenic) {
    !isSubScenic &&
      (this.mapImgLayer = L.imageOverlay(
        LayerArguments.imageUrl,
        LayerArguments.imageBounds,
        { zIndex: 0, className: " base-map" }
      ).addTo(this.map));
    if (isSubScenic) {
      //如果是下线景区图层，特殊处理
      var subImageOverlay = L.imageOverlay(
        LayerArguments.imageUrl,
        LayerArguments.imageBounds,
        { zIndex: 0 }
      );
      subImageOverlay.data = LayerArguments;
      this.subImgLayer.push(subImageOverlay);
      subImageOverlay.addTo(this.map);
    }
    return this;
  };

  arg && this.initialize(arg);

  //添加Markers点
  this.addMarkers = function(markers) {
    var marker;
    if (!markers.length) return false;
    markers.forEach(function(markerData) {
      if (markerData.position) {
        marker = L.marker(markerData.position, {
          icon: mc.newIcon({
            viweName: markerData.viweName,
            nonAudio: markerData.audioUrl ? false : true,
            nearService:
              markerData.viweType == "nearService" ? markerData.icon : ""
          })
        });
        marker.data = markerData;
        markerData.viweType == "nearService"
          ? mThis.serviceMarkerList.push(marker)
          : mThis.markerList.push(marker);
        mThis.markerGroup = L.layerGroup(mThis.markerList);
        mThis.serviceMarkerGroup = L.layerGroup(mThis.serviceMarkerList);
      }

      //markerData.area&&mThis.map.addLayer(L.polygon(markerData.area));//添加polygon,用来测试判断是否进入自动播放范围
    });

    markers[0].viweType != "nearService" &&
      mThis.markerGroup &&
      mThis.map.addLayer(mThis.markerGroup);
    markers[0].viweType == "nearService" &&
      mThis.serviceMarkerGroup &&
      mThis.map.addLayer(mThis.serviceMarkerGroup);

    return this;
  };

  //添加聚合Markers点
  this.addMarkersC = function(markers) {
    var marker,
      This = this;
    if (!markers.length) return this;
    console.log(L.markerClusterGroup);
    this.markerGroupC = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,

      iconCreateFunction: function(cluster) {
        var html = "",
          markerName = "",
          _markers = cluster.getAllChildMarkers();
        var markerName = _markers[0].data.viweName + "...等";
        //console.log(_markers);
        html =
          '<div class="leaflet-marker-icon my-div-icon cluster-marker" ><p><span>' +
          markerName +
          '</span></p><div class="marker"><span>' +
          cluster.getChildCount() +
          "</span></div></div>";
        console.log(cluster.getChildCount(), mThis.markerList);
        if (cluster.getChildCount() == mThis.markerList.length) {
          for (var i = 0, clen = mThis.markerList.length; i < clen; i++) {
            if (mThis.map.hasLayer(mThis.markerList[i])) {
              return mc.newIcon({
                className: "cluster-marker-icon bug",
                html: "<span></span>"
              });
            }
          }
        }
        return mc.newIcon({
          className: "cluster-marker-icon",
          html: html
        });
      }
    });
    markers.forEach(function(markerData) {
      if (markerData.position) {
        marker = L.marker(markerData.position, {
          icon: mc.newIcon({
            viweName: markerData.viweName,
            nonAudio:
              markerData.audioUrl && markerData.viweType != "nearService"
                ? false
                : true,
            nearService:
              markerData.viweType == "nearService" ? markerData.icon : ""
          })
        });
        marker.data = markerData;
        markerData.viweType == "nearService"
          ? mThis.serviceMarkerList.push(marker)
          : mThis.markerList.push(marker);
      }

      markerData.area && mThis.map.addLayer(L.polygon(markerData.area)); //添加polygon,用来测试判断是否进入自动播放范围
    });
    this.markerGroup = L.layerGroup(this.markerList);
    this.markerGroupC && this.markerGroupC.addLayer(this.markerGroup);

    this.markerGroupC.on("clusterclick", function(a) {
      //单击聚合点,就放大一层级别
      //a.layer.zoomToBounds();

      This.map.setView(a.layer.getBounds().getCenter(), This.map.getZoom() + 1);
    });
    This.map.on("zoom", function() {
      //缩放地图时,刷新聚合点数据.

      This.markerGroupC.refreshClusters();
    });

    this.markerGroupC.on("animationend", function() {
      //聚合点散开或聚合，修改当前要闪烁的icon
      var This = this;
      if (c.currentPlaying) {
        if (this.getVisibleParent(c.currentPlaying)) {
          if (
            !this.getVisibleParent(c.currentPlaying).hasEventListeners("add")
          ) {
            c.animateMarkerParent &&
              c.animateMarkerParent.off("add") &&
              $(c.animateMarkerParent._icon).removeClass("dim");
            this.getVisibleParent(c.currentPlaying).on("add", function() {
              if (This.getVisibleParent(c.currentPlaying) == this) {
                c.animateMarker = $(this._icon);
              }
            });
            c.animateMarkerParent = this.getVisibleParent(c.currentPlaying);
          }
          c.animateMarker = $(this.getVisibleParent(c.currentPlaying)._icon);
        } else {
          c.animateMarker = $(c.currentPlaying._icon);
        }
      }
    });

    this.map.addLayer(this.markerGroupC);
    return this;
  };
  /******************************************************GPS定位设置开始**********************************************/
  this.inAutoPlayArea = function(lat, lon) {
    var marker;
    for (var i = 0, len = this.markerList.length; i < len; i++) {
      marker = this.markerList[i].data;

      if (marker.audioUrl && marker.area) {
        if (mc.IsPtInPoly([lat, lon], marker.area)) return this.markerList[i];
      }
    }

    return false;
  };

  this.startLocate = function() {
    if (!this.locateObj) {
      this.locateObj = L.control.locate(mc.locateArg).addTo(this.map);
      //注册定位成功方法

      this.map.on("locationfound", onLocationFound);
      //注册定位失败方法 locateOptions
      this.map.on("locationerror", onLocationError);
    }
    this.locateObj.stop();
    this.locateObj.start();
    return this;
  };
  this.stopLocate = function() {
    this.locateObj && this.locateObj.stop() && this.map.stopLocate();
  };

  //自动设置地址最小缩放等级，实现最小缩放等级时必须铺满显示区域大小
  this.autoZoomRange = function() {
    var z = Math.ceil(this.map.getBoundsZoom(this.map.options.maxBounds, true));

    this.map.options.minZoom < z && (this.map.options.minZoom = z);
    this.map.options.maxZoom < z && (this.map.options.maxZoom = z);
    this.map.setZoom(z);
  };
  //定位失败处理方法

  function onLocationError(e) {
    var errorType = [
      "您的设置不支持定位",
      "您拒绝了位置请求服务",
      "无法获取你的位置，请打开GPS及Wifi后前往开阔场地尝试。",
      "无法获取你的位置，请打开GPS及wifi后前往开阔场地尝试"
    ];
    //触发定位失败事件
    if (e.code == 1) {
      if (!$(".advertisement-wrap").hasClass("show")) {
        if ($(".modal.show").length >= 1) {
          $(".reject-local-box.modal").addClass("only-hide-modal");
        } else {
          $(".reject-local-box.modal").removeClass("only-hide-modal");
        }
        c.showModal($(".reject-local-box.modal"));
      }
      c.rejectLocate = true;
    } else {
      !c.currentLatlng && c.message(errorType[e.code], 5000);
    }
    setTimeout(function() {
      mThis.locateBtn && mThis.locateBtn.removeClass("panto");
    }, 300);
  }

  //定位成功处理函数
  function onLocationFound(e) {
    var radius = e.accuracy / 2,
      point = mc.PointTransformation.gcj_encrypt(e.latlng.lat, e.latlng.lng);
    //c.isAndroid&&(c.isWeixin||c.isQQ)&&(point.lat-=0.000095,point.lng-=0.0002100);
    //$(".scenic-name").html(e.latlng.lat+","+e.latlng.lng);
    var latlng = c.isAutoRectify
        ? L.latLng(e.latlng.lat, e.latlng.lng)
        : L.latLng(point.lat, point.lng),
      goToHereFun,
      inArea;
    //$(".scenic-name").html(latlng.lat+","+latlng.lng);
    radius = radius > 300 ? 50 : radius;

    c.currentLatlng = latlng;
    if (mThis.map.maxBounds.contains(latlng)) {
      //在地图内

      c.inScenic = true;
      if (mThis.locateMarker) {
        //未添加定位按钮就添加，否则只需移动
        mThis.locateMarker.mark.setLatLng(latlng);
        mThis.locateMarker.circle &&
          mThis.locateMarker.circle.setLatLng(latlng);
        mThis.locateMarker.circle &&
          mThis.locateMarker.circle.setRadius(radius);
      } else {
        mThis.locateMarker = mThis.addLocationMarker(latlng, radius);
      }

      if (mThis.locateBtn && mThis.locateBtn.hasClass("panto")) {
        //移动到当前位置
        mThis.map.panTo(latlng);
      }
      if (
        (inArea = mThis.inAutoPlayArea(latlng["lat"], latlng["lng"])) &&
        !c.showLine
      )
        //已打开自动播放同时进入某个自动讲解区域并且没有显示路线，开始判断是否自动播放
        c.whetherAutoPlay(inArea);
    } else {
      if (mThis.locateMarker) {
        mThis.locateMarker.mark.setLatLng(latlng);
        mThis.locateMarker.circle &&
          mThis.locateMarker.circle.setLatLng(latlng);
        mThis.locateMarker.circle &&
          mThis.locateMarker.circle.setRadius(radius);
      }
      (!c.outViweHint ||
        (mThis.locateBtn && mThis.locateBtn.hasClass("panto"))) &&
        (c.message("您不在当前景区范围內！"), (c.outViweHint = true));
    }

    setTimeout(function() {
      mThis.locateBtn.removeClass("panto");
    }, 300);
    goToHereFun = c.goToHereFun;
    c.goToHereFun &&
      ((c.goToHereFun = null), goToHereFun(point["lon"], point["lat"])); //如果c.goToHereFun不为空，则表示处于去这儿路线规划中，开始跳转高德
  }

  /******************************************************GPS定位设置结束**********************************************/

  //添加一下显示当前位置的marker
  this.addLocationMarker = function(latlng, radius) {
    var icon = "",
      locationCircle = null;

    if (c.orientation !== false) {
      icon = L.divIcon({
        className: "locate-marker-icon orientation",
        html:
          '<span  class="icon-local" ></span><span id="orientation" ></span>'
      });
    } else {
      icon = L.divIcon({
        className: "locate-marker-icon",
        html: '<span  class="icon-local" ></span>'
      });
    }

    locationCircle = L.circle(latlng, radius, {
      weight: "2",
      color: "#1f6cf4",
      fillColor: "#1f6cf4"
    });

    locationMark = L.marker(latlng, {
      icon: icon
    });

    locationCircle && locationCircle.addTo(this.map);
    locationMark.addTo(this.map);
    c.locationMark = locationMark;
    return {
      mark: locationMark,
      circle: locationCircle
    };
  };

  //显示路线
  this.showLine = function(name) {
    if (this.currentShowline) {
      this.map.removeLayer(this.currentShowline);
    }
    this.lineLayerGroup[name] = this.cratePolyline(this.lineData[name], name);
    this.currentShowline = this.lineLayerGroup[name];
    this.lineLayerGroup[name].addTo(this.map);

    c.showLine = true;

    return this;
  };

  //添加路线
  this.cratePolyline = function(lineData, name) {
    var layerGroup = L.layerGroup(),
      points = [],
      position,
      latLng,
      marker,
      markerIndex = 1,
      polyline;
    for (var i = 0, len = lineData.length; i < len; i++) {
      position = lineData[i].position.split(",");
      latLng = L.latLng(position[1], position[0]);
      points.push(latLng);
      if (lineData[i].mark === "1") {
        marker = mc.createLineMarker({ lnglats: latLng, index: markerIndex++ });
        layerGroup.addLayer(marker);
      }
    }

    polyline = L.polyline(points, mc.polylineStyele);
    layerGroup.addLayer(polyline);

    return layerGroup;
  };
  //隐藏路线
  this.hideLine = function(name) {
    if (this.currentShowline) {
      var _layers = this.currentShowline._layers,
        marker,
        markerGroup = this.markerGroupC || this.markerGroup;
      this.currentShowline && this.map.removeLayer(this.currentShowline);

      c.$audio.data("status") == "playing" && c.imgAnimateBegin();
    }

    c.showLine = false;
  };
}

/**
 * DOM相关操作
 */
var domOperate = function() {
  var $body = $("body"),
    c = commonMethod,
    clickEvent = c.clickEvent,
    scenicName = c.scenicName,
    $autoPlay = $("#autoPlay");

  //关闭模态框
  var closeModal = $(".modal .close-icon");
  closeModal.bind(clickEvent, c.hideModal);

  $("div.modals").bind(clickEvent, function(e) {
    if (e.target === e.currentTarget) {
      if ($(this).children(".show.close-by-self").length == 0) {
        $body.removeClass("show-modal");
        $(this)
          .children(".show")
          .removeClass("show")
          .addClass("hide");
      }
      /*			if(!c.rejectLocate){
				c.map&&c.map.startLocate();
				c.subMap&&c.subMap.stopLocate();
			}*/
    }

    return false;
  });

  //模态框下子元素阻止冒泡
  $("div.modals").on(clickEvent, "div.modals>div", function(e) {
    e.stopPropagation();
  });
  //关闭模态框结束

  //禁用下拉刷新
  $body[0].addEventListener(
    "touchmove",
    function(e) {
      if (
        !(
          $(e.target).hasClass("enable-touchmove") ||
          $(e.target).parents(".enable-touchmove").length
        )
      )
        e.preventDefault();
    },
    false
  );

  /****************************************广告弹窗和激活弹框相关操作************************************************************************/
  //广告弹窗相关操作
  var $advertisement = $(".advertisement-wrap"),
    $looklook = $advertisement.find("div.looklook"),
    $confirmYes = $advertisement.children("#confirmYes"),
    $verifyWrap = $(".verify-wrap.modal"),
    $vTextarea = $verifyWrap.find(".dd-input>textarea"),
    $tipText = $verifyWrap.find(".dd-txt>.ptxt1"),
    $aActivate = $verifyWrap.find("a.a-activate"),
    $buyBtn = $(".dd-footer a.a-buy"),
    urlCode = c.urlArg && c.urlArg.c;

  //关闭广告弹窗
  $looklook.bind(clickEvent, function(e) {
    !c.activated && c.hideModal(e);
    return false;
  });

  //todo
  //根据url中有showBuy=0不显示立即购买按钮 showBuy=1 显示立即购买按钮
  if (c.urlArg.showBuy) {
    c.urlArg.showBuy == "0" ? $buyBtn.hide() : "";
  }
  //开户自动导游功能或弹出激活激活弹窗
  $confirmYes.bind(clickEvent, function(e) {
    if (c.activated) {
      (c.scenicId === "2374" || c.scenicId === "2149") &&
        $autoPlay.trigger(c.clickEvent);
      (!$autoPlay.length || !c.rejectLocate) && c.hideModal(e);
    } else {
      if (c.urlArg.weChat != "true" || (c.token && c.userId)) {
        $(this)
          .parents(".modal")
          .removeClass("show");
        $verifyWrap.addClass("show");

        urlCode &&
          ($vTextarea.val(urlCode),
          $tipText.html(
            "已自动识别您所购买的授权码，点击“验证授权”，即可获取授权！"
          ),
          $vTextarea.trigger("focus"));
      } else {
        location.href = "login.html?redirection=true";
      }
    }
    return false;
  });

  //验证是否激活
  function authorization() {
    return true;
  }

  //获得焦点时取消背景
  $vTextarea.bind("focus", function() {
    !$vTextarea.parent().hasClass("active") &&
      $vTextarea.parent().addClass("active");
  });
  //失去焦后且没有输入时恢复背景
  $vTextarea.bind("blur", function() {
    if (!$vTextarea.val()) {
      $vTextarea.parent().removeClass("active");
    }
  });
  //给激活按钮添加事件

  $aActivate.bind(clickEvent, function() {
    var inputCode = $vTextarea.val().trim(),
      includeText = false,
      $ddTxt = $verifyWrap.find(".dd-txt>p"),
      $inputNull = $verifyWrap.find(".input-null"),
      $inputError = $verifyWrap.find(".input-error"),
      reqUrl = "";

    if (inputCode == "") {
      $ddTxt.hide();
      $inputNull.show();
      return false;
    }
    inputCode.search(/[^0-9]/) != -1 && (includeText = true);

    if (inputCode.search(/取票凭证码|授权码|【电子票|预订成功/) > -1) {
      //通过正则自动匹配短信中的激活码

      if (
        inputCode.match(/(取票凭证码|授权码|【电子票|预订成功).*?([0-9]{6,15})/)
      ) {
        inputCode = inputCode.match(
          /(取票凭证码|授权码|【电子票|预订成功).*?([0-9]{6,15})/
        )[2];
      } else {
        $ddTxt.hide();
        $inputError.show();
        return false;
      }
    } else {
      if (inputCode.match(/[0-9]{6,15}/)) {
        inputCode = inputCode.match(/[0-9]{6,15}/)[0];
      } else {
        $ddTxt.hide();
        $inputError.show();
        return false;
      }
    }

    c.urlArg.weChat == "true" &&
      (reqUrl =
        c.isAuthUrl +
        inputCode +
        "&scenicId=" +
        c.scenicId +
        "&userId=" +
        c.userId +
        "&token=" +
        c.token +
        "&distributorId=" +
        c.distributorId);
    c.urlArg.weChat != "true" &&
      (reqUrl =
        c.isAuthUrl +
        inputCode +
        "&scenicId=" +
        c.scenicId +
        "&distributorId=" +
        c.distributorId);
    c.ajax({
      url: reqUrl,
      async: false,
      success: function(data) {
        if (data.isForeverAuth) {
          authSuccess(true, data);
          return false;
        }
        endDate = data.endDate;

        if (data.errorMessage == undefined && data.beginUseDate != "") {
          //验证通过

          authSuccess(false, data);
        } else if (data.errorMessage == "1" || data.errorMessage == "2") {
          //验证码错误

          $ddTxt.hide();

          if (includeText) {
            $verifyWrap.find(".ptxt2-1").show();
          } else {
            $verifyWrap.find(".ptxt2").show();
          }
        } else if (data.errorMessage == "4") {
          //验证码过期

          $ddTxt.hide();
          if (data.beginUseDate) {
            $verifyWrap
              .find(".ptxt3 .expire-tip")
              .html(
                "有效时间：" +
                  data.beginUseDate.replace(/-/g, "") +
                  "-" +
                  data.useEndDate.replace(/-/g, "")
              );
          } else {
            $verifyWrap
              .find(".ptxt3 .expire-tip")
              .html("您未在" + data.endDate.replace(/-/g, "") + "前激活");
          }

          $verifyWrap.find(".ptxt3").show();
        } else if (data.errorMessage == "token_error") {
          alert("登录出错，请重新登录.");
          location.href = "login.html";
        }
      }
    });

    function authSuccess(isForeverAuth, data) {
      //激活成功相关操作
      c.setCookie("validCode", inputCode, 365);
      c.activated = true;
      $verifyWrap.addClass("success");
      !isForeverAuth &&
        $verifyWrap.find(".success-tip>span").html(data.useEndDate);

      $verifyWrap.find(".understand").bind(clickEvent, function(e) {
        if (c.activated) {
          $autoPlay.trigger(clickEvent);
        }
        if (c.rejectLocate) {
          $verifyWrap.removeClass("show").addClass("hide");
        } else {
          c.hideModal(e);
        }
      });
    }
    return false;
  });

  /****************************************广告弹窗和激活弹框相关操作结束************************************************************************/

  /****************************************授权码验证***********************************************************************************************/
  var urlObj;
  try {
    urlObj = eval("(" + c.urlArg.urlObj + ")");
  } catch (e) {
    console.log(e);
  }
  function verifyCookie() {
    if (!c.needVerify) {
      c.activated = true;
      return true;
    }
    var flag = false;
    var validCode = c.getCookie("validCode");
    var groupValidCode = c.getCookie("groupValidCode");
    var urlCode = c.urlArg && (c.urlArg.d || c.urlArg.c);
    var userInfo = "";
    if (c.urlArg.weChat == "true") {
      userInfo = "&userId=" + c.userId + "&token=" + c.token;
    }
    urlCode && (validCode = urlCode);
    if (
      groupValidCode != null &&
      groupValidCode != "" &&
      c.urlArg.nonShowConfirm
    ) {
      $.ajax({
        url:
          c.isAuthUrl +
          groupValidCode +
          "&groupId=" +
          urlObj.scenicGroupId +
          "&distributorId=" +
          c.distributorId +
          userInfo,
        type: "GET",
        dataType: "json",
        async: false,
        success: function(data) {
          if (data.errorMessage == undefined) {
            c.message("恭喜您已激活该景区！");
            c.activated = true;
            flag = true;
          } else if (
            data.errorMessage == "token_error" &&
            c.urlArg.weChat == "true"
          ) {
            alert("登录出错，请重新登录.");
            location.href = "login.html";
          }
        }
      });
    }
    if (validCode != null && validCode != "" && !flag) {
      //如果存在则不显示弹窗

      $.ajax({
        url:
          c.isAuthUrl +
          validCode +
          "&scenicId=" +
          c.scenicId +
          "&distributorId=" +
          c.distributorId +
          userInfo,
        type: "GET",
        dataType: "json",
        async: false,
        success: function(data) {
          if (data.errorMessage == undefined) {
            c.message("恭喜您已激活该景区！");
            c.activated = true;
            flag = true;
          } else if (
            data.errorMessage == "token_error" &&
            c.urlArg.weChat == "true"
          ) {
            alert("登录出错，请重新登录.");
            location.href = "login.html";
          }
        }
      });
    }

    if (!flag && c.userId && c.token && userInfo) {
      $.ajax({
        url:
          c.isAuthUrl +
          "&userId=" +
          c.userId +
          "&token=" +
          c.token +
          "&distributorId=" +
          c.distributorId +
          (c.scenicId
            ? "&scenicId=" + c.scenicId
            : "&groupId=" + urlObj.scenicGroupId),
        type: "GET",
        dataType: "json",
        async: false,
        success: function(data) {
          if (data.errorMessage == undefined) {
            c.message("恭喜您已激活该景区！");
            c.activated = true;
            flag = true;
          } else if (
            data.errorMessage == "token_error" &&
            c.urlArg.weChat == "true"
          ) {
            alert("登录出错，请重新登录.");
            location.href = "login.html";
          }
        }
      });
    }

    c.activated = flag;
    return flag;
  }
  /****************************************授权码验证结束***********************************************************************************************/

  //关闭广告条
  $("#closePopularize").bind(clickEvent, function() {
    $body.addClass("hide-popularize");
    setTimeout(function() {
      c.map.map.invalidateSize(true);
    }, 250);
  });

  /*************************************************底部菜单相关DOM操作结束*************************************************************/
  var $scenicTool = $("#scenicTool"),
    $roadsListNav = $(".roads-list-wrapper"),
    $roadsList = $("#recommendRoad"),
    roadsListScroll = c.scroll("#roadsListScroll"),
    $audioListNav = $(".audio-list-wrapper"),
    $audioList = $("#audioList"),
    audioListScroll = c.scroll("#audioListScroll"),
    $scenicListNav = $(".scenicList-nav"),
    sceniclistScroll = c.scroll("#sceniclistWrap"),
    $sceniclist = $("#sceniclist"),
    $spotsSearch = $("#spotsSearch");

  $scenicTool.on(clickEvent, ".road", function(e) {
    //显示推荐路线菜单
    if ($roadsListNav.hasClass("show")) {
      $roadsListNav.find(".close-icon").trigger(clickEvent);
    } else {
      c.showModal($roadsListNav);
      $roadsListNav
        .siblings(".modal.show.tool-nav")
        .removeClass("show")
        .addClass("hide");
      roadsListScroll.refresh();
    }
  });

  $scenicTool.on(clickEvent, ".audio", function(e) {
    //显示语音类型菜单
    if ($audioListNav.hasClass("show")) {
      $audioListNav.find(".close-icon").trigger(clickEvent);
    } else {
      c.showModal($audioListNav);
      $audioListNav
        .siblings(".modal.show")
        .removeClass("show")
        .addClass("hide");
      audioListScroll.refresh();
    }
  });

  $scenicTool.on(clickEvent, ".list", function() {
    //显示景点列表
    if ($scenicListNav.hasClass("show")) {
      $scenicListNav.find(".close-icon").trigger(clickEvent);
    } else {
      $spotsSearch.val("");
      $spotsSearch.trigger("input");
      $scenicListNav
        .siblings(".modal.show")
        .removeClass("show")
        .addClass("hide");
      c.showModal($scenicListNav);
      sceniclistScroll.refresh();
    }
  });

  //切换音频类型开始
  $audioList.children("li").bind(clickEvent, function(e, trigger) {
    switchAudioType($(this));
    !trigger && c.hideModal(e);
    return false;
  });
  function switchAudioType($this) {
    if ($this.hasClass("liSelect")) {
      return false;
    }
    $this.siblings(".liSelect").length > 0 &&
      c.message("当前语音类型已切换为：" + $this.find(".sTxt").text());
    c.active($this, "liSelect");
    c.audioType = $this.attr("audioid");
    if (c.$audio.data("guidePlaying") != "true" && c.currentPlaying) {
      if (c.currentPlaying.data.audioUrl["audioId" + c.audioType]) {
        c.audio.src = c.currentPlaying.data.audioUrl["audioId" + c.audioType];
        c.audio.play();
      } else {
        c.message("当前讲解的景点没有该类型的语音....");
      }
    }
  }
  $audioList
    .children("li")
    .eq(0)
    .trigger(clickEvent, true);
  //切换音频类型结束

  /*************************************************底部菜单相关DOM操作结束*************************************************************/

  //显示帮助弹窗
  var $userHelp = $(".viweDetails.help"),
    userHelpScroll = c.scroll("#userHelpContant"),
    $userHelpContant = $("#userHelpContant"),
    $helpIcon = $(".other-btns>.help-icon");
  $helpIcon.bind(clickEvent, function() {
    if (!$userHelpContant.hasClass("loaded")) {
      $.ajax({
        url: c.needVerify ? "help.html" : "helpForFree.html",
        success: function(data) {
          $userHelpContant
            .children("div")
            .eq(0)
            .html(data);
          $userHelpContant.removeClass("loading").addClass("loaded");
          $userHelpContant.find("img").bind("load", function() {
            userHelpScroll.refresh();
          });
          userHelpScroll.refresh();
        },
        error: function(error) {
          c.message("帮助文档载入出错，请尝试刷新重试。。");
        }
      });
    }

    c.showModal($userHelp);
    userHelpScroll.refresh();
    return false;
  });
  //显示帮助弹窗操作结束

  /*****************************************投诉相关DOM操作开始*********************************************************************/

  var $feedbackModal = $("#feedBackDom"),
    $backBtn = $feedbackModal.find("div.back"),
    $feedbackSbt = $feedbackModal.find("div.submit"),
    $feedbackTitle = $feedbackModal.find(".header .title"),
    $feedTip = $feedbackModal.find(".error-tip"),
    $feedTelInput = $feedbackModal.find("input#telNumber"),
    $feedBackSbt = $("#feedBackDom div.submit"),
    $feedTelTextarea = $feedbackModal.find("textarea.textarea");

  //显示问题反馈弹窗
  $(".error-correction").bind(clickEvent, function() {
    $feedTelInput.val("");
    $feedTelTextarea.val("");
    $feedTip.removeClass("show-error");
    $backBtn.trigger(clickEvent);
    c.showModal($feedbackModal);
    return false;
  });

  //显示问题反馈表单
  $feedbackModal.on(clickEvent, ".feed-choose>dl>dt", function() {
    var $this = $(this);

    $feedbackTitle.text($this.attr("error-text"));
    $this.siblings().removeClass("selected");
    $this.addClass("selected");
    $feedbackModal.addClass("show-menu");
    return false;
  });
  //返回主页
  $backBtn.bind(clickEvent, function() {
    $feedbackModal.removeClass("show-menu");
    $feedbackTitle.text("建议与反馈");
  });

  //提交按钮状态检测
  $feedTelInput.bind("input", function() {
    feedValidateIntime();
  });
  $feedTelTextarea.bind("input", function() {
    feedValidateIntime();
  });

  //已验证失败时，实时验证输入是否合法
  //未验证失败，检测提交按钮是否可用
  function feedValidateIntime() {
    if ($feedTip.hasClass("show-error")) {
      feedValidate();
    } else {
      if ($feedTelInput.val().trim() && $feedTelTextarea.val().trim()) {
        $feedBackSbt.removeClass("disable");
      }
    }
  }

  //输入数据验证
  function feedValidate() {
    var mobile = $feedTelInput.val().trim(),
      text = $feedTelTextarea.val().trim();

    if (!/^(17[0-9]|13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(mobile)) {
      //手机号码验证
      $feedTip.addClass("show-error").text("请填写正确的手机号码");
      return false;
    }
    if (text.length < 10) {
      $feedTip.addClass("show-error").text("至少输入10个字符");
      return false;
    }
    $feedTip.removeClass("show-error");
    return true;
  }

  //提交表单
  $feedBackSbt.bind(clickEvent, function() {
    if (feedValidate()) {
      var sendStr =
        "adviceScenicids=" +
        $feedbackModal.find("dl>dt.selected").attr("error-text") +
        "," +
        $feedTelTextarea.val().trim() +
        "," +
        $feedTelInput.val().trim() +
        "," +
        scenicName;

      $feedbackModal.parent().trigger(clickEvent);
      $.ajax({
        type: "POST",
        url: "/web/adviceRecord",
        data: sendStr,
        success: function(data) {
          c.message(
            "信息提交成功，我们会尽快处理！感谢您的反馈。",
            3000,
            "true"
          );
        },
        error: function(jqXHR) {
          c.message(
            "发生错误：" +
              jqXHR.status +
              "！请尝试重新提交，或拨打我们的投诉热线！",
            3000,
            "highly"
          );
        }
      });
    }
  });

  /*************************************************投诉相关DOM操作结束*************************************************************/

  //自动播放按钮绑定事件
  $autoPlay.bind(clickEvent, function() {
    if (!authorization()) {
      return false;
    }
    var $this = $(this),
      audioData = c.$audio.data();
    if ($this.hasClass("on")) {
      //关闭自动播放
      $this.removeClass("on");
      c.message("自动播放已关闭！");
      if (!c.manualPlay || audioData.guidePlaying == "true") {
        //如果是手动点击播放按钮并且音频未播放结束，关闭自动播放后不暂停当前播放音频
        c.audio.pause();
        c.$audio.data("status", "playend");
        c.$controlBtn && c.$controlBtn.removeClass("playing");
        if (audioData.guidePlaying == "true") {
          c.$audio.data("guidePlaying", "false");
          c.$audio.data("guidePlayed", "true");
        }
      }
      c.autoPlay = false;
    } else {
      //打开自动播放
      if (c.rejectLocate) {
        $advertisement.hasClass("show") && $advertisement.removeClass("show");
        c.showModal($(".reject-local-box.modal"));
        return false;
      }
      c.message(
        c.inScenic
          ? "定位到您在景区内，很高兴为您导游！"
          : "当您到达景区后，自动播放自动开始"
      );

      c.audio.src = "";
      c.firstPlay = true;
      c.audio.play();
      if (
        (c.scenicId === "2374" || c.scenicId === "2149") &&
        audioData.status != "playing" &&
        c.inScenic &&
        audioData.guidePlayed != "true"
      ) {
        c.audio.src = c.guideAuido;
        c.$audio.data("guidePlaying", "true");
        c.audio.play();
      }
      c.autoPlay = true;
      c.manualPlay = false;

      $(this).addClass("on");
    }
  });

  //针对ios的一些特殊处理

  if (c.isiOS) {
    $(".doubletap-disable").doubletap(
      function(event) {
        event.preventDefault();
        return false;
      },
      function(event) {},
      400
    );
  }

  /*************************************************与地图相关的DOM操作事件绑定*************************************************************/
  var $viweDetails = $(".viweDetails.scenic"),
    viweDetailsScroll = c.scroll("#scenicContant"),
    $viweDetailsContant = $("#scenicContant");

  var domOperateForMap = function(mapModule, subScenic) {
    var m = mapModule,
      map = m.map,
      markers = m.markerList,
      c = commonMethod,
      $mapLocateBtn = $("#mapLocateBtn");

    /****************************************景点列表相关操作开始************************************************************************/

    $sceniclist.html("");
    for (var i = 0, len = markers.length; i < len; i++) {
      $li = $(assembleScenicList(markers[i].data));
      $li.data("index", i);
      $sceniclist.append($li);
    }

    sceniclistScroll.refresh();

    $sceniclist.off(clickEvent);
    $sceniclist.on(clickEvent, "li", function(e) {
      var $this = $(this),
        marker = m.markerList[$this.data("index")];
      if (m.scenicId == "25") {
        c.showLine && m.hideLine();
      }
      if (!$this.hasClass("load-map")) {
        //有load-map表示当前li是景点，点击载入map数据
        if ($this.hasClass("liSelect")) {
          marker.closePopup();
          $this.removeClass("liSelect");
        } else {
          $this.siblings(".liSelect").removeClass("liSelect");
          $this.addClass("liSelect");
          c.openPopup(marker);
        }
        c.hideModal(e);
      } else {
        c.hideModal(e);
        m.subImgLayer[$this.data("index")].$image.trigger(clickEvent);
      }
    });
    //组装景点列表
    function assembleScenicList(markerData) {
      var html = "";
      html =
        '<li id="marker' +
        markerData.viweID +
        '" class="' +
        (markerData.audioUrl ? "hasVoice" : "") +
        '"><span class="sTxt">' +
        markerData.viweName +
        "</span></li>";
      return html;
    }

    //开始本地景点搜索操作
    $spotsSearch.unbind("input");
    $spotsSearch.bind("input", function() {
      spotsSearch($(this).val(), $sceniclist);
      sceniclistScroll.refresh();
    });

    //获得焦点提高景点列表菜单高度
    $spotsSearch.unbind("focus");
    $spotsSearch.bind("focus", function() {
      $scenicListNav.addClass("search-focus");
      sceniclistScroll.refresh();
    });
    //失去焦点降低景点列表菜单高度
    $spotsSearch.unbind("blur");
    $spotsSearch.bind("blur", function() {
      $scenicListNav.removeClass("search-focus");
      sceniclistScroll.refresh();
    });

    /**
     * 本地景点搜索，通过jquery contains()选择器来实现
     * @param  {string} key [搜索关键字]
     * @param  {jquery dom} ul [要搜索的景点列表]
     */
    function spotsSearch(key, ul) {
      var result = ul.children("li:contains('" + key + "')").not(".nullResult");

      if (key == "") {
        ul.removeClass("hasResult resultNull");
        result.addClass("result").removeClass("result");
        return false;
      }
      if (!key == "" && result.length > 0) {
        ul.removeClass("resultNull").addClass("hasResult");
        result.addClass("result");
      } else {
        ul.children("li.result").removeClass("result");
        ul.addClass("resultNull").removeClass("hasResult");
        if (ul.children(".nullResult").length <= 0) {
          $(
            "<li class='nullResult'>未找到含“" + key + "”的景点或目的地</li>"
          ).appendTo(ul);
        } else {
          ul
            .children(".nullResult")
            .text("未找到含“" + key + "”的景点或目的地");
        }
      }
    }
    /****************************************景点列表相关操作结束************************************************************************/

    //给每个marker绑定popup,并监听popup状态
    markers.forEach(function(marker, index) {
      L.DomEvent.on(marker, "click", function() {
        if (!marker.getPopup()) {
          c.openPopup(marker);
        }
      });
      marker.on("popupclose", function() {
        //监听popup关闭
        $sceniclist
          .children("#marker" + marker.data.viweID)
          .removeClass("liSelect");
        c.currentPopup = "";
        if (c.autoPlay && c.manualPlay && c.audio.paused) {
          //如果已经打开自动播放同时手动播放为true并且音频处于暂停状态，则取消手动优先
          c.manualPlay = false;
        }
        map.setMaxBounds(map.maxBounds);
      });

      marker.on("popupopen", function() {
        //监听popup打开
        c.currentPopup = marker;
        map.setMaxBounds();

        if (c.$audio.data("markerId") == marker._leaflet_id) {
          c.$controlBtn = $(".control-play");
          if (c.$audio.data("status") == "playing") {
            c.$controlBtn.attr("class", "control-play playing");
          }
          if (c.$audio.data("status") == "paused") {
            c.$controlBtn.attr("class", "control-play playPause");
          }
          if (c.audio.readyState == 2) {
            c.$controlBtn.attr("class", "control-play Loading");
          }
        }

        $sceniclist
          .children("#marker" + marker.data.viweID)
          .addClass("liSelect");
      });
    });
    //marker绑定popup结束

    /****************************************popupsh 相关操作************************************************************************/
    $(
      "#" + map.options.container + ">.leaflet-map-pane>.leaflet-popup-pane"
    ).off("click");
    $(
      "#" + map.options.container + ">.leaflet-map-pane>.leaflet-popup-pane"
    ).on("click", ".leaflet-popup", function(e) {
      var $target = $(e.target),
        markerData = c.currentPopup.data;

      if ($target.hasClass("show-details")) {
        //显示详情

        if (subScenic) {
          $viweDetails.addClass("only-hide-modal");
        } else {
          $viweDetails.removeClass("only-hide-modal");
        }
        if (!($viweDetailsContant.data("loaded") === markerData.detailsURL)) {
          $viweDetailsContant.addClass("loading");

          $viweDetails.find(".header>h3").html(markerData.viweName);
          $viweDetails.data({
            viweName: markerData.viweName,
            lat: markerData.position[0],
            lon: markerData.position[1]
          });
          c.ajax({
            url: markerData.detailsURL,
            dataType: "html",
            success: function(data) {
              var $html = $(
                  "<div>" +
                    data.replace(/src\=\"http:\/\//g, 'src="https://') +
                    "</div>"
                ),
                $images = $html.find("img");
              $viweDetailsContant.data("loaded", markerData.detailsURL);
              $images.bind("load error", function() {
                viweDetailsScroll.refresh();
              });
              $viweDetailsContant.children(".content").html($html.html());
              setTimeout(function() {
                viweDetailsScroll.refresh();
              }, 1000);
              $viweDetailsContant.removeClass("loading");
            }
          });
        }
        c.showModal($viweDetails);
      }

      if (
        $target.hasClass("control-play") ||
        $target.parents(".control-play").length > 0
      ) {
        //播放音频

        if (!authorization()) {
          return false;
        }
        var $controlBtn = $target.hasClass("control-play")
            ? $target
            : $target.parents(".control-play").eq(0),
          audioType = null;

        c.manualPlay = true; //操作播放按钮，则为手动优先
        if ($controlBtn.hasClass("playPause")) {
          c.$controlBtn = $controlBtn;
          c.changeCurrentPlaying(c.currentPopup);
          c.audio.play();
          c.$audio.data("markerId", c.currentPopup._leaflet_id);
          return false;
        }
        if (
          $controlBtn.hasClass("playing") ||
          $controlBtn.hasClass("loading")
        ) {
          c.$controlBtn = $controlBtn;
          c.audio.pause();
          return false;
        }

        c.$controlBtn = $controlBtn;
        c.audio.pause();
        c.audio.src = c.getAudioUrl(markerData.audioUrl);
        c.changeCurrentPlaying(c.currentPopup);
        c.audio.play();
        c.$audio.data("markerId", c.currentPopup._leaflet_id);
        c.$audio.data("guidePlaying") == "true" &&
          (c.$audio.data("guidePlaying", "false"),
          c.$audio.data("guidePlayed", "true"));
      }
    });

    $viweDetails.on(clickEvent, ".bindgo-to-here", function() {
      //详情页面去这儿功能绑定事件
      var data = $viweDetails.data();
      if (c.currentLatlng) {
        //当前已经获取到位置，直接调用去这儿方法

        c.goToHere(data.lon, data.lat, data.viweName)(
          c.currentLatlng.lng,
          c.currentLatlng.lat
        );
      } else {
        //否则
        c.message("路线规划中，请稍等..。"); //提示规划中
        c.map.startLocate(); //开始定位
        c.goToHereFun = c.goToHere(data.lon, data.lat, data.viweName); //将去这儿方法保存起来，定位成功后执行
      }
    });
    /****************************************popup 相关操作结束************************************************************************/

    /****************************************景点路线相关操作开始************************************************************************/
    $roadsList.find("li").remove();
    $roadsList.off(clickEvent);
    $roadsList.on(clickEvent, "li", function(e) {
      if (!authorization()) {
        c.hideModal(e, true);
        return false;
      }
      var $this = $(this);
      if ($this.hasClass("liSelect")) {
        c.showLine && m.hideLine();
        $this.removeClass("liSelect");
      } else {
        m.showLine($(this).data("name"));
        $this.siblings(".liSelect").removeClass("liSelect");
        $this.addClass("liSelect");
      }
      c.hideModal(e);
    });
    var roadIndex = 1;
    for (var lineName in m.lineData) {
      $li = $("<li><em>" + roadIndex++ + "</em>" + lineName + "</li>").data(
        "name",
        lineName
      );
      $roadsList.append($li);
    }

    /****************************************景点路线相关操作结束************************************************************************/

    //定位按钮绑定事件
    m.locateBtn = $mapLocateBtn;
    $mapLocateBtn.unbind(clickEvent); //先解绑，下线景区定位按钮存在复用

    var isFirstLocat = true; //保存是否是第一次定位 //todo

    $mapLocateBtn.bind(clickEvent, function() {
      if (!$mapLocateBtn.hasClass("panto")) {
        //当前不处于定位中，则开始定位
        $mapLocateBtn.addClass("panto");
        m.startLocate();
        isFirstLocat &&
          c.inScenic &&
          c.message("定位受环境及设备因素影响，仅供参考"); //如果是第一次定位到在景区则出现此toast //todo
      }
      isFirstLocat = false; //定位后则不是第一次定位

      return false;
    });

    if (c.isPC) {
      $(".zoom-control").on("click", ".add", function() {
        m.map.zoomIn();
      });
      $(".zoom-control").on("click", ".minu", function() {
        m.map.zoomOut();
      });
    }
  };
  /*************************************************与地图相关的DOM操作事件绑定结束*************************************************************/
  //返回一些数据，包含常用DOM元素、DOM操作
  return {
    showAd: function() {
      c.activated && $advertisement.addClass("active");
      !c.needVerify && $advertisement.addClass("active free");
      c.showModal($advertisement);
    },
    verify: verifyCookie,
    domOperateForMap: domOperateForMap
  };
};

//设置下载条的URL
function setDownloadUrl() {
  //设置广告条下载链接
  var c = commonMethod,
    appPopularize = $("div.app-popularize"),
    link = appPopularize.children("a"),
    img = link.children("img"),
    scenicName = link.children("p.scenic-name"),
    urlObj;

  if (c.isiOS && c.singleIosAppLink) {
    //是ios设备，且有配置ios单机版的下载链接
    link.attr("href", c.singleIosAppLink);
    img.attr("src", c.singleLogo);
  }
  if (c.isAndroid && c.singleAndroidAppLink) {
    //是Android设备，且有配置Android单机版的下载链接
    link.attr("href", c.singleAndroidAppLink);
    img.attr("src", c.singleLogo);
  }

  if (c.urlArg && c.urlArg.urlObj) {
    //从景区组进入景区
    try {
      urlObj = eval("(" + c.urlArg.urlObj + ")");
    } catch (e) {
      console.log(e);
    }
    if (urlObj) {
      //通过url传入参数且参数合法
      if (c.isiOS && urlObj.singleIosAppLink) {
        //是ios设备，且有配置ios分组包的下载链接
        link.attr("href", urlObj.singleIosAppLink);
        img.attr(
          "src",
          c.path + "/cm/fileOpviewFile?fileName=" + urlObj.imgUrl
        );
        scenicName.html(urlObj.scenicGroupName);
      }
      if (c.isAndroid && urlObj.singleAndroidAppLink) {
        //是isAndroid设备，且有配置isAndroid分组包的下载链接
        link.attr("href", urlObj.singleAndroidAppLink);
        img.attr(
          "src",
          c.path + "/cm/fileOpviewFile?fileName=" + urlObj.imgUrl
        );
        scenicName.html(urlObj.scenicGroupName);
      }
    }
  }
  img.removeClass("hide-ele");
  scenicName.removeClass("hide-ele");
  //设置广告条下载链接结束
}
