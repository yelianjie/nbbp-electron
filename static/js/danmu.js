var faces = [{
  icon: './images/face/high.gif',
  value: 'high'
}, {
  icon: './images/face/aini.gif',
  value: '爱你'
}, {
  icon: './images/face/banguilian.gif',
  value: '扮鬼脸'
}, {
  icon: './images/face/baoya.gif',
  value: '龅牙'
}, {
  icon: './images/face/baobao.gif',
  value: '抱抱'
}, {
  icon: './images/face/baonu.gif',
  value: '暴怒'
}, {
  icon: './images/face/bukan.gif',
  value: '不看'
}, {
  icon: './images/face/bushuo.gif',
  value: '不说'
}, {
  icon: './images/face/buting.gif',
  value: '不听'
}, {
  icon: './images/face/daku.gif',
  value: '大哭'
}, {
  icon: './images/face/daxiao.gif',
  value: '大笑'
}, {
  icon: './images/face/deyi.gif',
  value: '得意'
}, {
  icon: './images/face/fare.gif',
  value: '发热'
}, {
  icon: './images/face/hehe.gif',
  value: '呵呵'
}, {
  icon: './images/face/huai.gif',
  value: '坏'
}, {
  icon: './images/face/jingya.gif',
  value: '惊讶'
}, {
  icon: './images/face/kaixin.gif',
  value: '开心'
}, {
  icon: './images/face/qian.gif',
  value: '钱'
}, {
  icon: './images/face/se.gif',
  value: '色'
}, {
  icon: './images/face/shangxin.gif',
  value: '伤心'
}, {
  icon: './images/face/shengqi.gif',
  value: '生气'
}, {
  icon: './images/face/shengqixiaoniu.gif',
  value: '生气小牛'
}, {
  icon: './images/face/shiwang.gif',
  value: '失望'
}, {
  icon: './images/face/shi.gif',
  value: '屎'
}, {
  icon: './images/face/sikao.gif',
  value: '思考'
}, {
  icon: './images/face/tiaopi.gif',
  value: '调皮'
}, {
  icon: './images/face/tuhao.gif',
  value: '土豪'
}, {
  icon: './images/face/xia.gif',
  value: '吓'
}, {
  icon: './images/face/yun.gif',
  value: '晕'
}];

!(function() {
  var windowWidth

  var bridge = function(datas) {
    windowWidth = window.innerWidth
    this.init(datas)
    $('#bridge').show()
  }
  bridge.prototype.init = function(datas) {
    this.hander = null
    this.avatarWidth = parseInt($('.rank-border').width())
    this.elHeight = parseInt($('.bridge-item').height())
    this.maxP = parseInt($('#bridge').height())
    this.damuPosNum = 3
    this.damuProperty = {
      0: {
        els: [],
        listener: 0,
        quenes: [],
        duration: 10000
      },
      1: {
        els: [],
        listener: 0,
        quenes: [],
        duration: 15000
      },
      2: {
        els: [],
        listener: 0,
        quenes: [],
        duration: 12000
      }
    }
    this.datas = datas;
    this.curMsgIndex = 0
    //this.hander = requestAnimationFrame(this.loop.bind(this))
  }

  bridge.prototype.getDatas = function() {
    return this.datas
  }

  bridge.prototype.getNextData = function() {
    if (this.curMsgIndex + 1 > this.datas.length) {
      this.curMsgIndex = 0
    }
    return this.datas[this.curMsgIndex]
  }

  bridge.prototype.destory = function() {
    for(var i in this.damuProperty) {
      if (this.damuProperty[i].els.length != 0) {
        this.damuProperty[i].els.forEach(function(v) {
          v.obj.stop()
        })
      }
    }
    $('.bridge-item').not('#tmp').remove()
  }

  bridge.prototype.getMaxId = function() {
    if (this.datas.length > 0) {
      var copy = Object.assign([], this.datas)
      copy.sort(function(a, b) {
        return b.id - a.id
      })
      return copy[0].id
    }
    return 0
  }

  bridge.prototype.updateData = function(data) {
    // if (this.)
    data.sort(function(a, b) {
      return b.id - a.id
    })
    var _this = this
    var maxId = data[0].id
    var params = [this.curMsgIndex + 1, 0].concat(data)
    spliceArray(this.datas, params)
    var ndata = Object.assign([], this.datas)
    var ids = []
    ndata.sort(function(a, b) {
      return b.id - a.id
    })
    ndata = ndata.slice(0, 10)
    ndata.forEach(function(v) {
      ids.push(v.id)
    })
    var f = []
    if (this.datas.length != 0) {
      this.datas.forEach(function(v) {
        if ($.inArray(v.id, ids) != -1) {
          f.push(v)
        }
      })
    }
    f.forEach(function(v, i) {
      if (v.id == maxId) {
        _this.curMsgIndex = i
      }
    })
    this.datas = f
  }

  bridge.prototype.replaceData = function(data) {
    this.datas = data
  }

  bridge.prototype.deleteByIds = function(ids) {
    var _self = this
    ids.forEach(function(v, i) {
      _self.datas.forEach(function(vv, ii) {
        if (vv.id == v.id) {
          _self.datas.splice(ii, 1)
        }
      })
    })
  }

  bridge.prototype.getChannel = function() {

    var chanel = 0
    var widths = []
    for (var i in this.damuProperty) {
      var w = 0
      for (var j = 0; j < this.damuProperty[i].els.length; j++) {
        w += this.damuProperty[i].els[j].elwidth
      }
      widths.push(w)
    }
    var min = widths[0];
    for (var i = 1; i < widths.length; i++) {
      if (widths[i] < min) {
        min = widths[i];
        chanel = i
      }
    }
    return chanel
  }

  bridge.prototype.add = function(data, channel) {
    new danmu(data, this, channel)
    this.curMsgIndex += 1
  }

  var danmu = function(data, birdge, channel) {
    if (!data)
      return
    this.bridge = birdge
    this.info = data
    this.el = null
    this.avawidth = birdge.avatarWidth
    this.randomTop = channel != undefined ? this.setPostion(channel) : this.getPostion()
    this.state = 'init'
    this.listenerState = 'unlock'

    this.init()
  }
  danmu.prototype.init = function() {
    //初始化的时候，新增
    this.add();
  }

  danmu.prototype.add = function() {
    //新增一个DOM
    var _self = this
    var info = this.info
    var picSize = info.img ? info.img.substring(info.img.lastIndexOf('?') + 1).split('x') : [0, 1]
    //console.log(window.fontSize, picSize[0], picSize[1])
    var picWidth = parseInt(window.fontSize * 1.1 * picSize[0] / picSize[1])
    this.startWidth = windowWidth
    var tpl = Vue.extend({
      template: `
            <div class="bridge-item" :style="info.bg | filterBg(info.msg_type)">
                <div class="bridge-avatar">
                <template v-if="info.msg_type != 1">
                    <div class="rank-level">
                        <img :src="info.initiator_headimgurl | prefixImageUrl" class="avatar-thumb">
                        <span class="rank-border screen" :class="'level-' + info.mc_level_id"></span>
                        </div>
                </template>
                <template v-else>
                  <div class="rank-level">
                        <span class="rank-border" :class="'level-' + info.mc_level_id"></span>
                        <img :src="info.initiator_headimgurl | prefixImageUrl" class="avatar-thumb">   
                  </div>
                  <div class="to-arrow">
                      <img src="images/arrow-to.png">
                  </div>
                  <div class="to-someone">
                      <img v-if="info.sendee_headimgurl" :src="info.sendee_headimgurl | prefixImageUrl" class="avatar-thumb">
                      <img v-else src="./animations/common_img/all.png" />
                  </div>
                </template>
                </div>
                <div class="bridge-info" :class="{'bp': info.msg_type == 2}">
                    <div class="bridge-main">
                        <div class="bridge-info-top">
                        <template v-if="info.msg_type == 0">
                            <div class="bridge-info-name ncolor">{{info.initiator_nickname}}</div>
                        </template>
                        <template v-if="info.msg_type == 1">
                            <div class="bridge-info-name bold ncolor">{{info.initiator_nickname}}送{{info.title}}给{{receiver}}</div>
                        </template>
                        <template v-if="info.msg_type == 2">
                            <div class="bridge-title ncolor bold">{{info.title}}
                            <span class="arrow arrow-left"></span>
                            <span class="arrow arrow-right"></span>
                            </div>
                        </template>
                        </div>
                        <div class="bridge-info-content">
                            <p v-html="$options.filters.filterFace(info.content, info.msg_type, info.initiator_nickname)"></p>
                        </div>
                    </div>
                    <div class="bridge-user-send-img" v-if="info.img">
                        <img :src="info.img | prefixImageUrl" :width="picWidth">
                    </div>
                    <div class="bridge-user-send-img pro-icon" v-if="info.msg_type == 1">
                        <img :src="info.pro_img | prefixImageUrl" :width="picWidth">
                    </div>
                    <!--<div class="bridge-user-send-img plus" v-if="info.msg_type == 1">
                        <img :src="plusImage">
                    </div>-->
                </div>   
            </div>`,
      data: function() {
        return {
          info: info,
          picWidth: picWidth
        }
      },
      computed: {
        receiver() {
          return this.info.sendee_nickname ? this.info.sendee_nickname : '全场观众'
        },
        plusImage() {
          return './images/plus' + info.odr_num + '.png'
        }
      },
      filters: {
        prefixImageUrl: function(url) {
          if (!url) {
            return
          }
          if (url.indexOf('http') === 0) {
            return url
          }
          return baseURL + url
        },
        filterBg: function(v, type) {
          if (v && type) {
            return "background: -webkit-linear-gradient(left," + v.split(',')[0] + "," + v.split(',')[1] + " 70%," + v.split(',')[1] + ")"
          } else if (type == '1') {
            return "background: -webkit-linear-gradient(left,rgba(249, 157, 252, 0.35),rgba(140, 156, 241, 0.35) 70%,rgba(140, 156, 241, 0.35))"
          }
        },
        filterFace: function(msg, type, fromName) {
          if (!msg) {
            return
          }
          faces.forEach(function(v) {
            var reg = new RegExp('\\[' + v.value + '\\]', 'g')
            msg = msg.replace(reg, '<img src="' + v.icon + '" class="face-icon"/>')
          })
          msg = type == 2 ? fromName + '：' + msg : msg
          return msg
        }
      }
    })
    var component = new tpl().$mount()
    $('#bridge').append(component.$el)
    this.el = $(component.$el)
    this.el[0].style.transform = 'translate3d(' + this.startWidth + 'px,' + this.randomTop + 'px,0)'
    this.el[0].style.willChange = 'transform'
    this.elwidth = $(this.el).width() + this.avawidth
    this.flagId = parseInt(new Date().getTime() / 1000)
    this.bridge.damuProperty[this.channel].els.push({
      id: this.flagId,
      el: this.el[0],
      obj: this
    })
    var duration = parseInt( Math.ceil((this.bridge.damuProperty[this.channel].duration * (this.elwidth + window.innerWidth)) / window.innerWidth / 100 ) * 100)
    anime({
      targets: this.el[0],
      translateX: [this.startWidth, -this.elwidth],
      translateY: [this.randomTop, this.randomTop],
      easing: 'linear',
      duration: duration,
      update: function(anim) {
        var currentValue = parseInt(anim.animations[0].currentValue)
        if(_self.listenerState == 'unlock' && currentValue < window.innerWidth - _self.elwidth) {
          _self.listenerState = 'lock'
          var next = _self.bridge.getNextData()
          if (next != null && next != undefined) {
            _self.bridge.add(next, _self.channel)
          }
        }
      },
      complete: function(anim) {
        _self.destory()
      }
    });
  }

  danmu.prototype.destory = function() {
    var _self = this
    var findIndex = this.bridge.damuProperty[this.channel].els.findIndex(function(v) {
      return v.id == _self.flagId
    })
    if (findIndex > -1) {
      this.bridge.damuProperty[this.channel].els.splice(findIndex, 1)
    }
    this.stop()
    this.el.remove()
  }

  danmu.prototype.stop = function() {
    anime.remove(this.el[0]);
  }

  danmu.prototype.setPostion = function(channel) {
    this.channel = channel
    return parseInt(this.bridge.maxP / (this.bridge.damuPosNum + 1) * (parseInt(channel) + 1)) - parseInt(this.bridge.elHeight / 2)
  }

  window.bridge = bridge

  /*上下滚动*/
  var mmarquee = function(options) {
    var _self = this
    this.settings = {
      space: '10px',
      duration: 2000,
      time: 500
    }
    $.extend(true, this.settings, options)
    this.el = $('.marquee-scroller')
    this.datas = options.datas
    this.curMsgIndex = 0
    for (var i = 0; i < this.datas.length; i++) {
      this.add(this.datas[i])
    }
    $('#marquee').show()
    this.move()
    this.el[0].addEventListener('webkitTransitionEnd', function() {
      _self.el.css('transition', 'none')
      _self.el.children('.marquee-item').eq(0).remove()
      _self.el.css('transform', 'translate3d(0, 0, 0)')
      var _next = _self.getNextData()
      if (_next) {
        _self.add(_next)
        _self.curMsgIndex += 1
      }
    }, false)
  }

  mmarquee.prototype.add = function(data) {
    var _html = '<div class="marquee-item" style="margin-bottom:' + this.settings.space + ';">' + data.content + '</div>'
    $('.marquee-scroller').append(_html)
  }

  mmarquee.prototype.move = function() {
    var _self = this
    setInterval(function() {
      var t = _self.getScrollHeight()
      _self.el.css('transition', 'all ' + _self.settings.time + 'ms linear')
      _self.el.css('transform', 'translate3d(0, -' + t + 'px, 0)')
    }, this.settings.duration)
  }

  mmarquee.prototype.getScrollHeight = function() {
    if (this.el.children('.marquee-item').length > 0) {
      return Number(this.el.children('.marquee-item').eq(0).height()) + parseInt(this.settings.space)
    } else {
      return 0
    }
  }

  mmarquee.prototype.getNextData = function() {
    if (this.curMsgIndex + 1 > this.datas.length) {
      this.curMsgIndex = 0
    }
    return this.datas[this.curMsgIndex]
  }

  window.mmarquee = mmarquee
})()