import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import {hasLogin} from "../../utils/common";


import './index.scss'

export default class Index extends Component {

  config = {
    navigationBarTitleText: 'Giteer'
  }

  componentWillMount () {

    console.log('1')
    if(!hasLogin()){
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }



  render () {
    return (
      <View className='index'>
        <AtButton type='primary'>按钮文案</AtButton>
      </View>
    )
  }
}

