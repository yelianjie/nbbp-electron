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
	var windowWidth = window.innerWidth

	var bridge = function (datas) {
		this.init(datas)
        $('#bridge').show()
	}
	bridge.prototype.init = function(datas){
		this.hander = null
         this.avatarWidth = parseInt($('.rank-border').width())
         this.minP = parseInt($('#bridge').css('top'))
		 this.maxP = window.innerHeight - this.minP - $('.bridge-item').height()
	     this.damuPosNum = 3
	     this.damuProperty = {
	        0: {
	            speed: ((windowWidth + this.avatarWidth) / 600).toFixed(2),
	            els: [],
	            listener: 0,
	            quenes: []
	        },
	        1: {
	            speed: ((windowWidth + this.avatarWidth) / 800).toFixed(2),
	            els: [],
	            listener: 0,
	            quenes: []
	        },
	        2: {
	            speed: ((windowWidth + this.avatarWidth) / 700).toFixed(2),
	            els: [],
	            listener: 0,
	            quenes: []
	        }
	    }

	     this.datas = datas;
         this.curMsgIndex = 0
	     this.hander = requestAnimationFrame(this.loop.bind(this))
	}

    bridge.prototype.getNextData = function() {
        if (this.curMsgIndex + 1 > this.datas.length ) {
            this.curMsgIndex = 0
        }
        return this.datas[this.curMsgIndex]
    }

    bridge.prototype.destory = function() {
        $('.bridge-item').not('#tmp').remove()
        cancelAnimationFrame(this.hander)
        $('#bridge').hide()
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
        if (this.datas.length == 0) {
          this.datas.forEach(function(v) {
            if ($.inArray(v.id, ids) != -1) {
                f.push(v)
            }
          })
        } else {
          f = data
        }
        
        f.forEach(function(v, i) {
            if (v.id == maxId) {
                _this.curMsgIndex = i
            }
        })
        this.datas = f
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

    bridge.prototype.loop = function() {

    	var damuProperty = this.damuProperty
    	for (var j in damuProperty) {
            for (var i = 0; i < damuProperty[j].quenes.length; i++) {
                var curDamu = damuProperty[j].quenes[i]
                curDamu.move()

                if (curDamu.listenerState == 'unlock' && curDamu.startWidth < window.innerWidth - curDamu.elwidth) {
                    //console.log("第"+j+"轨道第"+i+"个超了")
                    damuProperty[j].listener = damuProperty[j].listener < damuProperty[j].quenes.length - 1 ? damuProperty[j].listener + 1 : 0
                    curDamu.listenerState = 'lock'
                    var next = this.getNextData()
                    if (next != null && next != undefined) {
                    	this.add(next, j)
                    }

                } else if (curDamu.startWidth <= -curDamu.elwidth) {
                    curDamu.reset()
                    curDamu.destory();
                    damuProperty[j].quenes.splice(i, 1)
                    i--
                }

            }
        }
        this.hander = requestAnimationFrame(this.loop.bind(this))
    }

    var danmu = function(data, birdge, channel) {
        if (!data)
            return
        this.bridge = birdge
        this.info = data
        this.el = null
        this.avawidth = birdge.avatarWidth
        this.randomTop = channel ? this.setPostion(channel) : this.getPostion()
        this.state = 'init'
        this.speed = birdge.damuProperty[this.channel].speed
        this.listenerState = 'unlock'
        
        this.init()
    }
    danmu.prototype.init = function() {
        //初始化的时候，新增
        this.add();
    }

    danmu.prototype.add = function() {
        //新增一个DOM
        var info = this.info
        this.startWidth = windowWidth + this.avawidth / 2
        var tpl = Vue.extend({
          template: `
            <div class="bridge-item" :style="info.bg | filterBg">
                <div class="bridge-avatar">
                <template v-if="info.msg_type != 1">
                    <div class="rank-level">
                        <img :src="info.initiator_headimgurl | prefixImageUrl" class="avatar-thumb">
                        <span class="rank-border" :class="'level-' + info.mc_level_id"></span>
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
                            <p v-html="$options.filters.filterFace(info.content)"></p>
                        </div>
                    </div>
                    <div class="bridge-user-send-img" v-if="info.img">
                        <img :src="info.img | prefixImageUrl">
                    </div>
                    <div class="bridge-user-send-img pro-icon" v-if="info.msg_type == 1">
                        <img :src="info.pro_img | prefixImageUrl">
                    </div>
                    <div class="bridge-user-send-img plus" v-if="info.msg_type == 1">
                        <img :src="plusImage">
                    </div>
                </div>   
            </div>`,
          data: function () {
            return {
              info: info
            }
          },
          computed: {
            receiver () {
              return this.info.sendee_nickname ? this.info.sendee_nickname : '全场观众'
            },
            plusImage () {
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
            filterBg: function(v) {
                if (v) {
                    return "background: -webkit-linear-gradient(left," + v.split(',')[0] + "," + v.split(',')[1] + " 70%," + v.split(',')[1] + ")"
                }
            },
            filterFace: function (msg) {
              if (!msg) {
                return
              }
              faces.forEach(function(v) {
                var reg = new RegExp('\\[' + v.value + '\\]', 'g')
                msg = msg.replace(reg, '<img src="' + v.icon + '" class="face-icon"/>')
              })
              return msg
            }
          }
        })
        var component = new tpl().$mount()
        $('#bridge').append(component.$el)
        // el.style.transform = 'translate3d(' + this.startWidth + 'px,' + this.randomTop + 'px,0)'
        this.el = $(component.$el)
        this.el[0].style.willChange = 'transform'
        this.elwidth = $(this.el).width() + this.avawidth
        this.bridge.damuProperty[this.channel].els.push({
            elwidth: this.elwidth
        })
        this.bridge.damuProperty[this.channel].quenes.push(this)
    }

    danmu.prototype.move = function() {
        this.state = 'move'
        this.startWidth = this.startWidth - this.speed
        this.el[0].style.transform = 'translate3d(' + this.startWidth + 'px,' + this.randomTop + 'px,0)'
    }
    danmu.prototype.reset = function() {
        this.state = 'init'
        this.startWidth = windowWidth + this.avawidth / 2
        this.el[0].style.transform = 'translate3d(' + this.startWidth + 'px,0,0)'
    }
    danmu.prototype.destory = function() {

        this.el.remove()
    }
    danmu.prototype.getPostion = function() {
        var yu = this.bridge.getChannel() % this.bridge.damuPosNum
        this.channel = yu
        return yu == 0 ? parseInt(this.bridge.maxP / (this.bridge.damuPosNum * 2)) : parseInt(this.bridge.maxP / this.bridge.damuPosNum * yu) + parseInt(this.bridge.maxP / (this.bridge.damuPosNum * 2))
    }
    danmu.prototype.setPostion = function(channel) {
	    this.channel = channel
	    return channel == 0 ? parseInt(this.bridge.maxP / (this.bridge.damuPosNum * 2)) : parseInt(this.bridge.maxP / this.bridge.damuPosNum * channel) + parseInt(this.bridge.maxP / (this.bridge.damuPosNum * 2))
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
        for(var i = 0; i < this.datas.length; i++) {
            this.add(this.datas[i])
        }
        $('#marquee').show()
        this.move()
        this.el[0].addEventListener('webkitTransitionEnd', function(){
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

    mmarquee.prototype.add = function(data){
        var _html = '<div class="marquee-item" style="margin-bottom:'+this.settings.space+';">'+data.content+'</div>'
        $('.marquee-scroller').append(_html)
    }

    mmarquee.prototype.move = function(){
    	var _self = this
        setInterval(function(){
        	var t = _self.getScrollHeight()
        	_self.el.css('transition', 'all '+_self.settings.time+'ms linear')
        	_self.el.css('transform', 'translate3d(0, -'+ t +'px, 0)')
        }, this.settings.duration)
    }

    mmarquee.prototype.getScrollHeight = function(){
    	if (this.el.children('.marquee-item').length > 0) {
    		return Number(this.el.children('.marquee-item').eq(0).height()) + parseInt(this.settings.space)
    	} else {
    		return 0
    	}
    }

    mmarquee.prototype.getNextData = function() {
        if (this.curMsgIndex + 1 > this.datas.length ) {
            this.curMsgIndex = 0
        }
        return this.datas[this.curMsgIndex]
    }

    window.mmarquee = mmarquee
})()