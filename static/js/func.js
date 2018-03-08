function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function prefixImageUrl(url) {
  if (!url) {
    return ''
  }
  if (url.indexOf('http') === 0) {
    return url
  }
  return baseURL + url
}

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

function isArray(o) {
  return Object.prototype.toString.call(o) == '[object Array]';
}

function spliceArray(arr, o) {
  var splice = Array.prototype.splice
  return splice.apply(arr, o)
}

function ajax(url, method, data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
        url: url,
        type: method,
        dataType: 'json',
        data: data
      })
      .done(function(data) {
        resolve(data)
      })
      .fail(function() {
        reject('error')
      })
      .always(function() {});
  })
}

function debounce (fn, delay) {
  // 定时器，用来 setTimeout
  var timer
  // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
  return function () {
    // 保存函数调用时的上下文和参数，传递给 fn
    var context = this
    var args = arguments
    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer)
    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

function throttle (fn, threshhold) {
  // 记录上次执行的时间
  var last
  // 定时器
  var timer
  // 默认间隔为 250ms
  threshhold || (threshhold = 250)
  // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
  return function () {
    // 保存函数调用时的上下文和参数，传递给 fn
    var context = this
    var args = arguments
    var now = +new Date()
    // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshhold) {
      clearTimeout(timer)
      // 保证在当前时间区间结束后，再执行一次 fn
      timer = setTimeout(function () {
        last = now
        fn.apply(context, args)
      }, threshhold)
    // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}

/*var addData = [{
                autograph:"你好呀",
                bg:null,
                city:"成都市",
                content:"尼玛啊",
                create_time:"2018-02-14 12:17:04",
                fabulous_count:"42",
                grade_title:"平民",
                ht_id:"74",
                id:"132",
                img:"/uploads/weixin/20180214/8f5b3e9bd77f72401e2184d5e4dc6257.png",
                initiator_headimgurl:"/uploads/weixin/20180211/2ef72621b4707fe8dc5774e363c1c3f3.png",
                initiator_mc_id:"1",
                initiator_nickname:"田涛",
                lable_bg:null,
                mc_level_id:"1",
                msg_type:"0",
                odr_id:"0",
                odr_no:null,
                odr_pro_id:"0",
                odr_show_time:"0",
                pro_img:"",
                reward_count:"6",
                screen_count:"6",
                sendee_headimgurl:"",
                sendee_mc_id:"0",
                sendee_nickname:"",
                sex:"1",
                status:"1",
                title:null
            }]*/