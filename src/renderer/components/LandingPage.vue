<template>
  <div id="wrapper">
    <div id="fixed_top">
      <el-row>
        <el-form class="screen-form" label-width="40px" label-position="left">
        <el-form-item label="酒吧">
          <el-select v-model="selectBar" placeholder="请选择">
            <el-option
              v-for="item in bars"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      </el-row>
    </div>
    <div id="fixed_left">
      <p class="screen-out-title">屏幕输出</p>
      <el-row v-for="(v, i) in displays" :key="i" class="screen-out-item" :class="{'active': activeIndex ==i}" @click.prevent="changeTabScreen(i)">
        <el-switch
          v-model="shows[i]"
          :active-text="'Display' + (i + 1)">
        </el-switch>
        <p class="tip-screen">屏幕大小：{{v.size.width}} * {{v.size.height}}</p>
      </el-row>
    </div>
    <div class="main">
      <template v-if="activeIndex != -1">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>屏幕设置</span>
        </div>
        <el-row>
          <el-radio v-model="screenRadio" label="1">自定义</el-radio>
          <el-radio v-model="screenRadio" label="2">全屏</el-radio>
        </el-row>
        <el-form class="screen-form" v-if="displays.length > 0" label-width="40px" label-position="left" :model="formLabelAlign">
          <el-form-item label="宽">
            <el-slider v-model="formLabelAlign.width" :max="displays[0].size.width" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
          <el-form-item label="高">
            <el-slider v-model="formLabelAlign.height" :max="displays[0].size.height" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
          <el-form-item label="x">
            <el-slider v-model="formLabelAlign.x" :max="displays[0].size.width" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
          <el-form-item label="y">
            <el-slider v-model="formLabelAlign.y" :max="displays[0].size.height" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>背景设置</span>
        </div>
        <el-row>
          <el-radio v-model="bgTypeRadio" label="2">视频</el-radio>
          <el-radio v-model="bgTypeRadio" label="1">图片</el-radio>
          <el-radio v-model="bgTypeRadio" label="0">透明</el-radio>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-button plain v-for="(v, i) in showBgs" :class="{'active': v.id == selectId}" :key="i" @click="changeBg(v.url, v.type, v.id)">{{v.name}}</el-button>
        </el-row>
      </el-card>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>消息设置</span>
        </div>
        <el-row>
          <el-radio v-model="animationRadio" label="1">向上滚动</el-radio>
          <el-radio v-model="animationRadio" label="2">弹幕</el-radio>
        </el-row>
      </el-card>
      </template>
      <!-- <el-button @click.native="openScreen">设置</el-button> -->
    </div>
    
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { changeBgType, getAllMsg, saveBackground } from '../api/'
  import fs from 'fs'
  export default {
    name: 'landing-page',
    data () {
      return {
        screenRadio: '2',
        bgTypeRadio: '',
        animationRadio: '1',
        formLabelAlign: {
          width: 0,
          height: 0,
          x: 0,
          y: 0
        },
        bars: [{
          value: '1',
          label: '告白气球酒吧'
        }],
        selectBar: '1',
        displays: [],
        shows: [],
        activeIndex: -1,
        clickSelect: -1,
        result: {},
        selectId: '-1'
      }
    },
    components: { SystemInformation },
    methods: {
      changeBg (url, type, id) {
        this.selectId = id
        type = ~~(type)
        saveBackground({ht_id: this.selectBar, type: type, background_id: id}).then((res) => {})
        this.$electron.ipcRenderer.send('systemSetting', {ht_id: this.selectBar, deviceId: this.displays[this.activeIndex].id, type: 'setBg', value: {url: url, type: type}})
      },
      openScreen (open) {
        // this.$electron.shell.openExternal(link)
        this.formLabelAlign.ht_id = this.selectBar
        var open = open != undefined ? open : true
        this.$electron.ipcRenderer.send('openScreen', {status: open, ht_id: this.selectBar, deviceId: this.displays[this.clickSelect].id, size: this.formLabelAlign, bgTypeRadio: this.bgTypeRadio, animationRadio: this.animationRadio})
      },
      onSliderChange () {
        if (this.clickSelect != -1) {
          this.$electron.ipcRenderer.send('setScreenSize', {ht_id: this.selectBar, deviceId: this.displays[this.clickSelect].id, size: this.formLabelAlign, bgTypeRadio: this.bgTypeRadio, animationRadio: this.animationRadio})
          this.saveSetting()
        }
      },
      changeTabScreen (index) {
        event.stopPropagation()
        this.activeIndex = index
        var settings = JSON.parse(localStorage.getItem('setting'))
        var find = settings[this.displays[index].id]
        if (find) {
          // 设置自定义还是全屏
          this.screenRadio = find.screenRadio
          // 设置宽高xy
          this.formLabelAlign = find.formLabelAlign
          // 设置背景类型
          this.bgTypeRadio = find.bgTypeRadio
          // 设置动画类型
          this.animationRadio = find.animationRadio
        }
      },
      saveSetting () {
        var deviceId = this.displays[this.activeIndex].id
        var settings = JSON.parse(localStorage.getItem('setting'))
        if (settings) {
          settings[deviceId].formLabelAlign = this.formLabelAlign
          settings[deviceId].screenRadio = this.screenRadio
          settings[deviceId].bgTypeRadio = this.bgTypeRadio
          settings[deviceId].animationRadio = this.animationRadio
          localStorage.setItem('setting', JSON.stringify(settings))
        }
      },
      getCurrentDeviceId () {
        if (this.activeIndex == -1) {
          return -1
        }
       return this.displays[this.activeIndex].id
      }
    },
    created () {
      var _self = this
      /*fs.mkdir('./userData',  (error) => {

          fs.writeFileSync(
            './userData/message.txt',
            '456',
            'utf8'
          )
      })*/
      // 获取displays
      let displays = this.$electron.screen.getAllDisplays()
      var shows = []
      this.showsCopy = Object.assign([], this.shows)
      this.displays = displays
      var deviceId = displays[0].id
      getAllMsg({ ht_id: this.selectBar}).then((res) => {
        this.result = res.result
        if (res.result.ht_msg.default_bg_type == '1') {
          // 默认背景是图片
          this.selectId = res.result.bg[0].picId
        } else if (res.result.ht_msg.default_bg_type == '2') {
          // 默认背景是视频
          this.selectId = res.result.bg[0].videoId
        }
        this.bgTypeRadio = res.result.ht_msg.default_bg_type.toString(1)
        // 初始化localStorage
        if (!localStorage.getItem('setting')) {
          var datas = {}
          displays.forEach((v) => {
            shows.push(false)
            var o = {
              screenRadio: '2',
              formLabelAlign: {
                width: v.size.width,
                height: v.size.height,
                x: v.bounds.x,
                y: v.bounds.y,
                full: true
              },
              bgTypeRadio: res.result.ht_msg.default_bg_type.toString(),
              animationRadio: '1'
            }
            datas[deviceId] = o
          })
          localStorage.setItem('setting', JSON.stringify(datas))
        }
        this.shows = shows
        this.$nextTick(() => {
          this.changeTabScreen(0)
        })
      })

      // 监听大屏幕关闭状态 修改 switch
      this.$electron.ipcRenderer.on('setSwitchOff', function (event, arg) {
        var index = _self.displays.findIndex(v => v.id == arg.deviceId)
        if (index > -1 && _self.shows[index]) {
          _self.$set(_self.shows, index, false)
        }
      })
    },
    computed: {
      showBgs () {
        var type = ~~(this.bgTypeRadio)
        if (type >= 0 && this.result.pt_result ) {
          if (type == 0) {
            return []
          } else {
            return this.result.pt_result.filter((v) => ~~(v.type) === type )
          }
        }
      }
    },
    watch: {
      screenRadio (newVal, oldVal) {
        if (!oldVal) {
          return false
        }
        if (newVal == '2') {
          this.formLabelAlign.full = true
        } else {
          this.formLabelAlign.full = false
        }
        var deviceId = this.getCurrentDeviceId()
        if (deviceId != -1) {
          var index = this.displays.findIndex(v => v.id == deviceId)
          if (this.shows[index]) {
            this.openScreen()
          }
        }
        this.saveSetting()
      },
      bgTypeRadio (newVal, oldVal) {
        if (!oldVal) {
          return false
        }
        if (newVal == 0) {
          this.$electron.ipcRenderer.send('systemSetting', {ht_id: this.selectBar, deviceId: this.displays[this.activeIndex].id, type: 'setBg', value: {type: newVal}})
        }
       /* var _self = this
        if (newVal != 0) {
          changeBgType({ ht_id: this.selectBar, type: newVal}).then((res) => {})
        }
        this.$electron.ipcRenderer.send('systemSetting', {ht_id: this.selectBar, deviceId: this.displays[this.activeIndex].id, type: 'setBg', value: newVal})*/
        this.saveSetting()
      },
      animationRadio (newVal, oldVal) {
        var _self = this
        this.$electron.ipcRenderer.send('systemSetting', {ht_id: this.selectBar, deviceId: this.displays[this.activeIndex].id, type: 'setAnimation', value: newVal})
        this.saveSetting()
      },
      shows (newVal, oldVal) {
        if (newVal.length != oldVal.length) {
          return false
        }
        var find = -1
        newVal.forEach((v, i) => {
          if (v != this.showsCopy[i]) {
            find = i
          }
        })
        this.clickSelect = find
        this.showsCopy = Object.assign([], newVal)
        if (find > -1) {
          // 打开或关闭大屏幕
          var _display = this.displays[find]
          console.log(newVal)
          if (newVal[find]) {
            // 打开
            this.openScreen()
          } else {
            this.openScreen(false)
          } 
        }
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #f2f2f2;
  }
  
  ::-webkit-scrollbar-track {
    background-color: #f2f2f2;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #409eff;
    border-radius: 5px;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
  }
  #fixed_top {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    z-index: 1002;
    box-shadow: 0 0 5px 1px rgba(0,0,0,.15);
  }
  #fixed_left {
    position: fixed;
    left: 0;
    top: 84px;
    bottom: 0;
    width: 180px;
    background-color: #fff;
    z-index: 1;
    box-shadow: 0 0 5px 1px rgba(0,0,0,.15);
    padding-top: 20px;
  }
  .screen-form {
    margin-top:  20px;
  }
  .box-card {
    margin-bottom: 60px;
  }
  .main {
    margin: 83px 0 0 180px;
    padding: 30px;
  }
  .tip-screen {
    font-size: 14px;
    margin-top: 6px;
  }
  .screen-out-title {
    text-indent: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  .screen-out-item {
    padding: 20px;
  }
  .screen-out-item.active {
    background-color: #f2f2f2;
  }
  .el-button.is-plain.active {
    background: #fff;
    border-color: #409EFF;
    color: #409EFF;
  }
</style>
