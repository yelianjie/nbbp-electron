<template>
  <div id="wrapper">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>屏幕设置</span>
      </div>
      <el-row>
        <el-radio v-model="screenRadio" label="1">自定义</el-radio>
        <el-radio v-model="screenRadio" label="2">全屏</el-radio>
      </el-row>
      <el-form class="screen-form" label-width="40px" label-position="left" :model="formLabelAlign">
        <el-form-item label="宽">
          <el-input type="number" v-model.number="formLabelAlign.width"></el-input>
        </el-form-item>
        <el-form-item label="高">
          <el-input type="number" v-model.number="formLabelAlign.height"></el-input>
        </el-form-item>
        <el-form-item label="x">
          <el-input type="number" v-model.number="formLabelAlign.x"></el-input>
        </el-form-item>
        <el-form-item label="y">
          <el-input type="number" v-model.number="formLabelAlign.y"></el-input>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>背景设置</span>
      </div>
      <el-row>
        <el-radio v-model="screenRadio" label="2">视频</el-radio>
        <el-radio v-model="screenRadio" label="1">图片</el-radio>
        <el-radio v-model="screenRadio" label="0">透明</el-radio>
      </el-row>
    </el-card>
    <el-button @click.native="openScreen">设置</el-button>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { changeBgType } from '../api/'
  export default {
    name: 'landing-page',
    data () {
      return {
        screenRadio: '2',
        formLabelAlign: {
          width: 600,
          height: 600,
          x: 0,
          y: 0
        }
      }
    },
    components: { SystemInformation },
    methods: {
      openScreen () {
        // this.$electron.shell.openExternal(link)
        if (this.screenRadio == '1') {
          this.$electron.ipcRenderer.send('openScreen', this.formLabelAlign)
        } else {
          this.$electron.ipcRenderer.send('openScreen', {full: true})
        }
      }
    },
    created () {
      this.$electron.ipcRenderer.on('log', function(event, arg) {
        alert(arg)
      })
    },
    watch: {
      screenRadio (newVal, oldVal) {
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
