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
      <el-row v-for="(v, i) in displays" :key="i" class="screen-out-item">
        <el-switch
          v-model="shows[i]"
          :active-text="'Display' + (i + 1)">
        </el-switch>
        <p class="tip-screen">屏幕大小：{{v.size.width}} * {{v.size.height}}</p>
      </el-row>
    </div>
    <div class="main">
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
      </el-card>
      <el-button @click.native="openScreen">设置</el-button>
    </div>
    
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { changeBgType, getAllMsg } from '../api/'
  import fs from 'fs'
  export default {
    name: 'landing-page',
    data () {
      return {
        screenRadio: '1',
        bgTypeRadio: '',
        formLabelAlign: {
          width: 0,
          height: 0,
          x: 0,
          y: 0
        },
        bars: [{
          value: '2',
          label: '告白气球酒吧'
        }, {
          value: '3',
          label: '牛霸酒吧'
        }],
        selectBar: '2',
        displays: [],
        shows: []
      }
    },
    components: { SystemInformation },
    methods: {
      openScreen () {
        // this.$electron.shell.openExternal(link)
        this.formLabelAlign.ht_id = this.selectBar
        if (this.screenRadio == '1') {
          this.$electron.ipcRenderer.send('openScreen', this.formLabelAlign)
        } else {
          this.$electron.ipcRenderer.send('openScreen', {full: true, ht_id: this.selectBar})
        }
      },
      onSliderChange () {
        this.$electron.ipcRenderer.send('setScreenSize', this.formLabelAlign)
      }
    },
    created () {
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
      displays.forEach((v) => {
        shows.push(false)
      })
      this.shows = shows
      this.showsCopy = Object.assign([], this.shows)
      this.displays = displays
      
      getAllMsg({ ht_id: 2}).then((res) => {
        this.bgTypeRadio = res.result.ht_msg.default_bg_type.toString()
      })
    },
    watch: {
      bgTypeRadio (newVal, oldVal) {
        if (!oldVal) {
          return false
        }
        var _self = this
        if (newVal != 0) {
          changeBgType({ ht_id: 2, type: newVal}).then((res) => {})
        }
      },
      shows (newVal, oldVal) {
        if (newVal.length != oldVal.length) {
          return false
        }
        console.log(newVal, oldVal)
        var find = -1
        newVal.forEach((v, i) => {
          if (v != this.showsCopy[i]) {
            find = i
          }
        })
        console.log(find)
        this.showsCopy = Object.assign([], newVal)
        if (find > -1) {
          // 打开大屏幕
          var _display = this.displays[find]
          /*this.formLabelAlign.width = _display.size.width
          this.formLabelAlign.height = _display.size.height
          this.formLabelAlign.x = _display.bounds.x
          this.formLabelAlign.y = _display.bounds.y*/
          this.openScreen()
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
    z-index: 2;
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
    padding: 20px;
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
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  .screen-out {
    margin-bottom: 20px;
  }
</style>
