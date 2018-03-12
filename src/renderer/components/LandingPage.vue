<template>
  <div id="wrapper">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>酒吧选择</span>
      </div>
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
    </el-card>

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
          value: '91',
          label: '告白气球酒吧'
        }, {
          value: '105',
          label: '牛霸酒吧'
        }],
        selectBar: '91',
        displays: []
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
      this.displays = displays
      this.formLabelAlign.width = displays[0].size.width
      this.formLabelAlign.height = displays[0].size.height
      getAllMsg({ ht_id: 91}).then((res) => {
        this.bgTypeRadio = res.result.ht_msg.default_bg_type
      })
    },
    watch: {
      bgTypeRadio (newVal, oldVal) {
        var _self = this
        if (newVal != 0) {
          changeBgType({ ht_id: 91, type: newVal}).then((res) => {})
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
    padding: 60px 80px;
    width: 100vw;
    overflow-x: hidden;
  }

  .screen-form {
    margin-top:  20px;
  }
  .box-card {
    margin-bottom: 60px;
  }
</style>
