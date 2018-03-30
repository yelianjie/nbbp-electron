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
        <p class="tip-screen" v-if="sizeSettings[v.id]">屏幕大小：{{sizeSettings[v.id].main.width}} * {{sizeSettings[v.id].main.height}}</p>
        <el-row style="margin-top: 6px;">
          <el-button-group>
            <el-button type="primary" icon="el-icon-edit" @click.native="openSizeDialog(v.id)"></el-button>
            <el-button type="primary" icon="el-icon-plus" @click.native="addSubScreen(i, v.id)"></el-button>
          </el-button-group>
        </el-row>
        <el-row v-for="(vv, ii) in $options.filters.fliterShow(subScreens, v.id)" :key="ii" style="margin-left: 20px;margin-top: 6px;">
          <el-switch
          v-model="vv.data"
          :active-value="v.id + '|' + vv.guid + '|on'"
          :inactive-value="v.id + '|' + vv.guid + '|off'"
          :active-text="'虚拟屏' + (ii + 1)"
          @change="subSwitchChange">
        </el-switch>
        <el-row style="margin-top: 6px;">
          <el-button-group>
            <el-button type="primary" icon="el-icon-edit" @click.native="openSizeVirtualDialog(ii, v.id, vv.guid)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click.native="deleteVirtual(ii, v.id, vv.guid)"></el-button>
          </el-button-group>
        </el-row>
        <p class="tip-screen">屏幕大小：{{sizeSettings[v.id].subs[vv.guid].width}} * {{sizeSettings[v.id].subs[vv.guid].height}}</p>
        </el-row>
      </el-row>
    </div>
    <el-dialog title="屏幕设置" :visible.sync="sizeDialogVisible" :modal="false">
      <el-form class="screen-form" label-width="40px" label-position="left" :model="formLabelAlign">
        <el-form-item label="宽">
          <el-slider v-model="formLabelAlign.width" :max="controlSize.maxX" show-input @change="onSliderChange"></el-slider>
        </el-form-item>
        <el-form-item label="高">
          <el-slider v-model="formLabelAlign.height" :max="controlSize.maxY" show-input @change="onSliderChange"></el-slider>
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
      <!-- <el-button @click.native="openScreen">设置</el-button> -->
    </div>
    
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { changeBgType, getAllMsg, saveBackground } from '../api/'
  import fs from 'fs'
  import path from 'path'
  var showsCopySub
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
        result: {},
        selectId: '-1',
        sizeDialogVisible: false,
        controlSize: {},
        subScreens: [],
        sizeSettings: {},
        editCurDisplay: {}
      }
    },
    components: { SystemInformation },
    methods: {
      openSizeDialog (deviceId) {
        this.editCurDisplay.deviceId = deviceId
        this.editCurDisplay.subDeviceId = null
        this.editCurDisplay.subDeviceData = null
        this.sizeDialogVisible = true
        var curSetting = this.getSizeSetting(deviceId)
        if (curSetting) {
          this.formLabelAlign = curSetting
        }
      },
      openSizeVirtualDialog (index, deviceId, subGuid) {
        this.editCurDisplay.deviceId = deviceId
        this.editCurDisplay.subDeviceId = subGuid
        var curSetting = this.getSizeSetting(deviceId, subGuid)
        if (curSetting) {
          this.formLabelAlign = curSetting
        }
        this.sizeDialogVisible = true
      },
      deleteVirtual (index, deviceId, subGuid) {
        var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
        if (settings[deviceId] && settings[deviceId].subs[subGuid]) {
          delete settings[deviceId].subs[subGuid]
        }
        fs.writeFileSync(
          path.join(this.confirDir, './userData/setting.json'),
          JSON.stringify(settings),
          'utf8'
        )
        this.subScreens.splice(index, 1)
      },
      S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
      },
      guid() {
          return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4())
      },
      addSubScreen (index, deviceId) {
        var subGuid = this.guid()
        this.subScreens.push({guid: subGuid, data: deviceId + '-' + subGuid + '-off'})
        showsCopySub = Object.assign([], this.subScreens)
        this.editCurDisplay.deviceId = deviceId
        this.editCurDisplay.subDeviceId = subGuid
        this.editCurDisplay.subDeviceData = {
          width: 800,
          height: 600,
          x: 0,
          y: 0
        }
        this.saveSetting()
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
        this.$electron.ipcRenderer.send('openScreen', {status: open, ht_id: this.selectBar, deviceId: type == 2 ? subData.parentDeviceId : this.displays[this.clickSelect].id, size: this.formLabelAlign, bgTypeRadio: this.bgTypeRadio, animationRadio: this.animationRadio, type: type, subDeviceId: type == 2 ? subData.subDeviceId : 0})
      },
      onSliderChange () {
        if (this.editCurDisplay.subDeviceId) {
          this.editCurDisplay.subDeviceData = this.formLabelAlign
        }
        this.$electron.ipcRenderer.send('setScreenSize', {ht_id: this.selectBar, deviceId: this.editCurDisplay.deviceId, size: this.formLabelAlign, subDeviceId: this.editCurDisplay.subDeviceId ? this.editCurDisplay.subDeviceId : 0})
        this.saveSetting()
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
      },
      getSizeSetting (deviceId, subDeviceId) {
        var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
        var find = settings[deviceId]
        if (find) {
          if (deviceId && !subDeviceId) {
            return find.main
          } else if (deviceId && subDeviceId) {
            return find.subs[subDeviceId]
          }
        } else {
          return null
        }
      },
      saveSetting () {
        var deviceId = this.editCurDisplay.deviceId
        var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
        if (settings && !this.editCurDisplay.subDeviceId) {
          settings[deviceId].main = this.formLabelAlign
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(settings),
            'utf8'
          )
        } else if (settings && this.editCurDisplay.subDeviceId) {
          if (!settings[deviceId].subs) {
            settings[deviceId].subs = {}
          }
          settings[deviceId].subs[this.editCurDisplay.subDeviceId] = this.editCurDisplay.subDeviceData
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(settings),
            'utf8'
          )
        }
        this.sizeSettings = settings
      },
      getCurrentDeviceId () {
        if (this.activeIndex == -1) {
          return -1
        }
       return this.displays[this.activeIndex].id
      },
      subSwitchChange (v) {
        var params = v.split('|')
        var curSetting = this.getSizeSetting(params[0], params[1])
        if (curSetting) {
          this.formLabelAlign = curSetting
        }
        if (v.indexOf('on') > -1) {
          // 打开分屏
          this.openScreen(true, 2, {parentDeviceId: params[0], subDeviceId: params[1]})
        } else {
          this.openScreen(false, 2, {parentDeviceId: params[0], subDeviceId: params[1]})
        } 
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

      // 设置最大值
      var maxX = 0
      var maxY = 0
      this.displays.forEach((v) => {
        maxX += v.size.width
        if (v.size.height > maxY) {
          maxY = v.size.height
        }
      })
      this.controlSize = {
        maxX: maxX,
        maxY: maxY
      }

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
        // 初始化配置文件
        var isExsitSettingFile = fs.existsSync(path.join(this.confirDir, '/userData/setting.json'))
        if (!isExsitSettingFile) {
          var datas = {}
          displays.forEach((v) => {
            shows.push(false)
            var o = {
              main: {
                width: v.size.width,
                height: v.size.height,
                x: v.bounds.x,
                y: v.bounds.y
              },
              subs: null
            }
            datas[v.id] = o
          })
          if (!fs.existsSync(path.join(this.confirDir, '/userData'))) {
            fs.mkdirSync(path.join(this.confirDir, '/userData'))
          }
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(datas),
            'utf8'
          )
          this.sizeSettings = datas
        } else {
          var settings = JSON.parse(fs.readFileSync(path.join(this.confirDir, './userData/setting.json')))
          displays.forEach((v) => {
            shows.push(false)
            if (!settings[v.id]) {
              var o = {
                main: {
                  width: v.size.width,
                  height: v.size.height,
                  x: v.bounds.x,
                  y: v.bounds.y
                },
                subs: null
              }
              settings[v.id] = o
            }
          })
          fs.writeFileSync(
            path.join(this.confirDir, './userData/setting.json'),
            JSON.stringify(settings),
            'utf8'
          )
          this.sizeSettings = settings
          var subScreens = []
          Object.keys(settings).forEach((v) => {
            if (settings[v].subs) {
              Object.keys(settings[v].subs).forEach((vv) => {
                subScreens.push({guid: vv, data: v + '-' + vv + '-off'})
              }) 
            }
          })
          showsCopySub = Object.assign([], subScreens)
          this.subScreens = subScreens
          //console.log(showsCopySub)
        }
        this.shows = shows
        this.$nextTick(() => {
          this.changeTabScreen(0)
        })
      })
      // 监听大屏幕关闭状态 修改 switch
      this.$electron.ipcRenderer.on('setSwitchOff', function (event, arg) {
        if (!arg.hasOwnProperty('subDeviceId')) {
          var index = _self.displays.findIndex(v => v.id == arg.deviceId)
          if (index > -1 && _self.shows[index]) {
            _self.$set(_self.shows, index, false)
          }
        } else {
          var index = _self.subScreens.findIndex(v => v.data == arg.deviceId + '|' + arg.subDeviceId + '|on')
          if (index > -1 && _self.subScreens[index]) {
            _self.$set(_self.subScreens[index], 'data', arg.deviceId + '|' + arg.subDeviceId + '|off')
          }
        }
        
      })
    },
    filters: {
      fliterShow (screens, deviceId) {
        var arr = screens.filter((v) => {
          return v.data.indexOf(deviceId) != -1
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
          var curSetting = this.getSizeSetting(this.displays[find].id)
          if (curSetting) {
            this.formLabelAlign = curSetting
          }
          // 打开或关闭大屏幕
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
    background: rgba(64, 158, 255, 0.65);
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
  #fixed_left .el-button {
    padding: 6px 12px;
  }
  #fixed_left {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 84px;
    bottom: 0;
    width: 200px;
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
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
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
