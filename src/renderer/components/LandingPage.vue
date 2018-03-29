<template>
  <div id="wrapper">
    <div id="fixed_top">
      <el-row>
        <el-form style="margin-left: 40px;" class="screen-form" label-width="40px" label-position="left">
        <el-form-item label="酒吧">
          <el-select v-model="selectBar" placeholder="请选择">
            <el-option
              v-for="item in bars"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      </el-row>
    </div>
    <div id="fixed_left">
      <p class="screen-out-title">屏幕输出</p>
      <el-row v-for="(v, i) in displays" :key="i" class="screen-out-item">
        <el-switch
          v-model="shows[i]"
          :active-text="'Display' + (i + 1)">
        </el-switch>
        <p class="tip-screen">屏幕大小：{{v.size.width}} * {{v.size.height}}</p>
        <i class="el-icon-edit" @click="openSizeDialog(i)"></i>
        <i class="el-icon-circle-plus" @click="addSubScreen(i)"></i>
        <el-row v-for="(vv, ii) in $options.filters.fliterShow(subScreens, v.id)" :key="ii" style="margin-left: 20px;">
          <el-switch
          v-model="subScreens[ii]"
          :active-value="v.id + '-' + ii + '-on'"
          :inactive-value="v.id + '-' + ii + '-off'"
          :active-text="'虚拟屏' + (ii + 1)">
        </el-switch>
        <i class="el-icon-edit" @click="openSizeVirtualDialog(ii, v.id)"></i>
        </el-row>
      </el-row>
    </div>
    <el-dialog title="屏幕设置" :visible.sync="sizeDialogVisible" :modal="false">
      <el-form class="screen-form" label-width="40px" label-position="left" :model="formLabelAlign">
        <el-form-item label="宽">
          <el-slider v-model="formLabelAlign.width" :max="controlSize.width" show-input @change="onSliderChange"></el-slider>
        </el-form-item>
        <el-form-item label="高">
          <el-slider v-model="formLabelAlign.height" :max="controlSize.height" show-input @change="onSliderChange"></el-slider>
        </el-form-item>
        <el-form-item label="x">
          <el-slider v-model="formLabelAlign.x" :min="-controlSize.maxX" :max="controlSize.maxX" show-input @change="onSliderChange"></el-slider>
        </el-form-item>
        <el-form-item label="y">
          <el-slider v-model="formLabelAlign.y" :min="-controlSize.maxY" :max="controlSize.maxY" show-input @change="onSliderChange"></el-slider>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="main">
      <template v-if="activeIndex != -1">
      <!-- <el-card class="box-card">
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
            <el-slider v-model="formLabelAlign.x" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
          <el-form-item label="y">
            <el-slider v-model="formLabelAlign.y" show-input @change="onSliderChange"></el-slider>
          </el-form-item>
        </el-form>
      </el-card> -->
      
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
  import path from 'path'
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
        bars: [],
        selectBar: '1',
        displays: [],
        shows: [],
        activeIndex: -1,
        clickSelect: -1,
        clickSelectSub: -1,
        result: {},
        selectId: '-1',
        sizeDialogVisible: false,
        controlSize: {},
        subScreens: [],
        subScreensSize: {}
      }
    },
    components: { SystemInformation },
    methods: {
      openSizeDialog (index) {
        this.sizeDialogVisible = true
        this.initSizeControl(index)
      },
      initSizeControl (index) {
        var maxX = 0
        var maxY = 0
        this.displays.forEach((v) => {
          maxX += v.size.width
          if (v.size.height > maxY) {
            maxY = v.size.height
          }
        })
        this.controlSize = {
          width: this.displays[index].size.width,
          height: this.displays[index].size.height,
          x: this.displays[index].bounds.x,
          y: this.displays[index].bounds.y,
          maxX: maxX,
          maxY: maxY
        }
      },
      openSizeVirtualDialog (index, deviceId) {
        this.sizeDialogVisible = true
        this.formLabelAlign = this.subScreensSize[deviceId][index]
      },
      addSubScreen (index) {
        var deviceId = this.displays[index].id
        var _recordIndex = this.subScreens.length
        console.log(_recordIndex)
        this.subScreens.push(deviceId + '-' + _recordIndex + '-off')
        this.showsCopySub = Object.assign([], this.subScreens)
        if (!this.subScreensSize[deviceId])
          this.subScreensSize[deviceId] = []
        this.$set(this.subScreensSize[deviceId], _recordIndex, {
          width: 800,
          height: 800,
          x: 0,
          y: 0
        })
      },
      changeBg (url, type, id) {
        this.selectId = id
        type = ~~(type)
        saveBackground({ht_id: this.selectBar, type: type, background_id: id}).then((res) => {})
        this.$electron.ipcRenderer.send('systemSetting', {ht_id: this.selectBar, deviceId: this.displays[this.activeIndex].id, type: 'setBg', value: {url: url, type: type}})
      },
      openScreen (open, type, subData) {
        // type 1 主屏 2 为虚拟屏
        type = type ? type : 1
        // this.$electron.shell.openExternal(link)
        this.formLabelAlign.ht_id = this.selectBar
        var open = open != undefined ? open : true
        this.$electron.ipcRenderer.send('openScreen', {status: open, ht_id: this.selectBar, deviceId: type == 2 ? subData.parentDeviceId : this.displays[this.clickSelect].id, size: this.formLabelAlign, bgTypeRadio: this.bgTypeRadio, animationRadio: this.animationRadio, type: type, subIndex: type == 2 ? subData.subIndex : -1})
      },
      onSliderChange () {
        if (this.clickSelect != -1) {
          this.$electron.ipcRenderer.send('setScreenSize', {ht_id: this.selectBar, deviceId: this.displays[this.clickSelect].id, size: this.formLabelAlign, bgTypeRadio: this.bgTypeRadio, animationRadio: this.animationRadio})
          // this.saveSetting()
        }
      },
      changeTabScreen (index) {
        event.stopPropagation()
        this.activeIndex = index
        var find = this.displays.find((v, i) => i == index)
        if (find) {
          this.formLabelAlign = {
            width: find.size.width,
            height: find.size.height,
            x: find.bounds.x,
            y: find.bounds.y
          }
        }
        /*var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
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
        }*/
      },
      saveSetting () {
        var deviceId = this.displays[this.activeIndex].id
        var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
        if (settings) {
          settings[deviceId].formLabelAlign = this.formLabelAlign
          settings[deviceId].screenRadio = this.screenRadio
          settings[deviceId].bgTypeRadio = this.bgTypeRadio
          settings[deviceId].animationRadio = this.animationRadio
          console.log(settings)
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(settings),
            'utf8'
          )
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
      this.confirDir = this.$electron.remote.app.getPath('userData')
      var bars = this.$electron.remote.getGlobal('sharedObject').bars
      this.bars = bars
      if (bars.length > 0) {
        this.selectBar = bars[0].id
      }
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
      this.initSizeControl(0)
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
        displays.forEach((v) => {
          shows.push(false)
        })
        // 初始化配置文件
        /*var isExsitSettingFile = fs.existsSync(path.join(this.confirDir, '/userData/setting.json'))
        if (!isExsitSettingFile) {
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
            datas[v.id] = o
          })
          fs.mkdirSync(path.join(this.confirDir, '/userData'))
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(datas),
            'utf8'
          )
        } else {
          var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
          displays.forEach((v) => {
            shows.push(false)
            if (!settings[v.id]) {
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
              settings[v.id] = o
            }
          })
        }*/
        this.shows = shows
        this.$nextTick(() => {
          this.changeTabScreen(0)
        })
      })
      // 监听大屏幕关闭状态 修改 switch
      this.$electron.ipcRenderer.on('setSwitchOff', function (event, arg) {
        if (!arg.hasOwnProperty('subIndex')) {
          var index = _self.displays.findIndex(v => v.id == arg.deviceId)
          if (index > -1 && _self.shows[index]) {
            _self.$set(_self.shows, index, false)
          }
        } else {
          var index = _self.subScreens.findIndex(v => v == arg.deviceId + '-' + arg.subIndex + '-on')
          if (index > -1 && _self.subScreens[index]) {
            _self.$set(_self.subScreens, index, arg.deviceId + '-' + arg.subIndex + '-off')
          }
        }
        
      })
    },
    filters: {
      fliterShow (screens, deviceId) {
        var arr = screens.filter((v) => {
          return v.indexOf(deviceId) != -1
        })
        return arr
      }
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
        // this.saveSetting()
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
        // this.saveSetting()
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
      },
      subScreens:{
        handler: function(newVal, oldVal) {
          if (newVal.length != oldVal.length) {
            return false
          }
          var find = -1
          newVal.forEach((v, i) => {
            if (v != this.showsCopySub[i]) {
              find = i
            }
          })
          this.clickSelectSub = find
          this.showsCopySub = Object.assign([], newVal)
          if (find > -1) {
            // 打开或关闭大屏幕
            var _display = this.displays[find]
            if (newVal[find].indexOf('on') > -1) {
              // 打开分屏
              this.openScreen(true, 2, {parentDeviceId: newVal[find].split('-')[0], subIndex: find})
            } else {
              this.openScreen(false, 2, {parentDeviceId: newVal[find].split('-')[0], subIndex: find})
            } 
          }
        },
        // 深度观察
        deep:true
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
